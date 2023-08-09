import main from "../src/index";

describe("Core downloader", () => {
  it("should download core", async () => {
    process.env["INPUT_DOWNLOAD-ITEM"] = "core";
    process.env["INPUT_VERSION"] = "latest";
    process.env["INPUT_GPU"] = "cpu";
    process.env["INPUT_PATH"] = "/tmp/voicevox-core";
    await main();
  });
});
