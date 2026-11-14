import { mkdir, copyFile } from 'node:fs/promises';

// ブラウザ版とデスクトップ版で同じ画面を使う。
const root = new URL('../', import.meta.url);
await mkdir(new URL('dist/', root), { recursive: true });
await copyFile(new URL('timer.html', root), new URL('dist/index.html', root));
