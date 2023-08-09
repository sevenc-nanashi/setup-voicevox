import * as action from "@actions/core";
import * as fs from "fs/promises";
import { tmpdir } from "os";
import path from "path";

import { octokit, Downloader, resolveVersion, download, spawn } from "./common";

export const downloadCore: Downloader = async (options) => {
  const releases = await octokit.rest.repos.listReleases({
    owner: "voicevox",
    repo: "voicevox_core",
    per_page: 100,
  });
  const release = await resolveVersion(options.version, releases.data);
  const latestRelease = await resolveVersion("latest", releases.data);
  action.info(`バージョン：${release.tag_name}`);
  let downloaderName = "download-";
  switch (process.platform) {
    case "win32":
      downloaderName += "windows";
      if (process.arch === "x64") {
        downloaderName += "-x64";
      } else {
        throw new Error("サポートされていないアーキテクチャです。");
      }
      downloaderName += ".exe";
      break;
    case "darwin":
      downloaderName += "osx";
      if (process.arch === "x64") {
        downloaderName += "-x64";
      } else if (process.arch === "arm64") {
        downloaderName += "-arm64";
      } else {
        throw new Error("サポートされていないアーキテクチャです。");
      }
      break;
    case "linux":
      downloaderName += "linux";
      if (process.arch === "x64") {
        downloaderName += "-x64";
      } else if (process.arch === "arm64") {
        downloaderName += "-arm64";
      } else {
        throw new Error("サポートされていないアーキテクチャです。");
      }
      break;
    default:
      throw new Error("Unsupported platform");
  }
  const downloader = latestRelease.assets.find(
    (asset) => asset.name === downloaderName
  );
  if (!downloader) {
    throw new Error("ダウンローダーが見つかりませんでした（バグ？）");
  }
  const downloaderUrl = downloader.browser_download_url;
  let downloaderPath = tmpdir() + "/voicevox_core_downloader";
  if (process.platform === "win32") {
    downloaderPath += ".exe";
  }
  await download(downloaderUrl, downloaderPath);

  if (process.platform !== "win32") {
    await fs.chmod(downloaderPath, 0o755);
  }

  try {
    const platform = options.platform.split("-")[0];
    const arch = options.platform.split("-")[1];
    let device = options.gpu;
    if (device === "gpu") {
      if (platform === "win32") {
        device = "directml";
      } else if (platform === "linux") {
        device = "cuda";
      } else {
        action.warning(
          "Mac では GPU はサポートされていません。CPUにフォールバックします。"
        );
        device = "cpu";
      }
    }
    await spawn(downloaderPath, [
      "--version",
      release.tag_name,
      "--output",
      options.path,
      ...(platform === "auto" ? [] : ["--os", platform, "--cpu-arch", arch]),
      "--device",
      device,
    ]);
  } finally {
    await fs.rm(downloaderPath);
  }

  const downloadDirItems = await fs.readdir(options.path);

  const entrypoint = downloadDirItems.find((item) =>
    item.match(/\.(dll|so|dylib)$/)
  );
  const openJtalkDicDir = downloadDirItems.find((item) =>
    item.includes("open_jtalk_dic")
  );

  if (!entrypoint) {
    throw new Error("エントリポイントが見つかりませんでした（バグ？）");
  }
  if (!openJtalkDicDir) {
    throw new Error("open_jtalkの辞書が見つかりませんでした（バグ？）");
  }

  return {
    entrypoint: path.resolve(process.cwd(), options.path, entrypoint),
    openJtalkDicDir: path.resolve(process.cwd(), options.path, openJtalkDicDir),
  };
};
