# 集中タイマー

時間の指定、開始・一時停止、停止中のお知らせ、編集できるタスク一覧を備えた小さな Tauri 2 デスクトップアプリです。

要件・仕様・採用理由・デザイン方針は [timer-requirements.md](timer-requirements.md) を参照してください。

## ダウンロード

[Releases](https://github.com/paruma/timer202611/releases) から Windows 版の ZIP をダウンロードし、展開して `focus-timer.exe` を実行してください。

## Windows 版の作成

利用対象は Windows です。Windows PowerShell でプロジェクトのルートから次のコマンドを実行してください。

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\windows.ps1 -Run
```

Windows 側の Rust と Microsoft C++ Build Tools を使い、`%TEMP%\timer202611-windows-build` でビルドします。生成した実行ファイルはプロジェクトの `windows-app\focus-timer.exe` にもコピーします。`-Run` を省略するとビルドだけ行います。ソースが WSL 内にあっても使用できます。

## 開発用の起動

Windows 側に Node.js（LTS 推奨）、npm、Rust（stable・MSVC 版）、Microsoft C++ Build Tools の「C++ によるデスクトップ開発」、WebView2 が必要です。導入手順は [Tauri の前提環境](https://v2.tauri.app/start/prerequisites/)を参照してください。

Windows 側のターミナルで、プロジェクトのルートから次のコマンドを実行してください。

```sh
npm ci
npm run desktop
```

## 配布用ビルド

```sh
npm run desktop:build
```

出力先は `src-tauri/target/release/bundle/` です。

GitHub Actions でも Windows 版をビルドします。`v` から始まるバージョンタグを付けると、実行ファイル・第三者ライセンス・対応ソースをまとめた ZIP を Releases に公開します。

## 画面の編集

画面のソースは `timer.html` です。起動・ビルド前に `scripts/prepare-frontend.mjs` がこのファイルを `dist/index.html` へコピーします。

ブラウザ版は `timer.html` を直接開いて使えます。HTML の変更は再読み込みで反映されます。

デスクトップ版では HTML を実行ファイルに組み込むため、変更を反映するには再ビルドが必要です。`npm run desktop` で開発している場合は、このコマンドを実行し直してください。Windows 版の実行ファイルを更新する場合は、アプリを閉じてから `scripts/windows.ps1 -Run` を実行してください。
