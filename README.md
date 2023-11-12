# setup-voicevox / Voicevox をダウンロードする GitHub Action

Voicevox をダウンロードする GitHub Action。

> **Warning**
> この Action は非公式です。

```yml
- name: Download voicevox
  id: download-voicevox
  uses: sevenc-nanashi/setup-voicevox@v0.1
  with:
    download-item: "core"
    path: voicevox_core
    version: 0.15.0-preview.5
- name: Print location
  run: |
    echo ${{ steps.download-voicevox.outputs.entrypoint }} # => .../voicevox_core/libvoicevox_core.so
```

## 入力（Inputs）

### `download-item`

**必須：** ダウンロードするもの。`engine`、`core`のいずれかを指定します。

### `path`

**必須：** ダウンロード先のパス。`(path)/voicevox_core.dll`/`(path)/run.exe`のようにダウンロードされます。

### `version`

ダウンロードするバージョン。
具体的なバージョン、`latest`/`stable`（最新版）、`prerelease`（最新のプレリリース版）が指定できます。デフォルトは`latest`。

### `repository`

ダウンロード元のリポジトリ。
`default`、`nemo`、`{ユーザー名}/{リポジトリ名}`のいずれかを指定します。
デフォルトは[`VOICEVOX`](https://github.com/voicevox)からダウンロードします。
`nemo`を指定すると、VOICEVOX Nemoのエンジン/コアをダウンロードします。

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

Voicevox のエントリーポイントへのフルパス。
エンジンなら`run`、コアなら`libvoicevox_core.so`（dll/dylib）のフルパスが帰ります。

### `open_jtalk_dic_dir`

Open JTalk の辞書ディレクトリへのフルパス。エンジンダウンロード時は空文字列が帰ります。

## ライセンス

MIT License で公開しています。
