// Paint source pixels directly into 32x32 RGBA buffers. Only review sheets enlarge.
// pnpm exec node scripts/lazyPromoPixelArt.mjs [preview-directory] [item-id]
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { sprites } from './lazyPromoRepaint.mjs';
import { sprites as approvedSources } from './lazyPromoSpriteMaps.mjs';

const iconDir=path.resolve('src/lib/resources/images/bso_icons');
const previewDir=path.resolve(process.argv[2] ?? 'output/lazy-promo-pixels');
await fs.mkdir(previewDir,{recursive:true});
const ordered=[...sprites].sort((a,b)=>a.id-b.id);
const selectedID=process.argv[3]===undefined?undefined:Number(process.argv[3]);
if(selectedID!==undefined && !ordered.some(item=>item.id===selectedID))throw Error('Unknown selected item');
if(ordered.length!==37 || ordered.some((item,i)=>item.id!==75700+i)) throw Error('Incomplete sprite inventory');
const painted=[];
for(const item of ordered) {
 const target=path.join(iconDir,`${item.id}.png`);
 let rgba;
 if(item.preserve) {
  // Reproduce the approved 31x29 painting exactly, then add transparent padding.
  const source=approvedSources.find(source=>source.id===item.id);
  if(!source)throw Error(`Missing approved source ${item.id}`);
  const width=Math.max(...source.rows.map(row=>row.length));
  const ox=Math.floor((31-width-2)/2),oy=Math.floor((29-source.rows.length)/2)+1;
  rgba=Buffer.alloc(32*32*4);
  for(const [y,row] of source.rows.entries()) for(const [x,symbol] of [...row].entries()){
   if(symbol==='.')continue;
   for(const dx of [1,2])rgba.set([12,10,8,150],((y+oy)*32+x+ox+dx)*4);
  }
  for(const [y,row] of source.rows.entries()) for(const [x,symbol] of [...row].entries()){
   if(symbol==='.')continue;
   const hex=source.colors[symbol];
   rgba.set([...([1,3,5].map(i=>parseInt(hex.slice(i,i+2),16))),255],((y+oy)*32+x+ox)*4);
  }
 } else {
  const width=Math.max(...item.rows.map(row=>row.length));
  if(width>32 || item.rows.length>32) throw Error(`${item.id}: map ${width}x${item.rows.length} exceeds canvas`);
  const ox=Math.max(0,Math.floor((30-width)/2)),oy=Math.floor((32-item.rows.length)/2);
  rgba=Buffer.alloc(32*32*4);
  const pixels=[];
  for(const [y,row] of item.rows.entries()) for(const [x,symbol] of [...row].entries()) {
   if(symbol==='.')continue;
   const hex=item.colors[symbol];
   if(!hex)throw Error(`${item.id}: unknown pixel ${symbol} at ${x},${y}`);
   const alpha=hex.length===9?parseInt(hex.slice(7,9),16):255;
   if(alpha===255 && x+ox+2>=32)throw Error(`${item.id}: shadow would clip at ${x},${y}`);
   pixels.push({x:x+ox,y:y+oy,color:[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)),alpha});
  }
  // Light beams do not cast shadows. Every shadow stays within two pixels right.
  for(const p of pixels)if(p.alpha===255)for(const dx of [1,2]){
   const offset=(p.y*32+p.x+dx)*4;
   rgba.set([10,8,16,110],offset);
  }
  for(const p of pixels)rgba.set([...p.color,p.alpha],(p.y*32+p.x)*4);
 }
 const png=await sharp(rgba,{raw:{width:32,height:32,channels:4}}).png().toBuffer();
 painted.push({item,target,png});
}
// Validate every map before replacing any icons.
for(const {item,target,png} of painted)if(selectedID===undefined || item.id===selectedID)await fs.writeFile(target,png);
const tiles=[],bankTiles=[];
for(const [i,{item,png}] of painted.entries()) {
 const doubled=await sharp(png).resize(64,64,{kernel:'nearest'}).toBuffer();
 if(item.id===selectedID)await fs.writeFile(path.join(previewDir,`${item.id}-2x.png`),doubled);
 const x=(i%4)*220,y=Math.floor(i/4)*110;
 tiles.push({input:doubled,left:x+78,top:y+8});
 const label=Buffer.from(`<svg width="220" height="30"><text x="110" y="13" text-anchor="middle" fill="#efd29a" font-family="sans-serif" font-size="11">${item.id} · ${item.name}</text><text x="110" y="27" text-anchor="middle" fill="#bfb5a4" font-family="sans-serif" font-size="10">32×32 · 2× review</text></svg>`);
 tiles.push({input:label,left:x,top:y+76});
 bankTiles.push({input:doubled,left:(i%8)*116+26,top:Math.floor(i/8)*88+10});
}
await sharp({create:{width:880,height:Math.ceil(painted.length/4)*110,channels:4,background:'#484336'}}).composite(tiles).png().toFile(path.join(previewDir,'lazy-32px-review.png'));
await sharp({create:{width:928,height:440,channels:4,background:'#484336'}}).composite(bankTiles).png().toFile(path.join(previewDir,'lazy-bank-preview.png'));
console.log(`Saved ${selectedID===undefined?'37 native 32x32 PNGs':`${selectedID} at native 32x32`}. Shadows bounded; 2x sheets rendered.`);
