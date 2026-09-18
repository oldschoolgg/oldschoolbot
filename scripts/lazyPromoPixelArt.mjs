// Render authored pixel maps at native resolution; enlargement is for previews only.
// pnpm exec node scripts/lazyPromoPixelArt.mjs [preview-directory]
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { sprites } from './lazyPromoSpriteMaps.mjs';

const iconDir = path.resolve('src/lib/resources/images/bso_icons');
const previewDir = path.resolve(process.argv[2] ?? 'output/lazy-promo-pixels');
const backupDir = path.join(previewDir, 'before-patreon-style');
await fs.mkdir(backupDir, { recursive: true });
const tiles = [];
const nativeTiles = [];
const ids = new Set();
for (const [index, item] of sprites.entries()) {
  if (ids.has(item.id)) throw new Error(`Duplicate sprite ${item.id}`);
  ids.add(item.id);
  const width = Math.max(...item.rows.map(row => row.length));
  if (width > 29 || item.rows.length > 29) throw new Error(`${item.id} exceeds frame including its two-pixel shadow`);
  const rgba = Buffer.alloc(31 * 29 * 4);
  const ox = Math.floor((31 - width - 2) / 2);
  const oy = Math.floor((29 - item.rows.length) / 2);
  // Crisp two-pixel rightward shadow, kept underneath the authored silhouette.
  for (const [y, row] of item.rows.entries()) {
    for (const [x, symbol] of [...row].entries()) {
      if (symbol === '.') continue;
      for (const dx of [1, 2]) {
        const offset = ((y + oy) * 31 + x + ox + dx) * 4;
        rgba[offset] = 12;
        rgba[offset + 1] = 10;
        rgba[offset + 2] = 8;
        rgba[offset + 3] = 150;
      }
    }
  }
  for (const [y, row] of item.rows.entries()) {
    for (const [x, symbol] of [...row].entries()) {
      if (symbol === '.') continue;
      const hex = item.colors[symbol];
      if (!hex) throw new Error(`${item.id}: unknown pixel ${symbol} at ${x},${y}`);
      const offset = ((y + oy) * 31 + x + ox) * 4;
      rgba[offset] = parseInt(hex.slice(1, 3), 16);
      rgba[offset + 1] = parseInt(hex.slice(3, 5), 16);
      rgba[offset + 2] = parseInt(hex.slice(5, 7), 16);
      rgba[offset + 3] = 255;
    }
  }
  const target = path.join(iconDir, `${item.id}.png`);
  await fs.copyFile(target, path.join(backupDir, `${item.id}.png`), fs.constants.COPYFILE_EXCL).catch(error => {
    if (error.code !== 'EEXIST') throw error;
  });
  const png = await sharp(rgba, { raw: { width: 31, height: 29, channels: 4 } }).png().toBuffer();
  await fs.writeFile(target, png);
  const left = (index % 6) * 186;
  const top = Math.floor(index / 6) * 163;
  tiles.push({ input: await sharp(png).resize(124, 116, { kernel: 'nearest' }).toBuffer(), left: left + 31, top });
  const label = `<svg width="186" height="42"><text x="93" y="15" text-anchor="middle" fill="#e6c785" font-family="sans-serif" font-size="11">${item.id} · ${item.name}</text><text x="93" y="31" text-anchor="middle" fill="#b9af94" font-family="sans-serif" font-size="10">31×29 · shown at 4×</text></svg>`;
  tiles.push({ input: Buffer.from(label), left, top: top + 118 });
  nativeTiles.push({ input: png, left: (index % 8) * 58 + 13, top: Math.floor(index / 8) * 47 + 9 });
}
if (sprites.length !== 37 || [...ids].some(id => id < 75700 || id > 75736)) throw new Error('Incomplete promo set');
await sharp({ create: { width: 1116, height: Math.ceil(sprites.length / 6) * 163, channels: 4, background: '#484336' } })
  .composite(tiles).png().toFile(path.join(previewDir, 'lazy-patreon-style.png'));
const native = await sharp({ create: { width: 464, height: 235, channels: 4, background: '#484336' } })
  .composite(nativeTiles).png().toBuffer();
await fs.writeFile(path.join(previewDir, 'lazy-native-grid.png'), native);
await sharp(native).resize(928, 470, { kernel: 'nearest' }).png().toFile(path.join(previewDir, 'lazy-bank-preview.png'));
console.log('Rendered all 37 authored 31×29 sprites; native and enlarged review sheets saved.');
