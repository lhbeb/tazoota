import concurrent.futures
import hashlib
import json
from pathlib import Path
import urllib.request
from PIL import Image

root = Path(__file__).resolve().parent.parent / 'imports' / 'norton-2026-09-06'
images_dir = root / 'images'
images_dir.mkdir(exist_ok=True)
products = json.loads((root / 'products.json').read_text(encoding='utf-8'))
urls = list(dict.fromkeys(url for product in products for url in product['images']))

def download(url):
    name = hashlib.sha256(url.encode()).hexdigest()[:24] + Path(url.split('?')[0]).suffix.lower()
    path = images_dir / name
    if not path.exists():
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=45) as response:
            data = response.read()
        path.write_bytes(data)
    with Image.open(path) as image:
        image.verify()
    return url, name

manifest, failures = {}, []
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    tasks = {pool.submit(download, url): url for url in urls}
    for task in concurrent.futures.as_completed(tasks):
        try:
            url, name = task.result()
            manifest[url] = name
        except Exception as error:
            failures.append({'url': tasks[task], 'error': str(error)})
(root / 'image-manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
(root / 'image-failures.json').write_text(json.dumps(failures, indent=2), encoding='utf-8')
print(json.dumps({'downloaded_verified': len(manifest), 'failures': failures}))
