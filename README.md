# 💹 FinWise - AI-Powered Expense Tracker

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**FinWise** is an intelligent expense tracking web application that leverages Machine Learning and Natural Language Processing to automatically classify your transactions into categories. Built with Flask and powered by a custom-trained ML model achieving over 93% accuracy on the test dataset.

---

## 🌟 Features

### 🤖 AI-Powered Classification

- **Smart NLP Engine** - Automatically categorizes expenses using dual TF-IDF vectorization and Logistic Regression
- **93%+ Accuracy** - Trained on diverse transaction patterns
- **Real-time Predictions** - Instant classification with confidence scores
- **8 Categories** - Food, Transport, Healthcare, Bills, Shopping, Entertainment, Income, Others

### 📊 Financial Analytics

- **Interactive Charts** - Pie charts, line graphs, and bar charts for spending visualization
- **Monthly Reports** - Download professional PDF reports with AI-generated insights
- **Budget Tracking** - Set category-wise budgets with real-time alerts
- **Spending Trends** - 7-day trends and 6-month comparisons

### 💼 Transaction Management

- **Complete CRUD Operations** - Add, view, edit, and delete transactions
- **Advanced Filtering** - Search by description, category, or date
- **Export to CSV** - Download transaction history for external analysis
- **Transaction History** - Comprehensive view with pagination and sorting

### 🔐 User Authentication

- **Secure Login/Signup** - Session-based authentication with password hashing
- **User-Specific Data** - Each user's transactions are isolated and secure
- **Password Protection** - Werkzeug password hashing (bcrypt-style)

---

## 🛠️ Tech Stack

### Frontend

- **HTML5, CSS3, JavaScript** - Modern, responsive UI
- **Chart.js** - Interactive data visualizations
- **jsPDF** - Client-side PDF generation
- **Custom CSS** - Dark theme with glassmorphism effects

### Backend

- **Flask 3.0.0** - Python web framework
- **Flask-Login** - User session management
- **Flask-CORS** - Cross-origin resource sharing
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Lightweight database

### Machine Learning

- **Scikit-learn** - ML framework
- **TF-IDF Vectorization** - Dual word + character level feature extraction
- **Logistic Regression** - Classification algorithm
- **Pandas & NumPy** - Data processing
- **5-Fold Cross-Validation** - Model evaluation

---

## 📁 Project Structure

```
FinWise-Expense-Tracker/
│
├── backend/
│   ├── app.py              # Flask application and API endpoints
│   ├── models.py           # Database models (User, Transaction, Budget)
│   ├── train_model.py      # ML model training script
│   ├── model.pkl           # Trained ML model
│   ├── # Database created automatically on first run          # SQLite database
│   └── requirements.txt    # Python dependencies
│
├── frontend/
│   ├── index.html          # Dashboard
│   ├── login.html          # Login page
│   ├── signup.html         # Signup page
│   ├── history.html        # Transaction history
│   ├── budgets.html        # Budget management
│   ├── script.js           # Main JavaScript logic
│   ├── history.js          # History page logic
│   ├── budgets.js          # Budget page logic
│   └── style.css           # Global styles
│
├── ml/
│   ├── train_model.py      # ML training pipeline
│   ├── dataset.csv         # Training dataset
│   ├── create_dataset.py   # Dataset generator
│   └── model.pkl           # Trained model
│
├── docs/
│   └── notes.md            # Development notes and documentation
│
├── README.md               # Project documentation
├── LICENSE                 # MIT License
└── .gitignore              # Git ignore rules
```

---

## 🚀 Installation & Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Edge)

### Step 1: Clone the Repository

```bash
git clone https://github.com/ananya-7i23/FinWise-Expense-Tracker.git
cd FinWise-Expense-Tracker
```

### Step 2: Set Up Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Step 3: Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 4: Train the ML Model (Optional)

```bash
# If you want to retrain the model
cd ml
python train_model.py

# Copy model to backend
copy model.pkl ../backend/
```

### Step 5: Initialize Database

```bash
cd backend
python app.py
# Database will be created automatically on first run
# Press Ctrl+C after seeing "Database initialized!"
```

### Step 6: Start the Backend Server

```bash
python app.py
# Server will run on http://localhost:5000
```

### Step 7: Start the Frontend Server

Open a **new terminal** window:

```bash
cd FinWise-Expense-Tracker
cd frontend
python -m http.server 8000
# Frontend will run on http://localhost:8000
```

### Step 8: Access the Application

Open your browser and navigate to:

```
http://localhost:8000/login.html
```

---

## 📖 Usage Guide

### 1. Create an Account

- Navigate to `http://localhost:8000/signup.html`
- Fill in username, email, and password
- Click "Create Account"

### 2. Login

- Enter your credentials on the login page
- Click "Login" to access the dashboard

### 3. Classify Expenses

- On the dashboard, find the "AI Expense Classifier" section
- Enter transaction description (e.g., "Zomato biryani")
- Enter amount (e.g., 350)
- Click "Classify" - AI will automatically categorize it!

### 4. View Analytics

- **Dashboard** - See spending breakdown and trends
- **Charts** - Interactive pie, line, and bar charts
- **Reports** - Generate monthly PDF reports

### 5. Manage Budgets

- Navigate to "Budgets" page
- Click "+ Set Budget"
- Select category and set monthly limit
- Track spending with progress bars

### 6. View History

- Navigate to "Transactions" page
- Search, filter by category or month
- Export to CSV for analysis
- Delete unwanted transactions

---

## 🧠 ML Model Details

### Training Dataset

- **2,528 transactions** across 8 categories
- Balanced distribution with stratified sampling
- Real-world transaction patterns

### Feature Extraction

**Dual TF-IDF Approach:**

1. **Word-level TF-IDF** (1-2 gram)
   - Captures full words and phrases
   - Examples: "doctor visit", "petrol refill", "salary credited"

2. **Character-level TF-IDF** (2-4 gram)
   - Captures brand names and partial words
   - Examples: "zomato", "swiggy", "flipkart"
   - Handles unseen brand names

### Model Performance

- **Algorithm:** Logistic Regression (C=10, max_iter=1000)
- **Cross-Validation:** 5-Fold Stratified
- **Test Accuracy:** 93%+
- **Training Features:** 16,000 combined features

### Categories Supported

1. **Food** - Restaurants, groceries, food delivery
2. **Transport** - Cabs, fuel, metro, flights
3. **Healthcare** - Medicines, doctors, hospitals
4. **Bills** - Utilities, subscriptions, rent
5. **Shopping** - Clothes, electronics, online shopping
6. **Entertainment** - Movies, games, travel
7. **Income** - Salary, freelance, investments
8. **Others** - Miscellaneous expenses

---

## 🔐 Security Features

- **Password Hashing** - Werkzeug secure password hashing
- **Session Management** - Flask-Login secure sessions
- **User Isolation** - Each user's data is completely separate
- **CORS Protection** - Configured for localhost development
- **Input Validation** - Server-side validation for all inputs

---

## 🎨 UI/UX Features

- **Dark Theme** - Easy on the eyes with teal accents
- **Glassmorphism** - Modern frosted glass effects
- **Responsive Design** - Works on desktop and tablets
- **Smooth Animations** - Enhanced user experience
- **Interactive Charts** - Hover effects and tooltips
- **Real-time Updates** - Instant feedback on actions

---

## 📊 API Endpoints

### Authentication

```
POST   /api/auth/signup    - Create new user account
POST   /api/auth/login     - User login
POST   /api/auth/logout    - User logout
GET    /api/auth/me        - Get current user info
```

### Transactions

```
GET    /api/transactions              - Get user's transactions
POST   /api/classify                  - Classify and save transaction
DELETE /api/transactions/<id>         - Delete transaction
GET    /api/transactions?category=X   - Filter by category
GET    /api/transactions?month=X      - Filter by month
```

### Analytics

```
GET    /api/stats                - Get spending statistics
GET    /api/stats?month=2025-03  - Get monthly stats
```

### Health

```
GET    /api/health      - API health check
GET    /api/model-info  - ML model information
```

---

##  Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Ananya Bhui** - _Initial work_ - [GitHub](https://github.com/ananya-7i23)

---

## 🙏 Acknowledgments

- Scikit-learn documentation for ML implementation
- Flask documentation for backend development
- Chart.js for beautiful visualizations
- Font: Syne & DM Sans from Google Fonts

---

## 📧 Contact

For questions or feedback, please reach out:

- **Email:** ananybhui723@gmail.com
- **GitHub:** [@ananya-7i23](https://github.com/ananya-7i23)
- **LinkedIn:** [Ananya Bhui](https://www.linkedin.com/in/)

---

## 🔮 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Multiple currency support
- [ ] Recurring transactions
- [ ] Bank account integration
- [ ] Receipt scanning with OCR
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Export to multiple formats (Excel, JSON)

---
