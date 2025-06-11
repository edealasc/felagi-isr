import requests
from bs4 import BeautifulSoup
import json
import time
import os

BASE_URL = "https://amharic.voanews.com"
ARCHIVE_URL = BASE_URL + "/z/5281?p={}"
START_PAGE = 1
END_PAGE = 51  # inclusive
LINKS_FILE = "voa_article_links.json"
ARTICLES_FILE = "voa_articles.json"

def get_article_links_bs4(page_url):
    """Scrape all article links from a given page using requests and BeautifulSoup."""
    try:
        resp = requests.get(page_url, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        print(f"Failed to fetch {page_url}: {e}")
        return set()
    soup = BeautifulSoup(resp.text, "html.parser")
    links = set()
    for a in soup.select("ul.archive-list li.archive-list__item a[href]"):
        href = a.get("href")
        if href and "/a/" in href and href.endswith(".html"):
            links.add(href.split("#")[0])
    return links

def load_existing_links(json_file):
    if not os.path.exists(json_file):
        return set()
    with open(json_file, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
            return set(data)
        except Exception:
            return set()

def save_links_append(new_links, json_file):
    existing_links = load_existing_links(json_file)
    all_links = list(existing_links.union(new_links))
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(all_links, f, ensure_ascii=False, indent=2)

def crawl_voa_links_bs4(start_page, end_page, json_file=LINKS_FILE):
    all_links = load_existing_links(json_file)
    for page in range(start_page, end_page + 1):
        url = ARCHIVE_URL.format(page)
        print(f"Scraping page {page}: {url}")
        links = get_article_links_bs4(url)
        new_links = [l for l in links if l not in all_links]
        if new_links:
            print(f"Found {len(new_links)} new links.")
            all_links.update(new_links)
            save_links_append(new_links, json_file)
            for link in new_links:
                print(f"Saved: {link}")
        else:
            print("No new links found on this page.")
        time.sleep(1)
    print(f"Total unique article links scraped: {len(all_links)}")
    return all_links

def scrape_article(url):
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
        return None

    soup = BeautifulSoup(resp.text, "html.parser")

    # Title
    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True) if title_tag else ""

    # Content
    content_div = soup.find("div", {"id": "article-content"})
    content = ""
    if content_div:
        wsw = content_div.find("div", class_="wsw")
        if wsw:
            # Remove images, videos, scripts, styles
            for tag in wsw.find_all(["img", "video", "iframe", "script", "style"]):
                tag.decompose()
            content = wsw.get_text(separator="\n", strip=True)
    # Date
    date_tag = soup.find("time")
    date = date_tag.get_text(strip=True) if date_tag else ""

    return {
        "title": title,
        "url": url,
        "date": date,
        "content": content
    }

def already_scraped(url, output_file):
    if not os.path.exists(output_file):
        return False
    with open(output_file, "r", encoding="utf-8") as f:
        for line in f:
            try:
                obj = json.loads(line)
                if obj.get("url") == url:
                    return True
            except Exception:
                continue
    return False

def save_article(article, output_file):
    # Append each article as a JSON object per line (JSONL format)
    with open(output_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(article, ensure_ascii=False) + "\n")

def scrape_voa_articles(links_file=LINKS_FILE, output_file=ARTICLES_FILE):
    # Load links
    if not os.path.exists(links_file):
        print(f"Links file {links_file} does not exist.")
        return
    with open(links_file, "r", encoding="utf-8") as f:
        links = json.load(f)
    for partial_url in links:
        full_url = BASE_URL + partial_url
        if already_scraped(full_url, output_file):
            print(f"Already scraped: {full_url}")
            continue
        article = scrape_article(full_url)
        if article and article["content"]:
            save_article(article, output_file)
            print(f"Saved: {full_url}")
        else:
            print(f"Skipped (no content): {full_url}")
        time.sleep(1)

if __name__ == "__main__":
    # To crawl links:
    crawl_voa_links_bs4(START_PAGE, END_PAGE)
    # To scrape articles:
    # scrape_voa_articles()
