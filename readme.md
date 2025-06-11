# Felagi Project

Felagi is a full-stack Amharic news retrieval and analysis system. It consists of a Django backend, a Next.js frontend, a set of Python-based web scrapers, and an Information Storage and Retrieval (ISR) system for text processing and search.

---

## Table of Contents

- [Project Structure](#project-structure)
- [ISR System](#isr-system)
- [Backend (Django)](#backend-django)
- [Frontend (Next.js)](#frontend-nextjs)
- [Scrapers](#scrapers)
- [Data Flow](#data-flow)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [License](#license)

---

## Project Structure

```
felagi/
    db.sqlite3
    manage.py
    documents/
    felagi/
    retrieval_system/
frontend/
    ...
isr_system/
    ...
outputt/
    ...
scraper/
    ...
```

---
---

## ISR System

The [`isr_system/`](isr_system/) directory contains the Information Storage and Retrieval system, **custom-built for Amharic text**. This system is designed to address the unique linguistic and orthographic challenges of Amharic, ensuring accurate and meaningful retrieval.

### Amharic-Specific Features

- **Abbreviation Expansion:** Uses a curated Amharic abbreviation dataset ([`abbrevations.json`](isr_system/abbrevations.json)) to expand abbreviations to their full forms before processing, improving tokenization and search accuracy.
- **Orthographic Normalization:** Implements a mapping of interchangeable Amharic letters (e.g., ሐ/ኀ/ሀ, ፀ/ጸ, etc.) to a canonical form, reducing noise from spelling variations.
- **Custom Tokenization:** Tokenizer is tailored for Amharic, removing both Amharic and English numerals and punctuation, and handling Amharic word boundaries.
- **Amharic Stopword Removal:** Loads stopwords from a dedicated Amharic stopword dataset (via Hugging Face), ensuring only meaningful terms are indexed.
- **Amharic Stemming:** Applies a rule-based stemmer that strips common Amharic prefixes and suffixes, reducing words to their root forms for better matching.
- **Frequency Analysis & Indexing:** Calculates collection frequency (cf), document frequency (df), and builds an inverted index using Amharic-specific preprocessing.
- **Luhn’s Method for Index Terms:** Filters out overly common and rare terms based on Amharic document statistics, keeping only the most informative index terms.
- **Zipf’s Law Analysis:** Visualizes and analyzes word frequency distributions to validate linguistic assumptions for Amharic.

**Key Classes & Scripts:**
- [`TextOperations`](isr_system/text_operations.py): Implements all Amharic-specific preprocessing and analysis.
- [`term_weighting.py`](isr_system/term_weighting.py): Calculates TF-IDF and IDF, using Luhn-filtered Amharic vocabulary.
- [`inverted_index.py`](isr_system/inverted_index.py): Builds the inverted index from TF-IDF results.
- [`search_engine.py`](isr_system/search_engine.py): Provides search and ranking, using Amharic-aware preprocessing for queries.

**Processing Pipeline:**
1. **Tokenization:** Splits articles into tokens, expands abbreviations, and normalizes spelling.
2. **Normalization:** Downcases and standardizes Amharic tokens.
3. **Stopword Removal:** Removes Amharic stopwords.
4. **Stemming:** Reduces words to their root forms using Amharic rules.
5. **Frequency Analysis:** Computes cf and df for each Amharic word.
6. **Indexing:** Builds an inverted index for fast Amharic document retrieval.
7. **Term Weighting:** Calculates TF-IDF using Amharic-specific statistics.
8. **Search:** Processes queries with the same Amharic-aware pipeline for accurate results.

**Run Example:**
```sh
python [text_operations.py](http://_vscodecontentref_/0)

## Backend (Django)

The backend is a Django project located in the [`felagi/`](felagi/) directory. It provides:

- **Document Import:** Import articles from JSON files into the database using views like [`import_voa_articles`](felagi/documents/views.py) and [`import_data`](felagi/documents/views.py).
- **API Endpoints:** (Assumed) for document retrieval, search, and possibly for serving processed data to the frontend.
- **Database:** Uses SQLite by default (`db.sqlite3`).

**Key Files:**
- [`manage.py`](felagi/manage.py): Django management script.
- [`felagi/documents/views.py`](felagi/documents/views.py): Contains import logic and possibly other document-related views.

**Import Example:**
```python
# Import VOA articles
python manage.py shell
>>> from documents.views import import_voa_articles
>>> import_voa_articles(request)
```

---

## Frontend (Next.js)

The frontend is a Next.js application in the [`frontend/`](frontend/) directory. It provides:

- **User Interface:** For searching, viewing, and interacting with Amharic news articles.
- **Components:** Located in [`frontend/components/`](frontend/components/).
- **Hooks, Libs, and Styles:** For state management, utility functions, and styling (Tailwind CSS).

**Key Files:**
- [`package.json`](frontend/package.json): Project dependencies and scripts.
- [`app/`](frontend/app/): Main Next.js app directory.
- [`components/`](frontend/components/): React components.
- [`styles/`](frontend/styles/): Tailwind and global styles.

**Development:**
```sh
cd frontend
npm install
npm run dev
```

---

## Scrapers

The [`scraper/`](scraper/) directory contains Python scripts to collect Amharic news articles from various sources.

### VOA Scraper

- [`voa.py`](scraper/voa.py): Scrapes articles from VOA Amharic.
    - **Link Extraction:** Uses BeautifulSoup to collect article links from archive pages.
    - **Article Scraping:** Downloads and parses each article, extracting title, date, and content.
    - **Output:** Saves articles in JSONL format (`voa_articles.json`).

**Usage:**
```sh
python scraper/voa.py
# To crawl links and scrape articles, uncomment the relevant lines in the __main__ block.
```

### Ethiopian Reporter Scraper

- [`ethiopian_reporter.py`](scraper/ethiopian_reporter.py): Scrapes articles from Ethiopian Reporter.
    - **Link Extraction:** Collects article URLs from paginated business section.
    - **Article Scraping:** Extracts title, date, and content for each article.
    - **Output:** Saves articles in JSON (`articles.json`).

**Usage:**
```sh
python scraper/ethiopian_reporter.py
```

---


## Data Flow

1. **Scraping:** Use scrapers to collect articles and save them as JSON/JSONL.
2. **Processing:** Use the ISR system to process and index the articles.
3. **Import:** Load processed articles into the Django backend.
4. **Frontend:** Users interact with the frontend, which fetches data from the backend.

---

## Setup & Installation

1. **Clone the repository.**
2. **Install Python dependencies** for scrapers and ISR system:
    ```sh
    pip install -r requirements.txt
    ```
3. **Install Node.js dependencies** for the frontend:
    ```sh
    cd frontend
    npm install
    ```
4. **Set up the Django backend:**
    ```sh
    cd felagi
    python manage.py migrate
    python manage.py runserver
    ```
5. **Run the frontend:**
    ```sh
    cd frontend
    npm run dev
    ```

---

## Usage

- **Scrape articles:** Run the scrapers in [`scraper/`](scraper/).
- **Process articles:** Run the ISR system scripts in [`isr_system/`](isr_system/).
- **Import data:** Use Django management commands or views to import processed data.
- **Start backend and frontend:** Run Django and Next.js servers.

---

## License

This project is for academic and research purposes. See `LICENSE` for details.

---