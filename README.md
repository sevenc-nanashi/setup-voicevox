# setup-voicevox / Voicevox をダウンロードする GitHub Action

Voicevox をダウンロードする GitHub Action。

> **Warning**
> この Action は非公式です。

## 入力（Inputs）

### `download-item`

**必須：** ダウンロードするもの。`engine`または`core`を指定します。

### `path`

**必須：** ダウンロード先のパス。`(path)/voicevox_core.dll`/`(path)/run.exe`のようにダウンロードされます。

### `version`

ダウンロードするバージョン。
具体的なバージョン、`latest`/`stable`（最新版）、`prerelease`（最新のプレリリース版）が指定できます。デフォルトは`latest`。

### `platform`

ダウンロードするプラットフォーム。
`windows-x64`、`windows-x86`、`osx-x64`、`osx-arm64`、`linux-x64`、`linux-arm64`のいずれかを指定します。
デフォルトは Runner のプラットフォーム。

### `gpu`

GPU 版をダウンロードするかどうか。
`cpu`、`gpu`、`directml`、`cuda`のいずれかを指定します
。`gpu`では、Windows では DirectML 版、それ以外では CUDA 版をダウンロードします。
デフォルトは`cpu`。

## 出力（Outputs）

### `entrypoint`

Voicevox のエントリーポイント。`run.exe`または`voicevox_core.dll`のいずれかです。

### `open_jtalk_dic_dir`

Open JTalk の辞書ディレクトリへのフルパス。エンジンダウンロード時は空文字列になります。

## ライセンス

MIT License で公開しています。
