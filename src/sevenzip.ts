import { tmpdir } from "os";
import path from "path";
import { download, spawn } from "./common";

export const download7z = async () => {
  const distPath = tmpdir();
  let url: string;
  let executableName: string;
  switch (process.platform) {
    case "win32": {
      const sevenzrUrl = "https://www.7-zip.org/a/7zr.exe";
      const sevenzrPath = path.resolve(distPath, "7zr.exe");
      await download(sevenzrUrl, sevenzrPath);

      return distPath;
    }
    case "linux": {
      url = "https://www.7-zip.org/a/7z2201-linux-x64.tar.xz";
      executableName = "7zzs";
      break;
    }
    case "darwin": {
      url = "https://www.7-zip.org/a/7z2107-mac.tar.xz";
      executableName = "7zz";
      break;
    }
    default: {
      throw new Error("Unsupported platform");
    }
  }
  const tmpPath = path.resolve(tmpdir(), "7z.tar.xz");
  await download(url, tmpPath);
  await spawn("tar", ["xf", tmpPath, "--directory", distPath, executableName]);
  return path.resolve(distPath, executableName);
};
