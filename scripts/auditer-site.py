"""Audit HTTP des routes publiques, ancres, images et métadonnées (sans envoi de formulaire)."""
from html.parser import HTMLParser
from urllib.request import urlopen
from urllib.parse import urljoin,urlsplit,unquote
from pathlib import Path
import re,sys,json
base=(sys.argv[1] if len(sys.argv)>1 else 'http://localhost:4321').rstrip('/')
paths=re.findall(r"\['([^']+)'\s*,",Path('src/data/pages.ts').read_text())
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=set();self.links=[];self.images=set();self.h1=0;self.main=0;self.canonical=0;self.description=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.add(a['id'])
  if tag=='h1':self.h1+=1
  if tag=='main':self.main+=1
  if tag=='a' and a.get('href'):self.links.append(a['href'])
  if tag=='img':
   if a.get('src'):self.images.add(a['src'])
   for part in a.get('srcset','').split(','):
    if part.strip():self.images.add(part.strip().split()[0])
  if tag=='link' and a.get('rel')=='canonical':self.canonical+=1
  if tag=='meta' and a.get('name')=='description' and a.get('content'):self.description+=1
cache={};errors=[];images=set()
def get(path):
 if path not in cache:
  try:
   with urlopen(base+path,timeout=12) as r:
    content=r.read().decode();p=Page();p.feed(content);cache[path]=(r.status,p)
  except Exception as e:cache[path]=(str(e),None)
 return cache[path]
for path in paths:
 status,p=get(path)
 if status!=200:errors.append((path,status));continue
 if (p.h1,p.main,p.canonical,p.description)!=(1,1,1,1):errors.append((path,{'h1':p.h1,'main':p.main,'canonical':p.canonical,'description':p.description}))
 for href in p.links:
  url=urlsplit(urljoin(base+path,href))
  if url.netloc!=urlsplit(base).netloc or url.path.startswith('/admin'):continue
  target,other=get(url.path or '/')
  if target!=200:errors.append((path,href,target))
  elif url.fragment and unquote(url.fragment) not in other.ids:errors.append((path,'ancre absente',href))
 images.update(p.images)
for image in images:
 if image.startswith('/') and not Path('public'+urlsplit(image).path).exists():errors.append(('image absente',image))
for p in Path('src/styles').glob('*.css'):
 for image in re.findall(r'url\([\"\']?(/images/[^)\"\']+)',p.read_text()):
  if not Path('public'+image).exists():errors.append((str(p),'image CSS absente',image))
print(json.dumps({'pagesVerifiees':len(paths),'destinationsVerifiees':len(cache),'imagesVerifiees':len(images),'erreurs':errors},ensure_ascii=False,indent=2))
sys.exit(bool(errors))
