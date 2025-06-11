import json
from collections import defaultdict

# this module builds an inverted index from the TF-IDF results.

class InvertedIndex:

    @staticmethod
    def build_inverted_index(data):
        index = {}
        for entry in data:
            url = entry.get("url", "")
            terms = entry.get("terms", [])
            for term_entry in terms:
                word = term_entry["term"]
                tf_idf = term_entry["tf_idf"]
                if word not in index:
                    index[word] = {"df": 0, "postings": {}}
                if url not in index[word]["postings"]:
                    index[word]["df"] += 1
                    index[word]["postings"][url] = {
                        "tf_idf": tf_idf
                    }
        return index

