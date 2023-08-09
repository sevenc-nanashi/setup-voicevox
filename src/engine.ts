import * as action from "@actions/core";
import axios from "axios";
import fs from "fs/promises";
import { tmpdir } from "os";

import {
  octokit,
  resolveVersion,
  Downloader,
  download,
  spawn,
  randomString,
  Release,
} from "./common";
import { download7z } from "./sevenzip";

export const downloadEngine: Downloader = async (options) => {
  const releases = await octokit.rest.repos.listReleases({
    owner: "voicevox",
    repo: "voicevox_engine",
    per_page: 100,
  });
  const release = await resolveVersion(options.version, releases.data);
  action.info(`バージョン：${release.tag_name}`);
  let engineName = "";
  switch (process.platform) {
    case "win32":
      engineName += "windows";
      break;
    case "darwin":
      engineName += "macos";
      break;
    case "linux":
      engineName += "linux";
      break;
    default:
      throw new Error("Unsupported platform");
  }
  let suffix: string = options.gpu;
  if (suffix === "gpu") {
    if (process.platform === "win32") {
      suffix = "directml";
    }
    if (process.platform === "linux") {
      suffix = "cuda";
    }
  }
  if (suffix === "cuda") {
    suffix = "nvidia";
  }
  if (process.platform === "darwin" && suffix !== "cpu") {
    action.warning(
      "Mac では GPU はサポートされていません。CPU にフォールバックします。"
    );
    suffix = "x64";
  }
  engineName += `-${suffix}`;
  const assetName = `voicevox_engine-${engineName}`;
  const fileListAsset = release.assets.find(
    (asset) => asset.name.startsWith(assetName) && asset.name.endsWith(".txt")
  );
  if (!fileListAsset) {
    throw new Error("ファイルリストが見つかりませんでした（バグ？）");
  }
  const fileListUrl = fileListAsset.browser_download_url;
  const fileList: string[] = await axios
    .get(fileListUrl, { responseType: "text" })
    .then((l) => l.data.trim().split("\n"));

  const baseEngineAssets = fileList.map((fileName) =>
    release.assets.find((asset) => asset.name === fileName)
  );
  if (baseEngineAssets.some((asset) => !asset)) {
    throw new Error("ファイルが見つかりませんでした（バグ？）");
  }
  const engineAssets = baseEngineAssets.flatMap((asset) =>
    asset ? [asset] : []
  );

  action.info(`ファイル数：${engineAssets.length}`);
  await Promise.all(
    engineAssets.map(async (asset) => {
      const engineUrl = asset.browser_download_url;
      const enginePath = tmpdir() + "/" + asset.name;
      await download(engineUrl, enginePath);
    })
  );
  const sevenZip = await download7z();
  const tempDownload = tmpdir() + "/tmp-voicevox-engine-" + randomString(8);
  action.info("エンジンを解凍中...");
  await spawn(sevenZip, [
    "x",
    "-y",
    "-bd",
    "-o" + tempDownload,
    tmpdir() + "/" + engineAssets[0].name,
  ]);
  await fs.rename(tempDownload + "/" + engineName, options.path);

  if (process.platform !== "win32") {
    await fs.chmod(options.path + "/run", 0o755);
  }

  await fs.rm(tempDownload, { recursive: true });

  action.info("完了しました。");

  return {
    entrypoint:
      options.path + (process.platform === "win32" ? "/run.exe" : "/run"),
    openJtalkDicDir: "",
  };
};
