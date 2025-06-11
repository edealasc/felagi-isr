import json
import numpy as np
from collections import Counter

# this module handles term weighting, including IDF and TF-IDF calculations.
# it expects input files generated from the text_operations pipeline.

class TermWeighting:

    # compute Inverse Document Frequency (IDF) for each term.
    def compute_idf(word_frequencies, total_docs, allowed_terms=None):
        idf_data = {}
        for entry in word_frequencies:
            term = entry["term"]
            df = entry["df"]
            if allowed_terms is not None and term not in allowed_terms:
                continue
            if df > 0:
                idf_data[term] = np.log2(total_docs / df)
        return idf_data

    # compute TF-IDF for each document and term.
    def compute_tf_idf(tf_data, word_frequencies, luhn_terms):
        # extract allowed terms from Luhn's index terms
        allowed_terms = set(term["term"] for term in luhn_terms.get("index_terms", []))
        total_docs = len(tf_data)
        idf_data = TermWeighting.compute_idf(word_frequencies, total_docs, allowed_terms=allowed_terms)

        tf_idf_data = []
        for doc in tf_data:
            url = doc.get("url", "")
            terms = doc.get("terms", [])
            total_terms_in_doc = sum(term["tf"] for term in terms)
            tf_idf_terms = []
            for term_entry in terms:
                term = term_entry["term"]
                if term not in allowed_terms:
                    continue
                tf = term_entry["tf"]
                # term frequency normalization
                tf_norm = tf / total_terms_in_doc if total_terms_in_doc > 0 else 0
                idf = idf_data.get(term, 0)
                tf_idf = tf_norm * idf
                tf_idf_terms.append({
                    "term": term,
                    "tf_idf": tf_idf
                })
            tf_idf_data.append({
                "url": url,
                "terms": tf_idf_terms
            })
        return tf_idf_data, idf_data
