# 変更後の検証

- HTML・JavaScript・ESLint 設定を変更したら `pnpm run check` を実行する。
- Rust を変更したら `pnpm run format:rust` で整形し、`pnpm run check:rust` を実行する。整形差分は今回の変更範囲を確認する。
- コミット前に `pnpm run hooks:install` でこのリポジトリの hook を有効にする。検査に失敗したら修正し、再実行して成功を確認する。
- 実行できない検査は、その理由と未検証の範囲を報告する。
