import json
import math
import re
from collections import Counter
from .text_operations import TextOperations
from datasets import load_dataset
class SearchEngine:
    


    @staticmethod
    def load_amharic_stopwords():
        # loading amharic stopwords from a hugging face dataset
        dataset = load_dataset("uhhlt/amharic-stopwords")
        stopwords = [row['text'] for row in dataset["train"]]
        return stopwords
    #doing the same text operations that have been done in the dataset 
    def preprocess_text(text):
        text = TextOperations.clean_and_tokenize(text)
        text = [t.lower() for t in text]
        stopwords = SearchEngine.load_amharic_stopwords()
        text = [t for t in text if t not in stopwords]

        text = [TextOperations.stemmer(t) for t in text]

        return text

    #computing the tf-idf for the query
    def compute_query_tfidf(query, word_frequencies_path, total_docs):
        tokens = SearchEngine.preprocess_text(query)
        tf_counts = Counter(tokens)
        max_tf = max(tf_counts.values()) if tf_counts else 1

        with open(word_frequencies_path, "r", encoding="utf-8") as f:
            wf_data = json.load(f)
        if isinstance(wf_data, list):
            df_data = {entry["term"]: entry["df"] for entry in wf_data}
        else:
            df_data = wf_data

        tfidf_query = {}
        for term, tf in tf_counts.items():
            normalized_tf = tf / max_tf
            df = df_data.get(term, 0)
            if df > 0:
                idf = math.log2(total_docs / df)
                tfidf_query[term] = normalized_tf * idf
            else:
                tfidf_query[term] = 0.0
        return tfidf_query

    #computing the cosine similarity between the query and the documents
    def cosine_similarity(query_vec, doc_vec):
        dot_product = sum(query_vec[t] * doc_vec.get(t, 0.0) for t in query_vec)
        query_norm = math.sqrt(sum(v**2 for v in query_vec.values()))
        doc_norm = math.sqrt(sum(v**2 for v in doc_vec.values()))
        if query_norm == 0 or doc_norm == 0:
            return 0.0
        return dot_product / (query_norm * doc_norm)

    # ranking and displaying the results using the inverted index
    def ranked_query(query, inverted_index_path, word_frequencies_path, top_k=100):
        with open(inverted_index_path, "r", encoding="utf-8") as f:
            inverted_index = json.load(f)

        # Collect all unique document URLs that share at least one query term
        doc_vectors = {}
        total_docs = 0
        for term_data in inverted_index.values():
            total_docs += len(term_data["postings"])
        total_docs = max(total_docs, 1)  # avoid division by zero

        query_vec = SearchEngine.compute_query_tfidf(query, word_frequencies_path, total_docs)

        # Build doc vectors for only docs that share terms with the query
        docs_with_terms = set()
        for term in query_vec:
            if term in inverted_index:
                docs_with_terms.update(inverted_index[term]["postings"].keys())

        for doc_url in docs_with_terms:
            doc_vec = {}
            for term in query_vec:
                if term in inverted_index and doc_url in inverted_index[term]["postings"]:
                    doc_vec[term] = inverted_index[term]["postings"][doc_url]["tf_idf"]
            doc_vectors[doc_url] = doc_vec

        ranked = []
        for doc_url, doc_vec in doc_vectors.items():
            sim = SearchEngine.cosine_similarity(query_vec, doc_vec)
            if sim > 0:
                ranked.append((doc_url, sim))
        ranked.sort(key=lambda x: x[1], reverse=True)
        return ranked[:top_k]

