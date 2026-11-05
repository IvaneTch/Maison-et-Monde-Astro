import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
process.chdir(root);
const base = '/Maison-et-Monde-Astro';
await rm('.demo', { recursive: true, force: true });
await rm('dist-demo', { recursive: true, force: true });
await mkdir('.demo', { recursive: true });
await cp('src', '.demo/src', { recursive: true });
// Aucun code serveur ni middleware de production n'entre dans la démo.
for (const path of ['pages/admin', 'pages/api', 'lib', 'middleware.ts', 'layouts/AdminLayout.astro']) {
  await rm(`.demo/src/${path}`, { recursive: true, force: true });
}
for (const name of ['contact', 'conciergerie']) {
  await mkdir('.demo/src/lib', { recursive: true });
  await cp(`src/lib/${name}.ts`, `.demo/src/lib/${name}.ts`);
}
async function files(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    result.push(...(entry.isDirectory() ? await files(path) : [path]));
  }
  return result;
}
for (const path of await files('.demo/src')) {
  if (!/\.(astro|ts|css|json)$/.test(path)) continue;
  let content = await readFile(path, 'utf8');
  // Liens, scripts, images, srcset et fonds CSS sous le chemin du dépôt Pages.
  content = content.replace(/(["'`(]|,\s*)(\/(?!\/)[a-zA-Z0-9_#?-])/g, `$1${base}$2`);
  content = content.replace(/(["'`])\/(?=\1)/g, `$1${base}/`);
  if (path.endsWith('/layouts/Layout.astro')) {
    content = content.replace(
      '<body>',
      `<body><aside style="background:#153f39;color:white;padding:12px 20px;text-align:center;font:16px/1.5 sans-serif;position:relative;z-index:1000">Démonstration Maison &amp; Monde — aucun formulaire n’est envoyé. Administration et base de données indisponibles.</aside>`,
    );
    content = content.replace(
      '</head>',
      `<script is:inline>
      document.addEventListener('submit', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }, true);
    </script></head>`,
    );
  }
  // Même sans JavaScript, aucun bouton d'envoi n'est actif.
  content = content.replace(
    /<form\b[^>]*>/g,
    (tag) =>
      tag.replace(/\s(?:action|method)="[^"]*"/g, '') +
      '<p role="note">Mode démonstration : vous pouvez explorer ce formulaire, mais aucun envoi ni enregistrement n’est possible. Ne saisissez pas de données personnelles.</p>',
  );
  content = content.replace(
    /(<button\b[^>]*\btype="submit")/g,
    '$1 disabled title="Envoi indisponible en démonstration"',
  );
  await writeFile(path, content);
}
// Métadonnées de démo, indépendantes du domaine définitif.
const seo = '.demo/src/components/SeoHead.astro';
let content = await readFile(seo, 'utf8');
content = content.replace(
  "const indexable = import.meta.env.PUBLIC_INDEXABLE === 'true';",
  'const indexable = false;',
);
await writeFile(seo, content);
await writeFile(
  '.demo/src/pages/robots.txt.ts',
  "export const GET = () => new Response('User-agent: *\\nDisallow: /\\n', { headers: { 'Content-Type': 'text/plain' } });\n",
);
await rm('.demo/src/pages/sitemap.xml.ts');
const result = spawnSync(
  process.execPath,
  ['node_modules/astro/bin/astro.mjs', 'build', '--config', 'astro.demo.config.mjs'],
  {
    stdio: 'inherit',
    env: { ...process.env, PUBLIC_INDEXABLE: 'false', PUBLIC_SITE_URL: 'https://ivanetch.github.io' },
  },
);
if (result.status !== 0) process.exit(result.status ?? 1);
await writeFile('dist-demo/.nojekyll', '');
