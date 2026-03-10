import pandas as pd
import pickle
import re
import warnings
warnings.filterwarnings('ignore')

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import accuracy_score, classification_report
from sklearn.pipeline import Pipeline, FeatureUnion
from scipy.sparse import hstack
import pandas as pd
import pickle
import re
import warnings
import numpy as np
from datetime import datetime
warnings.filterwarnings('ignore')

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.pipeline import Pipeline, FeatureUnion
from scipy.sparse import hstack
import seaborn as sns
import matplotlib.pyplot as plt

# ══════════════════════════════════════════════════════════
#              FinWise — ML + NLP Training Pipeline
#
#  8 Categories:
#  Food | Transport | Healthcare | Bills | Shopping
#  Entertainment | Income | Others
# ══════════════════════════════════════════════════════════

print("=" * 60)
print("          FinWise ML Model Training Pipeline")
print("          Version 2.0 — Enhanced for Production")
print("=" * 60)

# ── STEP 1: Load Dataset ──────────────────────────────────
try:
    df = pd.read_csv('dataset.csv')
    print(f"\n✅ Dataset  →  {len(df)} rows  |  {df['category'].nunique()} categories")
except FileNotFoundError:
    print("\n❌ Error: dataset.csv not found!")
    print("   Please ensure dataset.csv is in the same directory.")
    exit(1)

# Check for required columns
if 'description' not in df.columns or 'category' not in df.columns:
    print("\n❌ Error: dataset.csv must have 'description' and 'category' columns")
    exit(1)

# Handle missing values
df = df.dropna(subset=['description', 'category'])
print(f"\n📊 Distribution:\n{df['category'].value_counts().to_string()}")


# ── STEP 2: Enhanced NLP Text Preprocessing ───────────────
def preprocess(text):
    """
    Enhanced NLP Preprocessing:
      1. Lowercase
      2. Remove digits and special characters
      3. Normalize whitespace
      4. Handle common abbreviations
    """
    text = str(text).lower()
    
    # Expand common abbreviations for better classification
    abbreviations = {
        'dr': 'doctor',
        'hosp': 'hospital',
        'med': 'medicine',
        'elec': 'electricity',
        'sub': 'subscription',
        'txn': 'transaction',
        'pymt': 'payment'
    }
    
    for abbr, full in abbreviations.items():
        text = text.replace(abbr, full)
    
    text = re.sub(r'[^a-z\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

df['cleaned'] = df['description'].apply(preprocess)
print(f"\n🔤 Sample cleaned text:")
print(df[['description','cleaned']].head(4).to_string(index=False))


# ── STEP 3: Train / Test Split ────────────────────────────
X, y = df['cleaned'], df['category']
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"\n📂 Train: {len(X_train)}  |  Test: {len(X_test)}")


# ── STEP 4: Dual TF-IDF Feature Extraction ───────────────
print("\n🔧 Building Word + Character TF-IDF features...")

word_tfidf = TfidfVectorizer(
    analyzer='word', ngram_range=(1, 2),
    max_features=10000, sublinear_tf=True, min_df=1
)
char_tfidf = TfidfVectorizer(
    analyzer='char_wb', ngram_range=(2, 4),
    max_features=6000, sublinear_tf=True, min_df=1
)

X_train_combined = hstack([
    word_tfidf.fit_transform(X_train),
    char_tfidf.fit_transform(X_train)
])
X_test_combined = hstack([
    word_tfidf.transform(X_test),
    char_tfidf.transform(X_test)
])
print(f"   Feature matrix: {X_train_combined.shape}")


# ── STEP 5: Cross Validation ──────────────────────────────
print("\n🔬 Running 5-Fold Cross Validation...")
cv_pipeline = Pipeline([
    ('features', FeatureUnion([
        ('word', TfidfVectorizer(analyzer='word', ngram_range=(1,2), max_features=10000, sublinear_tf=True, min_df=1)),
        ('char', TfidfVectorizer(analyzer='char_wb', ngram_range=(2,4), max_features=6000, sublinear_tf=True, min_df=1)),
    ])),
    ('clf', LogisticRegression(max_iter=1000, C=10, solver='lbfgs', random_state=42))
])
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(cv_pipeline, X_train, y_train, cv=cv, scoring='accuracy')
print(f"   CV Accuracy: {scores.mean()*100:.2f}% ± {scores.std()*100:.2f}%")


# ── STEP 6: Train Final Model ─────────────────────────────
print("\n🚀 Training final model on full training set...")
classifier = LogisticRegression(max_iter=1000, C=10, solver='lbfgs', random_state=42)
classifier.fit(X_train_combined, y_train)


# ── STEP 7: Enhanced Evaluation ───────────────────────────
y_pred = classifier.predict(X_test_combined)
accuracy = accuracy_score(y_test, y_pred)
print(f"\n📈 Test Accuracy : {accuracy*100:.2f}%")
print("\n📋 Classification Report:")
print(classification_report(y_test, y_pred))

# Generate confusion matrix (optional - for analysis)
print("\n📊 Confusion Matrix:")
cm = confusion_matrix(y_test, y_pred, labels=classifier.classes_)
print(cm)


# ── STEP 8: Save Enhanced Model Bundle ────────────────────
model_bundle = {
    'word_tfidf' : word_tfidf,
    'char_tfidf' : char_tfidf,
    'classifier' : classifier,
    'categories' : sorted(df['category'].unique().tolist()),
    'preprocess' : preprocess,
    'accuracy'   : float(accuracy),
    'trained_on' : datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    'version'    : '2.0'
}
with open('model.pkl', 'wb') as f:
    pickle.dump(model_bundle, f)
print("\n💾 model.pkl saved  ✅")
print("   Contains: word_tfidf + char_tfidf + classifier + metadata")


# ── STEP 9: Enhanced Prediction Helper ────────────────────
def predict(description):
    """
    Input  : raw expense description string
    Output : (category, confidence_percent, all_probabilities)
    """
    cleaned  = preprocess(description)
    features = hstack([
        model_bundle['word_tfidf'].transform([cleaned]),
        model_bundle['char_tfidf'].transform([cleaned])
    ])
    
    category   = model_bundle['classifier'].predict(features)[0]
    probas     = model_bundle['classifier'].predict_proba(features)[0]
    confidence = round(max(probas) * 100, 1)
    
    # Return all probabilities for better insights
    all_probs = dict(zip(model_bundle['classifier'].classes_, probas))
    
    return category, confidence, all_probs


# ── STEP 10: Enhanced Live Prediction Test ────────────────
print("\n🧪 Live Prediction Test:")
print("-" * 65)

tests = [
    ("zomato biryani",           "Food"),
    ("swiggy delivery",          "Food"),
    ("weekly groceries dmart",   "Food"),
    ("uber ride airport",        "Transport"),
    ("petrol refill shell",      "Transport"),
    ("metro card recharge",      "Transport"),
    ("doctor visit fever",       "Healthcare"),
    ("blood test pathology",     "Healthcare"),
    ("gym membership annual",    "Healthcare"),
    ("electricity bill payment", "Bills"),
    ("netflix subscription",     "Bills"),
    ("house rent april",         "Bills"),
    ("myntra shopping outfit",   "Shopping"),
    ("nykaa beauty order",       "Shopping"),
    ("haircut salon premium",    "Shopping"),
    ("movie tickets pvr",        "Entertainment"),
    ("hotel booking goa trip",   "Entertainment"),
    ("weekend vacation manali",  "Entertainment"),
    ("salary credited account",  "Income"),
    ("freelance project payment","Income"),
    ("temple donation charity",  "Others"),
    ("traffic challan fine",     "Others"),
    ("birthday gift bought",     "Others"),
]

print(f"  {'Description':<32} {'Predicted':<16} {'Actual':<16} Conf%")
print(f"  {'-'*32} {'-'*16} {'-'*16} -----")
correct = 0
for desc, actual in tests:
    pred, conf, _ = predict(desc)
    ok = "✅" if pred == actual else "❌"
    print(f"  {desc:<32} {pred:<16} {actual:<16} {conf}%  {ok}")
    if pred == actual:
        correct += 1

print(f"\n  Live Test: {correct}/{len(tests)} correct  ({correct/len(tests)*100:.0f}%)")

# Save model info
print("\n📝 Model Information:")
print(f"   Version: {model_bundle['version']}")
print(f"   Trained: {model_bundle['trained_on']}")
print(f"   Accuracy: {model_bundle['accuracy']*100:.2f}%")
print(f"   Categories: {len(model_bundle['categories'])}")

print("\n" + "=" * 60)
print("          Training Complete!  model.pkl is ready.")
print("          Ready for Flask API integration.")
print("=" * 60)
# ══════════════════════════════════════════════════════════
#              FinWise — ML + NLP Training Pipeline
#
#  8 Categories:
#  Food | Transport | Healthcare | Bills | Shopping
#  Entertainment | Income | Others
# ══════════════════════════════════════════════════════════

print("=" * 60)
print("          FinWise ML Model Training Pipeline")
print("=" * 60)

# ── STEP 1: Load Dataset ──────────────────────────────────
df = pd.read_csv('dataset.csv')
print(f"\n✅ Dataset  →  {len(df)} rows  |  {df['category'].nunique()} categories")
print(f"\n📊 Distribution:\n{df['category'].value_counts().to_string()}")


# ── STEP 2: NLP Text Preprocessing ───────────────────────
def preprocess(text):
    """
    NLP Preprocessing:
      1. Lowercase
      2. Remove digits and special characters
      3. Normalize whitespace
    """
    text = str(text).lower()
    text = re.sub(r'[^a-z\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

df['cleaned'] = df['description'].apply(preprocess)
print(f"\n🔤 Sample cleaned text:")
print(df[['description','cleaned']].head(4).to_string(index=False))


# ── STEP 3: Train / Test Split ────────────────────────────
X, y = df['cleaned'], df['category']
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"\n📂 Train: {len(X_train)}  |  Test: {len(X_test)}")


# ── STEP 4: Dual TF-IDF Feature Extraction ───────────────
#
#  Word-level TF-IDF (ngram 1-2):
#    → captures full words + 2-word phrases
#    → "doctor visit", "petrol refill", "salary credited"
#
#  Character-level TF-IDF (ngram 2-4):
#    → captures brand names and partial words
#    → "nykaa", "zomato", "swiggy", "flipkart"
#    → handles new brand names the model hasn't seen
#
#  Both combined → richer features → better accuracy
#
print("\n🔧 Building Word + Character TF-IDF features...")

word_tfidf = TfidfVectorizer(
    analyzer='word', ngram_range=(1, 2),
    max_features=10000, sublinear_tf=True, min_df=1
)
char_tfidf = TfidfVectorizer(
    analyzer='char_wb', ngram_range=(2, 4),
    max_features=6000, sublinear_tf=True, min_df=1
)

X_train_combined = hstack([
    word_tfidf.fit_transform(X_train),
    char_tfidf.fit_transform(X_train)
])
X_test_combined = hstack([
    word_tfidf.transform(X_test),
    char_tfidf.transform(X_test)
])
print(f"   Feature matrix: {X_train_combined.shape}")


# ── STEP 5: Cross Validation ──────────────────────────────
print("\n🔬 Running 5-Fold Cross Validation...")
cv_pipeline = Pipeline([
    ('features', FeatureUnion([
        ('word', TfidfVectorizer(analyzer='word', ngram_range=(1,2), max_features=10000, sublinear_tf=True, min_df=1)),
        ('char', TfidfVectorizer(analyzer='char_wb', ngram_range=(2,4), max_features=6000, sublinear_tf=True, min_df=1)),
    ])),
    ('clf', LogisticRegression(max_iter=1000, C=10, solver='lbfgs'))
])
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(cv_pipeline, X_train, y_train, cv=cv, scoring='accuracy')
print(f"   CV Accuracy: {scores.mean()*100:.2f}% ± {scores.std()*100:.2f}%")


# ── STEP 6: Train Final Model ─────────────────────────────
print("\n🚀 Training final model on full training set...")
classifier = LogisticRegression(max_iter=1000, C=10, solver='lbfgs')
classifier.fit(X_train_combined, y_train)


# ── STEP 7: Evaluate ──────────────────────────────────────
y_pred = classifier.predict(X_test_combined)
print(f"\n📈 Test Accuracy : {accuracy_score(y_test, y_pred)*100:.2f}%")
print("\n📋 Classification Report:")
print(classification_report(y_test, y_pred))


# ── STEP 8: Save Model Bundle ─────────────────────────────
model_bundle = {
    'word_tfidf' : word_tfidf,
    'char_tfidf' : char_tfidf,
    'classifier' : classifier,
    'categories' : sorted(df['category'].unique().tolist()),
    'preprocess' : preprocess,
}
with open('model.pkl', 'wb') as f:
    pickle.dump(model_bundle, f)
print("\n💾 model.pkl saved  ✅")
print("   Contains: word_tfidf + char_tfidf + classifier")


# ── STEP 9: Prediction Helper ─────────────────────────────
def predict(description):
    """
    Input  : raw expense description string
    Output : (category, confidence_percent)
    """
    cleaned  = preprocess(description)
    features = hstack([
        model_bundle['word_tfidf'].transform([cleaned]),
        model_bundle['char_tfidf'].transform([cleaned])
    ])
    category   = model_bundle['classifier'].predict(features)[0]
    confidence = round(max(model_bundle['classifier'].predict_proba(features)[0]) * 100, 1)
    return category, confidence


# ── STEP 10: Live Prediction Test ─────────────────────────
print("\n🧪 Live Prediction Test:")
print("-" * 65)

tests = [
    ("zomato biryani",           "Food"),
    ("swiggy delivery",          "Food"),
    ("weekly groceries",         "Food"),
    ("uber ride",                "Transport"),
    ("petrol refill",            "Transport"),
    ("metro card recharge",      "Transport"),
    ("doctor visit fever",       "Healthcare"),
    ("blood test lab",           "Healthcare"),
    ("gym membership",           "Healthcare"),
    ("electricity bill",         "Bills"),
    ("netflix subscription",     "Bills"),
    ("house rent payment",       "Bills"),
    ("myntra outfit",            "Shopping"),
    ("nykaa order",              "Shopping"),
    ("haircut salon",            "Shopping"),
    ("movie tickets",            "Entertainment"),
    ("hotel booking goa",        "Entertainment"),
    ("weekend trip manali",      "Entertainment"),
    ("salary credited",          "Income"),
    ("freelance payment",        "Income"),
    ("temple donation",          "Others"),
    ("traffic fine",             "Others"),
    ("birthday gift expense",    "Others"),
]

print(f"  {'Description':<30} {'Predicted':<16} {'Actual':<16} Conf%")
print(f"  {'-'*30} {'-'*16} {'-'*16} -----")
correct = 0
for desc, actual in tests:
    pred, conf = predict(desc)
    ok = "✅" if pred == actual else "❌"
    print(f"  {desc:<30} {pred:<16} {actual:<16} {conf}%  {ok}")
    if pred == actual:
        correct += 1

print(f"\n  Live Test: {correct}/{len(tests)} correct  ({correct/len(tests)*100:.0f}%)")
print("\n" + "=" * 60)
print("          Training Complete!  model.pkl is ready.")
print("=" * 60)