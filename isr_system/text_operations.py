import json
import re
import string
from collections import Counter
import matplotlib.pyplot as plt
import numpy as np
from scipy.stats import linregress
from datasets import load_dataset

# For this project, I used a set of articles I scraped from voa and ethiopian reporter. I've also attached the code for the scrapers.

# I decided to keep each module in a separate file for better readability.



class TextOperations:


    # to increase accuracy in tokenization I used the amharic abbrevations dataset avaliable at the below link, it converts the abbreviation to its full form
    # https://raw.githubusercontent.com/geezorg/data/refs/heads/master/amharic/abbreviations/Amharic-Abbreviations.xlsx

    with open('c:\\Users\\Edeal\\Documents\\Felagi\\isr_system\\abbrevations.json', 'r', encoding='utf-8') as f:
            ABBREVATIONS = json.load(f)

    interchangeable_letters = {
    'ሐ': 'ሀ', 'ሑ': 'ሁ', 'ሒ': 'ሂ', 'ሓ': 'ሃ', 'ሔ': 'ሄ', 'ሕ': 'ህ', 'ሖ': 'ሆ',
    'ኀ': 'ሀ', 'ኁ': 'ሁ', 'ኂ': 'ሂ', 'ኃ': 'ሃ', 'ኄ': 'ሄ', 'ኅ': 'ህ', 'ኆ': 'ሆ',
    'ኸ': 'ሀ', 'ኹ': 'ሁ', 'ኺ': 'ሂ', 'ኻ': 'ሃ', 'ኼ': 'ሄ', 'ኽ': 'ህ', 'ኾ': 'ሆ',
    'ሠ': 'ሰ', 'ሡ': 'ሱ', 'ሢ': 'ሲ', 'ሣ': 'ሳ', 'ሤ': 'ሴ', 'ሥ': 'ስ', 'ሦ': 'ሶ',
    'ዐ': 'አ', 'ዑ': 'ኡ', 'ዒ': 'ኢ', 'ዓ': 'ኣ', 'ዔ': 'ኤ', 'ዕ': 'እ', 'ዖ': 'ኦ',
    'ፀ': 'ጸ', 'ፁ': 'ጹ', 'ፂ': 'ጺ', 'ፃ': 'ጻ', 'ፄ': 'ጼ', 'ፅ': 'ጽ', 'ፆ': 'ጾ',
    }

    def replace_abbreviation(word):
        return TextOperations.ABBREVATIONS.get(word, word)
            # normalize each token using interchangeable_letters
    
    def interchange_letters(token):
        return ''.join(TextOperations.interchangeable_letters.get(char, char) for char in token)

    def clean_and_tokenize(text):

        #using regex to remove amharic and english numbers in cases where they occur
        text = re.sub(r'[0-9፩-፻]', '', text)
        # removing amharic and english punctuation except for /

        text = re.sub(r'[!"#$%&\'()*+,\-.:;<=>?@[\\]^_`{|}~፡፣፤፥፦፨]', '', text)

        #selecting amharic and english words

        tokens = re.findall(r'\b[\u1200-\u137F\w]+\b', text)

        # call the replace_abbreviation function for tokens containing / and replacing remaning / symbols after

        tokens = [
            TextOperations.replace_abbreviation(token).replace('/', '') if '/' in token else token
            for token in tokens
        ]


        tokens = [TextOperations.interchange_letters(token) for token in tokens]
        return tokens



    def tokenize_dataset(input_path):
        with open(input_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        #selects each entry from the file and tokenizes the title and the content
        for entry in data:
            entry["title"] = TextOperations.clean_and_tokenize(entry["title"])
            entry["content"] = TextOperations.clean_and_tokenize(entry["content"])
            if "url" not in entry:
                entry["url"] = ""
        return data

    def normalize_dataset(data):
        # downcasing is done in rare cases where english words are present
        # all the articles are in amharic but they might have english words here and there andremoving all these words was not a good idea since we might lose some important information

        for entry in data:
            entry["title"] = [token.lower() for token in entry["title"]]
            entry["content"] = [token.lower() for token in entry["content"]]
            if "url" not in entry:
                entry["url"] = ""
        return data

    def load_amharic_stopwords():
        # loading amharic stopwords from a hugging face dataset
        dataset = load_dataset("uhhlt/amharic-stopwords")
        stopwords = []
        for row in dataset["train"]:
            stopwords.append(row['text'])
        # Write stopwords to a txt file each time the function is called
        with open("output/amharic_stopwords.txt", "w", encoding="utf-8") as f:
            for word in stopwords:
                f.write(f"{word}\n")
        return stopwords


    def remove_stopwords_from_dataset(data, stopwords):
        for entry in data:
            entry["title"] = [token for token in entry["title"] if token not in stopwords]
            entry["content"] = [token for token in entry["content"] if token not in stopwords]
        return data


    def stemmer(word):
        amharic_suffixes = [
            'ኝ', 'ህ', 'ሽ', 'ት', 'ች', 'ን', 'ችሁ', 'ቸው', 
            'ልኝ', 'ብኝ', 'ልህ', 'ብህ', 'ልሽ', 'ብሽ',
            'ዬ', 'ሀ', 'ሺ', 'ዋ', 'ናችን', 'ናችሁ', 'ናቸው', 
            'ኦች', 'ዮች', 'ዎች', 'አን', 'አት',            
            'ኡ', 'ው', 'ዋ', 'እትዋ', 'እጥታ',       
            'ን', "ዬ"                         
            'ና',                            
            'ነት', 'ነስ', 'አይት', 'ኦች', 'አው',          
        ]
        amharic_prefixes = [
            'እ',
            'ት',
            'ይ', 
            'እና', 
            'አይ',  
            'አል', 
            'ሰ',    
            'ራ', 
            'አስ',  
            'ታን', 
            'አን',
            "የ", 
            "እነ",  
            "ለ",
            "በ",
            "ከ",
        
        ]
        prefix_removed = word
        longest_prefix = ''
        for prefix in amharic_prefixes:
            if word.startswith(prefix) and len(prefix) > len(longest_prefix):
                longest_prefix = prefix
        if longest_prefix:
            prefix_removed = word[len(longest_prefix):]

        stemmed = prefix_removed
        longest_suffix = ''
        for suffix in amharic_suffixes:
            if prefix_removed.endswith(suffix) and len(suffix) > len(longest_suffix):
                longest_suffix = suffix
        if longest_suffix:
            stemmed = prefix_removed[:-len(longest_suffix)]

        return stemmed

    def stem_words_from_dataset(data):
        for entry in data:
            entry["title"] = [TextOperations.stemmer(token) for token in entry["title"]]
            entry["content"] = [TextOperations.stemmer(token) for token in entry["content"]]
        return data
    

    # calculating cf and df for each word
    def word_frequencies(data):
        cf_counter = Counter()
        df_counter = Counter()
        for entry in data:
            unique_words = set(entry["title"]) | set(entry["content"])
            for word in entry["title"] + entry["content"]:
                cf_counter[word] += 1
            for word in unique_words:
                df_counter[word] += 1
        terms = []
        for word in cf_counter:
            terms.append({
                "term": word,
                "cf": cf_counter[word],
                "df": df_counter[word]
            })
        return terms

    # calcualting tf for each word
    # since each document url is unique, I used it as document id
    def term_frequencies(data):
        tf_entries = []
        for entry in data:
            url = entry.get("url", "")
            tf_counter = Counter(entry["title"] + entry["content"])
            terms = [
                {"term": word, "tf": tf}
                for word, tf in tf_counter.items()
            ]
            tf_entries.append({
                "url": url,
                "terms": terms
            })
        return tf_entries

    # ranking words and implementing zipf's law
    def rank_frequencies(terms, plot=True):
        sorted_terms = sorted(terms, key=lambda x: x["cf"], reverse=True)
        ranked_words = [
            {"rank": rank + 1, "word": term["term"], "frequency": term["cf"]}
            for rank, term in enumerate(sorted_terms)
        ]
        if plot:
            # plotting zipf's law 
            ranks = np.array([item["rank"] for item in ranked_words])
            frequencies = np.array([item["frequency"] for item in ranked_words])
            plt.figure(figsize=(8, 6))
            plt.loglog(ranks, frequencies, marker=".", linestyle="none", label="Observed")
            plt.title("Zipf's Law: Frequency vs. Rank")
            plt.xlabel("Rank")
            plt.ylabel("Frequency ")
            plt.grid(True, which="both", ls="--", lw=0.5)
            plt.legend()
            plt.tight_layout()
            plt.show()
            log_ranks = np.log(ranks)
            log_freqs = np.log(frequencies)
            slope, intercept, r_value, p_value, std_err = linregress(log_ranks, log_freqs)
            print(f"zipf's law fit: slope={slope:.2f}, R^2={r_value**2:.3f}")
        return ranked_words

    #luhn's method
    #removes the upper 0.05 terms
    #removes the terms with a df less than or equal to 3
    def luhn_index_terms(terms, upper_percent=0.05, lower_cutoff=3):
        sorted_terms = sorted(terms, key=lambda x: x["df"], reverse=True)
        unique_words = len(sorted_terms)
        upper_cutoff_count = int(unique_words * upper_percent)
        upper_cutoff_words = set(term["term"] for term in sorted_terms[:upper_cutoff_count])
        lower_cutoff_words = set(term["term"] for term in sorted_terms if term["df"] <= lower_cutoff)
        index_terms = [
            {
                "term": term["term"],
                "cf": term["cf"],
                "df": term["df"]
            }
            for term in sorted_terms
            if term["term"] not in upper_cutoff_words and term["term"] not in lower_cutoff_words
        ]
        stats = {
            "unique_words": unique_words,
            "upper_cutoff_removed": len(upper_cutoff_words),
            "lower_cutoff_removed": len(lower_cutoff_words),
            "remaining_terms": len(index_terms)
        }
        print("Luhn’s Method Applied:")
        print(f"- upper Cutoff (top {int(upper_percent*100)}% unique words): removed {len(upper_cutoff_words)} words")
        print(f"- lower Cutoff (words with df < {lower_cutoff}): removed {len(lower_cutoff_words)} words")
        print(f"- final index terms: {len(index_terms)} words")
        return {"index_terms": index_terms, "stats": stats}

if __name__ == "__main__":
    # 1. Tokenization
    tokenized_data = TextOperations.tokenize_dataset("isr_system/combined_articles.json")
    with open("outputs/dataset_tokenized.json", "w", encoding="utf-8") as f:
        json.dump(tokenized_data, f, ensure_ascii=False, indent=4)

    # 2. Normalization
    normalized_data = TextOperations.normalize_dataset(tokenized_data)
    with open("outputs/dataset_normalized.json", "w", encoding="utf-8") as f:
        json.dump(normalized_data, f, ensure_ascii=False, indent=4)

    # 3. Stopword Removal
    stopwords = TextOperations.load_amharic_stopwords()
    stopword_cleaned_data = TextOperations.remove_stopwords_from_dataset(normalized_data, stopwords)
    with open("outputs/dataset_no_stopwords.json", "w", encoding="utf-8") as f:
        json.dump(stopword_cleaned_data, f, ensure_ascii=False, indent=4)

    # 3.5. Stemming (after stopword removal)
    stemmed_data = TextOperations.stem_words_from_dataset(stopword_cleaned_data)
    with open("outputs/dataset_stemmed.json", "w", encoding="utf-8") as f:
        json.dump(stemmed_data, f, ensure_ascii=False, indent=4)

    # 4. Term Frequencies
    tf_entries = TextOperations.term_frequencies(stemmed_data)
    with open("outputs/term_frequencies.json", "w", encoding="utf-8") as f:
        json.dump(tf_entries, f, ensure_ascii=False, indent=4)

    # 5. Word Frequencies
    terms = TextOperations.word_frequencies(stemmed_data)
    with open("outputs/word_frequencies.json", "w", encoding="utf-8") as f:
        json.dump(terms, f, ensure_ascii=False, indent=4)

    # 6. Rank Frequencies and plot
    ranked_words = TextOperations.rank_frequencies(terms, plot=True)
    with open("outputs/ranked_words.json", "w", encoding="utf-8") as f:
        json.dump(ranked_words, f, ensure_ascii=False, indent=4)

    # 7. Luhn Index Terms
    luhn_results = TextOperations.luhn_index_terms(terms)
    with open("outputs/luhn_cutoffs_results.json", "w", encoding="utf-8") as f:
        json.dump(luhn_results, f, ensure_ascii=False, indent=4)
