"""Check indexable pages for discoverability, metadata and valid JSON-LD."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
import json, html, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
BASE='https://spentapp.github.io'
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.tags=[];self.feed(text)
 def handle_starttag(self,t,a):self.tags.append((t,dict(a)))
 def find(self,t,**attrs):return [a for tag,a in self.tags if tag==t and all(a.get(k)==v for k,v in attrs.items())]
urls=ET.parse(ROOT/'sitemap.xml').getroot();ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
import re
errors=[]
locations=[u.find('s:loc',ns).text for u in urls]
assert len(locations)==len(set(locations)), 'Duplicate sitemap URLs'
for url in locations:
 path=urlparse(url).path;file=ROOT/(path.lstrip('/')+('index.html' if path.endswith('/') else ''))
 assert file.exists(),f'Missing sitemap page {url}'
 text=file.read_text();p=Page(text)
 assert len(p.find('link',rel='canonical'))==1 and p.find('link',rel='canonical')[0]['href']==url,f'Canonical: {url}'
 assert len(p.find('h1'))==1,f'H1: {url}'
 assert p.find('meta',name='description'),f'Description: {url}'
 assert not p.find('meta',name='robots',content='noindex'),f'Noindex: {url}'
 for raw in re.findall(r'<script type="application/ld\+json">(.*?)</script>',text,re.S):json.loads(raw)
 for a in p.find('a')+p.find('link'):
  href=a.get('href','');parsed=urlparse(href)
  if href.startswith('/') or parsed.netloc=='spentapp.github.io':
   target=ROOT/unquote(parsed.path).lstrip('/');target=target/'index.html' if parsed.path.endswith('/') else target
   assert target.exists(),f'Broken link {url}: {href}'
 if path!='/privacy.html':
  assert any('6809588178' in a.get('href','') for a in p.find('a')),f'App Store link: {url}'
  alternates=p.find('link',rel='alternate')
  assert {a.get('hreflang') for a in alternates}=={'en','he','x-default'},f'Alternates: {url}'
  for a in alternates:
   other=ROOT/(urlparse(a['href']).path.lstrip('/')+'index.html');otherp=Page(other.read_text())
   assert any(x.get('href')==url for x in otherp.find('link',rel='alternate')),f'Nonreciprocal hreflang {url}'
 # FAQ answers must also be present in visible HTML.
 for raw in re.findall(r'<script type="application/ld\+json">(.*?)</script>',text,re.S):
  for node in json.loads(raw).get('@graph',[]):
   if node.get('@type')=='FAQPage':
    body=html.unescape(text.split('</head>',1)[1])
    for q in node['mainEntity']:assert q['acceptedAnswer']['text'] in body,f'FAQ differs from visible answer: {url}'
print(f'PASS: {len(locations)} sitemap pages; canonical, description, H1, App Store links, reciprocal hreflang, internal files, JSON-LD and FAQ parity.')
