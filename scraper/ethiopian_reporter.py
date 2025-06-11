import requests
from bs4 import BeautifulSoup
import json
import time
import os
import re

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
}

def scrape_links(base_url="https://www.ethiopianreporter.com/business/page/{}/", max_pages=500, output_path="ethiopian_reporter_links.json"):
    all_links = set()
    for page in range(1, max_pages + 1):
        url = base_url.format(page)
        try:
            response = requests.get(url, headers=HEADERS)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            selector = "#tdi_131"
            target_div = soup.select_one(selector)
            if target_div:
                for a in target_div.find_all('a', href=True):
                    href = a['href']
                    if href.startswith('https://www.ethiopianreporter.com/'):
                        all_links.add(href)
            # Save to JSON after each page
            #saving the json after each page ensures that even if the program stops, we will have the links we scraped so far
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(list(all_links), f, ensure_ascii=False, indent=2)
            print(f"Scraped page {page}, total links: {len(all_links)}")
        except Exception as e:
            print(f"Error on page {page}: {e}")
        time.sleep(1)
    print(f"Extracted {len(all_links)} links and saved to {output_path}")

def scrape_documents(links_path="ethiopian_reporter_links.json", articles_path="articles.json"):
    # Load links
    with open(links_path, 'r', encoding='utf-8') as f:
        links = json.load(f)

    # Load already scraped articles if exists
    if os.path.exists(articles_path):
        with open(articles_path, 'r', encoding='utf-8') as f:
            articles = json.load(f)
    else:
        articles = []

    scraped_urls = set(a['url'] for a in articles)

    for url in links:
        # Only scrape URLs that match the pattern https://www.ethiopianreporter.com/number/
        if not re.fullmatch(r"https://www\.ethiopianreporter\.com/\d+/?", url):
            continue
        if url in scraped_urls:
            continue
        try:
            response = requests.get(url, headers=HEADERS, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            # Title
            title_tag = soup.find('h1', class_='tdb-title-text')
            title = title_tag.get_text(strip=True) if title_tag else ''

            # Date
            date_tag = soup.find('time', class_='entry-date')
            date = date_tag.get_text(strip=True) if date_tag else ''

            # Content
            content_tag = soup.find('div', class_='td-post-content')
            if content_tag:
                # Remove script/style tags
                for tag in content_tag(['script', 'style']):
                    tag.decompose()
                content = content_tag.get_text(separator='\n', strip=True)
            else:
                content = ''

            article = {
                'url': url,
                'title': title,
                'date': date,
                'content': content
            }
            articles.append(article)

            # Save after each article
            with open(articles_path, 'w', encoding='utf-8') as f:
                json.dump(articles, f, ensure_ascii=False, indent=2)

            print(f"Scraped: {url}")

        except Exception as e:
            print(f"Error scraping {url}: {e}")
        time.sleep(1)

if __name__ == "__main__":

    scrape_links()
    # scrape_documents()
