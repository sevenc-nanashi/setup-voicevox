import * as core from "@actions/core";
import { inputSchema, Result } from "./common";
import { downloadCore } from "./core";
import { downloadEngine } from "./engine";

const main = async () => {
  const input = inputSchema.parse({
    downloadItem: core.getInput("download-item"),
    path: core.getInput("path"),
    version: core.getInput("version"),
    platform: core.getInput("platform") || "auto",
    gpu: core.getInput("gpu"),
  });

  let res: Result;
  if (input.downloadItem === "engine") {
    res = await downloadEngine(input);
  } else if (input.downloadItem === "core") {
    res = await downloadCore(input);
  } else {
    throw new Error("Unsupported download item");
  }

  return res;
};

if (require.main === module) {
  main()
    .then((res) => {
      core.setOutput("entrypoint", res.entrypoint);
      core.setOutput("open_jtalk_dic_dir", res.openJtalkDicDir);
    })
    .catch((err) => {
      core.setFailed(err.message);
    });
}

export default main;
