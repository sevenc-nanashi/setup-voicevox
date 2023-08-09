import type { Endpoints } from "@octokit/types";
import axios from "axios";
import { spawn as spawnBase } from "child_process";
import { createWriteStream } from "fs";
import fetch from "node-fetch";
import { Octokit } from "octokit";
import * as semver from "semver";
import { z } from "zod";

export const inputSchema = z.object({
  downloadItem: z.enum(["engine", "core"]),
  path: z.string(),
  version: z.string().default("latest"),
  platform: z
    .enum([
      "auto",
      "windows-x64",
      "windows-x86",
      "osx-x64",
      "osx-arm64",
      "linux-x64",
      "linux-arm64",
    ])
    .default("auto"),
  gpu: z.enum(["cpu", "gpu", "directml", "cuda"]).default("cpu"),
});
export type Result = {
  entrypoint: string;
  openJtalkDicDir: string;
};
export type Downloader = (
  options: z.infer<typeof inputSchema>
) => Promise<Result>;
export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  request: {
    fetch,
  },
});

export type Release =
  Endpoints["GET /repos/{owner}/{repo}/releases"]["response"]["data"][number];

/**
 * バージョンを解決する。
 * @param version バージョン
 * @param releases リリース一覧
 *
 * @returns 解決されたバージョン。
 */
export const resolveVersion = async (
  version: string,
  releases: Release[]
): Promise<Release> => {
  if (["latest", "stable", "prerelease"].includes(version)) {
    let filteredReleases: Endpoints["GET /repos/{owner}/{repo}/releases"]["response"]["data"];

    if (["latest", "stable"].includes(version)) {
      filteredReleases = releases.filter(
        (release) => !release.prerelease && !release.draft
      );
      filteredReleases.sort((a, b) => {
        return semver.compare(a.tag_name, b.tag_name);
      });
    } else {
      filteredReleases = releases;
      filteredReleases.sort((a, b) => {
        if (!a.published_at || !b.published_at) {
          return 0;
        }
        return a.published_at.localeCompare(b.published_at);
      });
    }
    return filteredReleases[filteredReleases.length - 1];
  }
  for (const release of releases) {
    if (release.tag_name === version) {
      return release;
    }
  }
  throw new Error(`バージョン ${version} が見つかりませんでした。`);
};

/**
 * URLからパスにダウンロードする。
 * @param url URL
 * @param path パス
 * @returns ダウンロードされたパス
 */
export const download = async (url: string, path: string) => {
  const downloaderReq = await axios.get(url, {
    responseType: "stream",
  });
  const downloaderStream = downloaderReq.data.pipe(createWriteStream(path));
  await new Promise((resolve, reject) => {
    downloaderStream.on("finish", resolve);
    downloaderStream.on("error", reject);
  });
};

/**
 * コマンドを実行する。
 *
 * @param command コマンド
 * @param args 引数
 */
export const spawn = async (command: string, args: string[]) => {
  const child = spawnBase(command, args, {
    stdio: "inherit",
  });
  return new Promise<void>((resolve, reject) => {
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`コマンドが失敗しました（${code}）`));
      }
    });
  });
};

/**
 * ランダムな文字列を生成する。
 *
 * @param length 長さ
 * @returns ランダムな文字列
 */
export const randomString = (length: number) => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};
