from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

import json
from django.http import JsonResponse
from .models import Document,Term, Posting
from retrieval_system.search_engine import SearchEngine
import math
# the months in the date field in the articles that were scraped from VOA had been written in amharic I had to write a simple script to convert them to english when adding them to the database.
AMHARIC_MONTHS = {
    "ጃንዩወሪ": "January",
    "ፌብሩወሪ": "February",
    "ማርች": "March",
    "ኤፕሪል": "April",
    "ሜይ": "May",
    "ጁን": "June",
    "ጁላይ": "July",
    "ኦገስት": "August",
    "ሴፕቴምበር": "September",
    "ኦክቶበር": "October",
    "ኖቬምበር": "November",
    "ዲሴምበር": "December",
}
from datetime import datetime

def convert_amharic_date(amharic_date_str):
    try:
        for am_month, en_month in AMHARIC_MONTHS.items():
            if am_month in amharic_date_str:
                en_date_str = amharic_date_str.replace(am_month, en_month)
                return datetime.strptime(en_date_str, "%B %d, %Y").date()
        # If no amharic month found, try to parse as is
        return datetime.strptime(amharic_date_str, "%B %d, %Y").date()
    except Exception:
        return None
    


def import_voa_articles(request):
    with open(r'C:\Users\Edeal\Documents\Felagi\fixed_voa_articles.json', encoding='utf-8') as f:
        articles = json.load(f)

    created_count = 0
    for entry in articles:
        date_str = entry.get('date', '')
        converted_date = convert_amharic_date(date_str)
        Document.objects.create(
            title=entry.get('title', ''),
            description=entry.get('content', ''),
            url=entry.get('url', ''),
            post_date=converted_date,
        )
        created_count += 1

    return JsonResponse({'status': 'success', 'created': created_count})


def import_data(request):


    with open(r'C:\Users\Edeal\Documents\Felagi\isr_system\combined_articles.json', encoding='utf-8') as f:
        articles = json.load(f)

    with open(r'C:\Users\Edeal\Documents\Felagi\outputs\inverted_index.json', encoding='utf-8') as f:
        inverted_index = json.load(f)

    created_count = 0

    for entry in articles:
        date_str = entry.get('date', '')
        converted_date = convert_amharic_date(date_str)
        Document.objects.create(
            title=entry.get('title', ''),
            description=entry.get('content', ''),
            url=entry.get('url', ''),
            post_date=converted_date,
        )
        created_count += 1

    print('created documents: ', created_count)

    created_count = 0
    for term, entry in inverted_index.items():
        df = entry.get('df', 0)
        if df == 0:
            continue
        try:
            term_obj, created = Term.objects.get_or_create(word=term, defaults={'df': df})
            if not created:
                # If term exists, optionally update df if needed
                pass
        except Exception:
            continue  # Skip if any error occurs

        for url, data in entry['postings'].items():
            try:
                doc = Document.objects.get(url=url)
                # Skip if posting already exists
                if Posting.objects.filter(term=term_obj, document=doc).exists():
                    continue
                posting = Posting.objects.create(
                    term=term_obj,
                    document=doc,
                    tf_idf=data['tf_idf'],
                )
                posting.save()
            except Exception:
                continue  # Skip if any error occurs
        created_count += 1
        if created_count % 100 == 0:
            print(f'Processed {created_count} terms')
        term_obj.save()

    return JsonResponse({'status': 'success'})

# Example Django view using your models and the SearchEngine logic
# filepath: c:\Users\Edeal\Documents\Felagi\felagi\documents\views.py


@api_view(['GET'])
@permission_classes([AllowAny])
def search_view(request, query):
    print('query recieved')
    print(query)
    if not query:
        return Response({"error": "No query provided"}, status=400)

    # Get all terms in the query after preprocessing
    tokens = SearchEngine.preprocess_text(query)
    terms = Term.objects.filter(word__in=tokens)
    term_map = {t.word: t for t in terms}

    # Compute total_docs for IDF calculation
    total_docs = Document.objects.count()

    # Compute query tf-idf vector
    df_data = {t.word: t.df for t in terms}
    tf_counts = {t: tokens.count(t) for t in tokens}
    max_tf = max(tf_counts.values()) if tf_counts else 1
    query_vec = {}
    for term, tf in tf_counts.items():
        normalized_tf = tf / max_tf
        df = df_data.get(term, 0)
        if df > 0:
            idf = math.log2(total_docs / df)
            query_vec[term] = normalized_tf * idf
        else:
            query_vec[term] = 0.0

    # Get all postings for the query terms
    postings = Posting.objects.filter(term__word__in=query_vec.keys())
    doc_vectors = {}
    for posting in postings:
        doc_url = posting.document.url
        term = posting.term.word
        if doc_url not in doc_vectors:
            doc_vectors[doc_url] = {}
        doc_vectors[doc_url][term] = posting.tf_idf

    # Compute cosine similarity and rank
    ranked = []
    for doc_url, doc_vec in doc_vectors.items():
        sim = SearchEngine.cosine_similarity(query_vec, doc_vec)
        if sim > 0:
            ranked.append((doc_url, sim))
    ranked.sort(key=lambda x: x[1], reverse=True)
    ranked = ranked[:10]

    # Fetch document info and index terms
    docs = Document.objects.filter(url__in=[url for url, _ in ranked])
    doc_map = {doc.url: doc for doc in docs}

    # For each document, get its index terms (all terms with postings for this doc)
    doc_terms_map = {}
    for doc in docs:
        index_terms = Term.objects.filter(postings__document=doc).values_list('word', flat=True)
        doc_terms_map[doc.url] = list(index_terms)

    response = [
        {
            "url": url,
            "score": score,
            "title": doc_map[url].title if url in doc_map else "",
            "description": doc_map[url].description if url in doc_map else "",
            "index_terms": doc_terms_map.get(url, []),
        }
        for url, score in ranked
    ]
    return Response({"results": response})