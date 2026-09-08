import concurrent.futures
import json
from pathlib import Path
import urllib.request
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / 'imports' / 'norton-2026-09-06'
OUT.mkdir(parents=True, exist_ok=True)

def scrape(url):
    slug = url.rstrip('/').split('/')[-1]
    cached = OUT / (slug + '.json')
    if cached.exists():
        return json.loads(cached.read_text(encoding='utf-8'))
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=45) as response:
        html = response.read().decode('utf-8')
    soup = BeautifulSoup(html, 'html.parser')
    nodes = []
    for script in soup.select('script[type="application/ld+json"]'):
        data = json.loads(script.string or script.get_text())
        nodes.extend(data.get('@graph', [data]) if isinstance(data, dict) else data)
    product = next(n for n in nodes if n.get('@type') == 'Product')
    offers = product['offers']
    offer = offers[0] if isinstance(offers, list) else offers
    images = list(dict.fromkeys(a['href'] for a in soup.select('.woocommerce-product-gallery__image a[href]')))
    if not images:
        image = product.get('image', [])
        images = [image] if isinstance(image, str) else image
    desc = soup.select_one('#tab-description')
    description = desc.get_text('\n', strip=True) if desc else product.get('description', '')
    missing_description = not bool(description)
    description = description or product['name']
    category = soup.select_one('.posted_in a')
    brand = product.get('brand', {})
    brand = brand.get('name', '') if isinstance(brand, dict) else brand
    specs = soup.select_one('.woocommerce-product-attributes')
    prices = offer.get('priceSpecification', [])
    original = next((float(p['price']) for p in prices if 'ListPrice' in p.get('priceType', '')), None)
    result = dict(slug=slug, title=product['name'], description=description, price=float(offer['price']),
                  currency=offer['priceCurrency'], images=images, sku=product.get('sku', ''),
                  category=category.get_text(strip=True) if category else 'Lawn & Garden', brand=brand,
                  source_url=url, original_price=original, availability=offer.get('availability', ''),
                  specifications=specs.get_text('\n', strip=True) if specs else '')
    result['missing_source_description'] = missing_description
    if not result['description'] or not images or result['price'] <= 0:
        raise ValueError('Missing required product data: ' + slug)
    (OUT / (slug + '.json')).write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding='utf-8')
    print('OK', slug, len(images), 'images', flush=True)
    return result

urls = list(dict.fromkeys(ROOT.joinpath('norton-urls.txt').read_text().split()))
products, failures = [], []
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    futures = {pool.submit(scrape, url): url for url in urls}
    for future in concurrent.futures.as_completed(futures):
        try:
            products.append(future.result())
        except Exception as error:
            failures.append({'url': futures[future], 'error': str(error)})
products.sort(key=lambda p: urls.index(p['source_url']))
(OUT / 'products.json').write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding='utf-8')
(OUT / 'failures.json').write_text(json.dumps(failures, indent=2), encoding='utf-8')
print(json.dumps({'scraped': len(products), 'failed': failures}))
