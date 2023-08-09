import main from "../src/index";

describe("Engine downloader", () => {
  it("should download engine", async () => {
    process.env["INPUT_DOWNLOAD-ITEM"] = "engine";
    process.env["INPUT_VERSION"] = "latest";
    process.env["INPUT_GPU"] = "cpu";
    process.env["INPUT_PATH"] = "/tmp/voicevox-engine";
    await main();
  });
});
