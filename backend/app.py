from urllib import response

from flask import Flask, request, jsonify, session 
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
import pickle
import re
from scipy.sparse import hstack
from datetime import datetime, timedelta
import os
from models import db, Transaction, Budget, User
from sqlalchemy import func, extract
import secrets
import joblib

def preprocess(text):
    text = text.lower()
    return text

# ══════════════════════════════════════════════════════════
#         FinWise Backend API — Flask + Auth
# ══════════════════════════════════════════════════════════

app = Flask(__name__)
CORS(app,
     supports_credentials=True,
     resources={r"/api/*": {
         "origins": "https://finwise-expense-tracker-1.onrender.com"
     }})


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///finwise.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = secrets.token_hex(16)
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_DOMAIN'] = None
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)


db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def preprocess(text):
    text = str(text).lower()
    abbreviations = {
        'dr': 'doctor', 'hosp': 'hospital', 'med': 'medicine',
        'elec': 'electricity', 'sub': 'subscription', 'txn': 'transaction',
        'pymt': 'payment'
    }
    for abbr, full in abbreviations.items():
        text = text.replace(abbr, full)
    text = re.sub(r'[^a-z\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

import os
import joblib
import pickle

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

model_bundle = None

try:
    with open(MODEL_PATH, "rb") as f:
        model_bundle = pickle.load(f)
    print("✅ Model loaded successfully!")

except Exception as e:
    print("⚠️ Model loading error:", e)
    model_bundle = None


# If model exists, extract components
if model_bundle:
    word_tfidf = model_bundle["word_tfidf"]
    char_tfidf = model_bundle["char_tfidf"]
    classifier = model_bundle["classifier"]
    preprocess_fn = model_bundle.get("preprocess", preprocess)
    categories = model_bundle["categories"]

else:
    # fallback so server doesn't crash
    word_tfidf = None
    char_tfidf = None
    classifier = None
    preprocess_fn = preprocess
    categories = []

# ══════════════════════════════════════════════════════════
#               AUTHENTICATION
# ══════════════════════════════════════════════════════════

from functools import wraps




@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'success': False, 'error': 'Missing credentials'}), 400

        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return jsonify({'success': False, 'error': 'Invalid email or password'}), 401

        login_user(user, remember=True)

        # ✅ KEEP THIS INSIDE TRY
        response = jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user.to_dict()
        })

        response.headers.add('Access-Control-Allow-Credentials', 'true')

        return response

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    

@app.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'success': True, 'message': 'Logged out successfully'})


@app.route('/api/auth/me', methods=['GET'])
@login_required
def get_current_user():
    return jsonify({'success': True, 'user': current_user.to_dict()})


@app.route('/api/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        if not name or not email or not password:
            return jsonify({'success': False, 'error': 'All fields required'}), 400
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'success': False, 'error': 'Email already registered'}), 400
        new_user = User(username=name, email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Account created successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/change-password', methods=['POST'])
@login_required
def change_password():
    data = request.get_json()
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")
    if not current_password or not new_password:
        return jsonify({"success": False, "error": "Missing fields"}), 400
    if not current_user.check_password(current_password):
        return jsonify({"success": False, "error": "Current password incorrect"}), 401
    current_user.set_password(new_password)
    db.session.commit()
    return jsonify({"success": True})


# ══════════════════════════════════════════════════════════
#                  PUBLIC ENDPOINTS
# ══════════════════════════════════════════════════════════

@app.route('/')
def home():
    return jsonify({'status': 'online', 'service': 'FinWise AI Backend', 'version': '2.0'})


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': True,
        'database_connected': True
    })


# ══════════════════════════════════════════════════════════
#              KEYWORD OVERRIDE LAYER
# ══════════════════════════════════════════════════════════

KEYWORD_OVERRIDES = {
    'Healthcare': [
        'paracetamol', 'crocin', 'dolo', 'aspirin', 'ibuprofen', 'combiflam',
        'disprin', 'amoxicillin', 'azithromycin', 'cetirizine', 'montair',
        'allegra', 'zyrtec', 'omeprazole', 'pantoprazole', 'antacid',
        'metformin', 'insulin', 'thyroid', 'vitamin', 'calcium', 'iron tablet',
        'zinc', 'multivitamin', 'cough syrup', 'benadryl', 'ors', 'electral',
        'bandage', 'antiseptic', 'savlon', 'dettol', 'betadine', 'strepsils',
        'vicks', 'zincovit', 'becosules', 'limcee', 'shelcal',
        'pharmacy', 'chemist', 'medical store', 'netmeds', 'pharmeasy', '1mg',
        'apollo pharmacy', 'medplus', 'healthkart', 'doctor', 'physician',
        'hospital', 'clinic', 'pathology', 'diagnostic', 'blood test',
        'xray', 'mri', 'ultrasound', 'ct scan', 'physiotherapy', 'dental',
        'dentist', 'eye checkup', 'dermatologist', 'gym', 'fitness', 'yoga',
        'protein powder', 'whey', 'health insurance',
    ],
    'Food': [
        'zomato', 'swiggy', 'blinkit', 'instamart', 'dunzo',
        'dominos', 'pizza hut', 'mcdonalds', 'kfc', 'burger king', 'subway',
        'starbucks', 'cafe coffee day', 'barista', 'dunkin',
        'ramyeon', 'ramen', 'maggi', 'noodles', 'biryani', 'sushi',
        'momos', 'dimsum', 'pho', 'pad thai', 'shawarma', 'falafel',
        'bigbasket', 'reliance fresh', 'grocery', 'vegetables', 'fruits',
        'milk', 'bread', 'eggs', 'paneer', 'rice', 'dal',
        'ice cream', 'cake', 'bakery', 'mithai', 'sweets', 'chocolate',
        'juice', 'smoothie', 'milkshake', 'lassi', 'chai',
        'restaurant', 'food court', 'canteen', 'dhaba', 'tiffin',
    ],
    'Transport': [
        'uber', 'ola', 'rapido', 'auto rickshaw', 'metro', 'irctc',
        'indigo', 'spicejet', 'air india', 'vistara', 'akasa',
        'petrol', 'diesel', 'cng', 'fuel', 'fastag',
        'car service', 'bike repair', 'tyre', 'oil change', 'car wash',
        'parking', 'toll', 'zoomcar', 'yulu', 'bounce',
    ],
    'Bills': [
        'electricity bill', 'water bill', 'gas bill', 'lpg',
        'airtel', 'jio', 'vodafone', 'bsnl', 'mobile recharge',
        'broadband', 'wifi bill', 'internet bill',
        'netflix', 'prime video', 'hotstar', 'spotify', 'youtube premium',
        'zee5', 'sonyliv', 'apple music', 'jiocinema',
        'emi', 'loan', 'insurance premium', 'lic', 'credit card bill',
    ],
    'Shopping': [
        'amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'nykaa',
        'nike', 'adidas', 'puma', 'reebok', 'bata', 'woodland',
        'zara', 'westside', 'pantaloons',
        'laptop', 'smartphone', 'iphone', 'samsung',
        'headphones', 'earphones', 'airpods', 'smartwatch',
        'furniture', 'ikea', 'pepperfry', 'jewelry', 'tanishq',
        'clothes', 'shirt', 'jeans', 'dress', 'saree', 'kurta',
        'shoes', 'sneakers', 'cosmetics', 'makeup', 'perfume',
    ],
    'Entertainment': [
        'pvr', 'inox', 'cinepolis', 'bookmyshow', 'movie ticket',
        'concert', 'music festival', 'comedy show',
        'water park', 'amusement park', 'wonderla',
        'oyo', 'airbnb', 'resort', 'vacation', 'trip',
        'steam', 'playstation', 'xbox', 'pubg', 'free fire', 'valorant',
        'club entry', 'bar bill', 'pub night', 'ipl ticket',
    ],
}

def keyword_override(description):
    desc_lower = description.lower()
    matches = {}
    for category, keywords in KEYWORD_OVERRIDES.items():
        count = sum(1 for kw in keywords if kw in desc_lower)
        if count > 0:
            matches[category] = count
    if not matches:
        return None
    return max(matches, key=matches.get)


# ══════════════════════════════════════════════════════════
#            CLASSIFICATION ENDPOINT (Protected)
# ══════════════════════════════════════════════════════════

@app.route('/api/classify', methods=['POST'])
@login_required
def classify_transaction():
    try:
        data = request.get_json()
        description = data.get('description', '').strip()
        amount = data.get('amount', None)
        should_save = data.get('save', False)

        if not description:
            return jsonify({'error': 'Description cannot be empty'}), 400

        cleaned = preprocess_fn(description)
        features = hstack([
            word_tfidf.transform([cleaned]),
            char_tfidf.transform([cleaned])
        ])

        # Keyword override first, ML model as fallback
        override = keyword_override(description)
        if override:
            category = override
            confidence = 95.0
            probabilities = classifier.predict_proba(features)[0]
        else:
            category = classifier.predict(features)[0]
            probabilities = classifier.predict_proba(features)[0]
            confidence = round(max(probabilities) * 100, 1)

        all_probs = {
            cat: round(prob * 100, 2)
            for cat, prob in zip(classifier.classes_, probabilities)
        }

        category_data = get_category_metadata(category)

        response = {
            'success': True,
            'category': category,
            'confidence': confidence,
            'icon': category_data['icon'],
            'tip': category_data['tip'],
            'all_probabilities': all_probs,
            'original_description': description,
            'cleaned_description': cleaned,
            'timestamp': datetime.now().isoformat()
        }

        if amount:
            response['amount'] = amount

        if should_save and amount:
            new_transaction = Transaction(
                user_id=current_user.id,
                description=description,
                amount=float(amount),
                category=category,
                confidence=confidence,
                icon=category_data['icon']
            )
            db.session.add(new_transaction)
            db.session.commit()
            response['saved'] = True
            response['transaction_id'] = new_transaction.id

        return jsonify(response)

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ══════════════════════════════════════════════════════════
#           TRANSACTION ENDPOINTS (Protected)
# ══════════════════════════════════════════════════════════

@app.route('/api/transactions', methods=['GET'])
@login_required
def get_transactions():
    try:
        category = request.args.get('category')
        limit = request.args.get('limit', 100, type=int)
        month = request.args.get('month')
        query = Transaction.query.filter_by(user_id=current_user.id)
        if category:
            query = query.filter_by(category=category)
        if month:
            year, month_num = map(int, month.split('-'))
            query = query.filter(
                extract('year', Transaction.date) == year,
                extract('month', Transaction.date) == month_num
            )
        transactions = query.order_by(Transaction.date.desc()).limit(limit).all()
        return jsonify({
            'success': True,
            'total': len(transactions),
            'transactions': [t.to_dict() for t in transactions]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
@login_required
def delete_transaction(transaction_id):
    try:
        transaction = Transaction.query.filter_by(
            id=transaction_id,
            user_id=current_user.id
        ).first_or_404()
        db.session.delete(transaction)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Transaction deleted'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ══════════════════════════════════════════════════════════
#             STATISTICS ENDPOINT (Protected)
# ══════════════════════════════════════════════════════════

@app.route('/api/stats', methods=['GET'])
@login_required
def get_stats():
    try:
        month = request.args.get('month')
        query = Transaction.query.filter_by(user_id=current_user.id)
        if month:
            year, month_num = map(int, month.split('-'))
            query = query.filter(
                extract('year', Transaction.date) == year,
                extract('month', Transaction.date) == month_num
            )
        total_spending = db.session.query(
            func.sum(Transaction.amount)
        ).filter(
            Transaction.user_id == current_user.id,
            Transaction.category != 'Income',
            Transaction.amount > 0
        )
        if month:
            year, month_num = map(int, month.split('-'))
            total_spending = total_spending.filter(
                extract('year', Transaction.date) == year,
                extract('month', Transaction.date) == month_num
            )
        total = total_spending.scalar() or 0
        category_stats = db.session.query(
            Transaction.category,
            func.sum(Transaction.amount).label('total'),
            func.count(Transaction.id).label('count')
        ).filter(
            Transaction.user_id == current_user.id,
            Transaction.category != 'Income'
        )
        if month:
            year, month_num = map(int, month.split('-'))
            category_stats = category_stats.filter(
                extract('year', Transaction.date) == year,
                extract('month', Transaction.date) == month_num
            )
        category_stats = category_stats.group_by(Transaction.category).all()
        categories_breakdown = [
            {
                'category': cat,
                'total': float(total_amt),
                'count': count,
                'percentage': round((float(total_amt) / total * 100) if total > 0 else 0, 1)
            }
            for cat, total_amt, count in category_stats
        ]
        tx_count = query.count()
        return jsonify({
            'success': True,
            'total_spending': round(total, 2),
            'transaction_count': tx_count,
            'categories': categories_breakdown,
            'month': month or 'all_time'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


def get_category_metadata(category):
    metadata = {
        'Food':          {'icon': '🍔', 'tip': 'Food is often a top expense. Try meal-prepping to save up to 40%!'},
        'Transport':     {'icon': '🚗', 'tip': 'Transit adds up quickly. Consider a monthly pass to save ₹120+.'},
        'Healthcare':    {'icon': '💊', 'tip': 'Generic medicines cost 50-80% less than branded ones.'},
        'Bills':         {'icon': '⚡', 'tip': 'Bills are on track. Check for unused subscriptions!'},
        'Shopping':      {'icon': '🛍️', 'tip': 'Discretionary spending detected. Try a no-spend weekend!'},
        'Entertainment': {'icon': '🎬', 'tip': 'Entertainment spending looks good. Keep it balanced!'},
        'Income':        {'icon': '💰', 'tip': 'Income recorded! Track your earnings consistently.'},
        'Others':        {'icon': '📝', 'tip': 'Miscellaneous expense. Consider creating a specific budget for this.'}
    }
    return metadata.get(category, {'icon': '📝', 'tip': 'Expense tracked successfully!'})


# ══════════════════════════════════════════════════════════
#                BUDGET ENDPOINTS (Protected)
# ══════════════════════════════════════════════════════════

@app.route('/api/budgets', methods=['GET'])
@login_required
def get_budgets():
    try:
        user_budgets = Budget.query.filter_by(user_id=current_user.id).all()
        result = []
        for budget in user_budgets:
            spent = db.session.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == current_user.id,
                Transaction.category == budget.category,
                Transaction.amount > 0
            ).scalar() or 0
            result.append({
                "category": budget.category,
                "limit": float(budget.limit_amount),
                "spent": float(spent)
            })
        return jsonify({"success": True, "budgets": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/budgets', methods=['POST'])
@login_required
def save_budget():
    try:
        data = request.get_json()
        category = data.get('category', '').strip()
        limit = data.get('limit')
        if not category or limit is None or float(limit) <= 0:
            return jsonify({"success": False, "error": "Invalid category or limit"}), 400
        existing = Budget.query.filter_by(user_id=current_user.id, category=category).first()
        if existing:
            existing.limit_amount = float(limit)
        else:
            new_budget = Budget(user_id=current_user.id, category=category, limit_amount=float(limit))
            db.session.add(new_budget)
        db.session.commit()
        return jsonify({"success": True, "message": f"Budget for {category} saved"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/budgets/<string:category>', methods=['DELETE'])
@login_required
def delete_budget(category):
    try:
        budget = Budget.query.filter_by(user_id=current_user.id, category=category).first()
        if not budget:
            return jsonify({"success": False, "error": "Budget not found"}), 404
        db.session.delete(budget)
        db.session.commit()
        return jsonify({"success": True, "message": f"Budget for {category} deleted"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ══════════════════════════════════════════════════════════
#                  INITIALIZE DATABASE
# ══════════════════════════════════════════════════════════

with app.app_context():
    db.create_all()
    print("✅ Database initialized!")


# ══════════════════════════════════════════════════════════
#                      RUN SERVER
# ══════════════════════════════════════════════════════════

if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("          FinWise Backend Server Starting...")
    print("=" * 60)
    print(f"\n🚀 Server: http://localhost:5000")
    print(f"🔐 Authentication: Enabled")
    print(f"💾 Database: SQLite (finwise.db)")
    print("\n" + "=" * 60 + "\n")
    app.run(host="0.0.0.0", port=5000)