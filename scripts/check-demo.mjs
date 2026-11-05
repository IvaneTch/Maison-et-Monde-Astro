import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const directory = resolve('dist-demo');
const base = '/Maison-et-Monde-Astro';
async function files(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    result.push(...(entry.isDirectory() ? await files(path) : [path]));
  }
  return result;
}
const paths = await files(directory);
assert(!paths.some((path) => /\/(admin|api|server)\//.test(path)), 'Code serveur publié');
const errors = new Set();
async function check(url) {
  if (!url.startsWith('/') || url.startsWith('//')) return;
  if (!url.startsWith(`${base}/`)) {
    errors.add(`Chemin hors démo : ${url}`);
    return;
  }
  const path = decodeURIComponent(url.split(/[?#]/)[0].slice(base.length));
  let target = resolve(directory, `.${path}`);
  try {
    if ((await stat(target)).isDirectory()) target += '/index.html';
    await stat(target);
  } catch {
    errors.add(`Destination absente : ${url}`);
  }
}
let htmlCount = 0;
for (const path of paths) {
  if (!/\.(html|css)$/.test(path)) continue;
  const content = await readFile(path, 'utf8');
  if (path.endsWith('.html')) {
    htmlCount++;
    if (content.includes('<body>') && !content.includes('http-equiv="refresh"')) {
      assert(content.includes('noindex,nofollow'), `Indexation active : ${path}`);
      assert(content.includes('Démonstration Maison'), `Bandeau absent : ${path}`);
    }
    for (const [button] of content.matchAll(/<button\b[^>]*type="submit"[^>]*>/g)) {
      assert(/\bdisabled\b/.test(button), `Envoi actif : ${path}`);
    }
    for (const [, url] of content.matchAll(/\b(?:href|src)="([^"]+)"/g)) await check(url);
    for (const [, srcset] of content.matchAll(/\bsrcset="([^"]+)"/g)) {
      for (const candidate of srcset.split(',')) await check(candidate.trim().split(/\s/)[0]);
    }
  }
  for (const [, url] of content.matchAll(/url\(["']?([^)'"\s]+)["']?\)/g)) await check(url);
}
assert.equal(errors.size, 0, [...errors].join('\n'));
assert(htmlCount > 25, 'Pages publiques manquantes');
assert.equal(await readFile(`${directory}/robots.txt`, 'utf8'), 'User-agent: *\nDisallow: /\n');
console.log(
  `Démo vérifiée : ${htmlCount} pages HTML, liens et images présents, formulaires désactivés, aucun serveur publié.`,
);
