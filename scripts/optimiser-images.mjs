import sharp from 'sharp';
import { readdir, mkdir, writeFile, stat, copyFile } from 'node:fs/promises';
import path from 'node:path';
async function fichiers(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) => (e.isDirectory() ? fichiers(path.join(dir, e.name)) : path.join(dir, e.name))),
    )
  ).flat();
}
const sourceDir = process.env.IMAGE_SOURCE || '.local/originaux/images';
const photos = (await fichiers(sourceDir)).filter(
  (p) => /\.(jpg|jpeg)$/.test(p) || /menage-ponctuel.*\.png$/.test(p),
);
const manifest = {},
  redirects = {};
let avant = 0,
  apres = 0;
for (const fichier of photos) {
  const relative = 'images/' + path.relative(sourceDir, fichier);
  const cible = ('public/' + relative).replace(/\.(jpe?g|png)$/i, '.webp');
  const url = '/' + cible.slice(7);
  const copie = '.local/originaux/' + relative;
  await mkdir(path.dirname(copie), { recursive: true });
  if (fichier !== copie) await copyFile(fichier, copie);
  const image = sharp(fichier).rotate();
  const meta = await image.metadata();
  const result = await image
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 81, effort: 5 })
    .toFile(cible);
  const variantes = [];
  for (const width of [480, 960]) {
    if (width < result.width) {
      const variant = cible.replace('.webp', `-${width}.webp`);
      const r = await sharp(fichier)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 79, effort: 5 })
        .toFile(variant);
      variantes.push({ url: '/' + variant.slice(7), width: r.width });
    }
  }
  variantes.push({ url, width: result.width });
  manifest[url] = {
    width: result.width,
    height: result.height,
    srcset: variantes.map((v) => `${v.url} ${v.width}w`).join(', '),
  };
  redirects['/' + relative] = url;
  avant += (await stat(fichier)).size;
  apres += result.size;
}
await mkdir('src/data', { recursive: true });
await writeFile('src/data/images.json', JSON.stringify(manifest, null, 2));
await writeFile('src/data/images-anciennes.json', JSON.stringify(redirects, null, 2));
console.log({
  photos: photos.length,
  avantMo: (avant / 1e6).toFixed(2),
  webpPrincipauxMo: (apres / 1e6).toFixed(2),
  reduction: Math.round(100 * (1 - apres / avant)) + '%',
});
