import { execFileSync } from 'node:child_process';
import { copyFile, cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const output = new URL('release/focus-timer-windows-x64/', root);
await mkdir(new URL('dependency-sources/', output), { recursive: true });
const executable = resolve(process.argv[2] ?? fileURLToPath(new URL('src-tauri/target/release/focus-timer.exe', root)));
await copyFile(executable, new URL('focus-timer.exe', output));
await copyFile(new URL('release/THIRD-PARTY-NOTICES.txt', root), new URL('THIRD-PARTY-NOTICES.txt', output));

const metadata = JSON.parse(execFileSync('cargo', [
  'metadata', '--manifest-path', fileURLToPath(new URL('src-tauri/Cargo.toml', root)),
  '--locked', '--offline', '--format-version', '1', '--filter-platform', 'x86_64-pc-windows-msvc'
], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }));

const sources = [];
for (const pkg of metadata.packages.filter(pkg => pkg.source?.startsWith('registry+'))) {
  const directory = dirname(pkg.manifest_path);
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!/^(licen[cs]e|copying|notice|copyright|authors)([._-]|$)/i.test(entry.name)) continue;
    const destination = new URL(`license-files/${pkg.name}-${pkg.version}/`, output);
    await mkdir(destination, { recursive: true });
    await cp(join(directory, entry.name), new URL(entry.name, destination), { recursive: true });
  }
}
await cp(new URL('third-party/', root), new URL('license-files/third-party/', output), { recursive: true });
for (const pkg of metadata.packages.filter(pkg => pkg.license?.includes('MPL-2.0'))) {
  if (!pkg.source?.startsWith('registry+')) throw new Error(`ソースの取得方法を確認してください: ${pkg.name}`);
  const registry = dirname(dirname(pkg.manifest_path));
  const filename = `${pkg.name}-${pkg.version}.crate`;
  const archive = join(dirname(dirname(registry)), 'cache', registry.split(/[\\/]/).at(-1), filename);
  const content = await readFile(archive);
  const hash = createHash('sha256').update(content).digest('hex');
  await copyFile(archive, new URL(`dependency-sources/${filename}`, output));
  sources.push(`${filename}\nSHA-256: ${hash}\nhttps://crates.io/crates/${pkg.name}/${pkg.version}\n`);
}
const sysroot = execFileSync('rustc', ['--print', 'sysroot'], { encoding: 'utf8' }).trim();
const rustDocs = join(sysroot, 'share', 'doc', 'rust');
await mkdir(new URL('rust-licenses/', output), { recursive: true });
await copyFile(join(rustDocs, 'COPYRIGHT-library.html'), new URL('rust-licenses/COPYRIGHT-library.html', output));
await cp(join(rustDocs, 'licenses'), new URL('rust-licenses/licenses/', output), { recursive: true });
await writeFile(new URL('dependency-sources/SOURCES.txt', output),
  'MPL-2.0 対象の未改変ソースです。.crate は tar.gz 形式です。\n各ソースのライセンスと著作権表示はアーカイブ内に保持しています。\n\n' + sources.join('\n'));
await writeFile(new URL('はじめに.txt', output),
  'focus-timer.exe を実行してください。WebView2 ランタイムが必要です。\n\n第三者ライセンス一覧は THIRD-PARTY-NOTICES.txt、配布元の表記原文は license-files フォルダを参照してください。\nMPL-2.0 対象ソースは dependency-sources フォルダに同梱しています。\nRust 標準ライブラリの表記は rust-licenses フォルダを参照してください。\n');
console.log(`配布フォルダを作成しました。MPL 対象ソース: ${sources.length}件`);
