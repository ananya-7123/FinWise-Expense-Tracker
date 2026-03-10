import pandas as pd
import random

print("Creating enhanced dataset for FinWise...")

sample_data = {
    'Food': [
        # Delivery apps
        'zomato order', 'zomato delivery', 'swiggy food', 'swiggy delivery',
        'swiggy instamart', 'zomato pro', 'dunzo grocery', 'blinkit order',
        # Fast food chains
        'dominos pizza', 'pizza hut order', 'mcdonalds burger', 'kfc chicken',
        'burger king meal', 'subway sandwich', 'taco bell', 'wendys burger',
        'popeyes chicken', 'five guys burger', 'chipotle bowl',
        # Cafes & Coffee
        'starbucks coffee', 'cafe coffee day', 'barista latte', 'third wave coffee',
        'blue tokai coffee', 'dunkin donuts', 'tim hortons', 'costa coffee',
        # Indian food
        'biryani order', 'butter chicken', 'dal makhani', 'paneer tikka',
        'idli dosa restaurant', 'south indian meal', 'north indian thali',
        'chole bhature', 'pav bhaji stall', 'vada pav', 'samosa chaat',
        'tandoori chicken', 'naan roti', 'lassi shop', 'chai tapri',
        # Asian food
        'ramyeon noodles', 'ramen restaurant', 'sushi bar', 'chinese food',
        'hakka noodles', 'fried rice order', 'momos street food', 'dimsum',
        'thai food restaurant', 'korean bbq', 'pho vietnamese', 'pad thai',
        'maggi noodles', 'instant noodles', 'cup noodles', 'wai wai noodles',
        # Groceries
        'dmart grocery', 'bigbasket order', 'reliance fresh', 'more supermarket',
        'nature basket', 'spencers grocery', 'star bazaar', 'lulu hypermarket',
        'grocery shopping', 'vegetables market', 'fruits purchase', 'sabzi mandi',
        'milk purchase', 'bread eggs', 'dairy products', 'paneer purchase',
        # Bakery & Sweets
        'birthday cake', 'bakery items', 'monginis cake', 'theobroma pastry',
        'mithai shop', 'halwai sweets', 'gulab jamun', 'rasgulla order',
        'ice cream parlor', 'baskin robbins', 'amul ice cream', 'kwality walls',
        # Snacks & Beverages
        'juice shop', 'fresh juice', 'sugarcane juice', 'coconut water',
        'energy drink', 'cold coffee', 'milkshake', 'smoothie bar',
        'chips snacks', 'biscuits purchase', 'dry fruits', 'nuts almonds',
        # Meal types
        'breakfast cafe', 'lunch buffet', 'dinner party', 'brunch restaurant',
        'tiffin service', 'meal subscription', 'diet food delivery', 'salad bar',
        'restaurant bill', 'food court meal', 'canteen food', 'office lunch',
    ] * 8,

    'Transport': [
        # Cab services
        'uber ride', 'uber auto', 'uber moto', 'ola cab', 'ola auto',
        'ola bike', 'rapido bike', 'rapido auto', 'meru cab', 'bluesmart cab',
        'indrive ride', 'quick ride', 'savaari cab', 'radio taxi',
        # Auto & Local
        'auto rickshaw', 'tuk tuk fare', 'e-rickshaw', 'cycle rickshaw',
        'local bus fare', 'city bus pass', 'bus ticket', 'mini bus',
        # Metro & Train
        'metro card recharge', 'delhi metro', 'mumbai metro', 'bangalore metro',
        'dmrc recharge', 'bmrcl ticket', 'local train pass', 'mumbai local',
        'irctc booking', 'train ticket', 'railway reservation', 'sleeper ticket',
        'ac coach ticket', 'rajdhani express', 'shatabdi ticket', 'duronto express',
        # Flights
        'indigo airlines', 'air india', 'spicejet flight', 'vistara ticket',
        'goair booking', 'akasa air', 'flight ticket', 'airfare booking',
        'makemytrip flight', 'cleartrip booking', 'ixigo ticket', 'goibibo flight',
        # Fuel
        'petrol refill', 'diesel fuel', 'hp petrol pump', 'indian oil',
        'bharat petroleum', 'shell fuel', 'fuel station', 'gas station',
        'cng refill', 'ev charging', 'fastag recharge',
        # Vehicle maintenance
        'car service', 'bike repair', 'puncture repair', 'tyre change',
        'oil change', 'car wash', 'vehicle maintenance', 'bike servicing',
        'car insurance renewal', 'bike insurance', 'pollution certificate',
        # Parking & Toll
        'parking fee', 'parking charges', 'toll tax', 'highway toll',
        'fastag deduction', 'airport parking', 'mall parking',
        # Rentals
        'car rental', 'bike rental', 'scooter hire', 'yulu bike',
        'bounce scooter', 'vogo bike', 'zoomcar rental', 'drivezy rental',
    ] * 7,

    'Healthcare': [
        # Medicines - Generic names
        'paracetamol tablet', 'crocin medicine', 'dolo 650', 'aspirin tablet',
        'ibuprofen medicine', 'combiflam tablet', 'disprin tablet',
        'amoxicillin antibiotic', 'azithromycin course', 'cetirizine tablet',
        'montair tablet', 'allegra medicine', 'zyrtec antihistamine',
        'omeprazole medicine', 'pantoprazole tablet', 'antacid medicine',
        'metformin diabetes', 'insulin injection', 'blood pressure medicine',
        'thyroid medicine', 'vitamin d tablet', 'vitamin b12', 'calcium tablet',
        'iron supplement', 'zinc tablet', 'multivitamin daily',
        'cough syrup', 'benadryl syrup', 'honitus cough', 'alex cough',
        'ors packet', 'electral powder', 'glucose powder',
        'bandage dressing', 'antiseptic cream', 'savlon dettol', 'betadine',
        # Pharmacies
        'apollo pharmacy', 'medplus store', 'netmeds order', 'pharmeasy delivery',
        '1mg medicine', 'tata 1mg', 'wellness forever', 'healthkart order',
        'medical store', 'chemist shop', 'drug store purchase',
        # Doctors & Hospitals
        'doctor consultation', 'physician visit', 'specialist doctor',
        'hospital bill', 'clinic visit', 'opd charges', 'emergency room',
        'apollo hospital', 'fortis hospital', 'max hospital', 'aiims visit',
        'manipal hospital', 'narayana health', 'medanta hospital',
        'dentist visit', 'dental checkup', 'tooth extraction', 'root canal',
        'orthodontist braces', 'dental cleaning', 'cavity filling',
        'eye checkup', 'ophthalmologist', 'spectacles purchase', 'contact lens',
        'skin doctor', 'dermatologist visit', 'acne treatment', 'skin care clinic',
        # Tests & Diagnostics
        'blood test', 'urine test', 'pathology lab', 'thyroid test',
        'sugar test', 'lipid profile', 'complete blood count', 'cbc test',
        'xray scan', 'mri scan', 'ct scan', 'ultrasound',
        'ecg test', 'echo test', 'covid test', 'pregnancy test',
        'diagnostic center', 'dr lal pathlabs', 'thyrocare test', 'metropolis lab',
        # Fitness & Wellness
        'gym membership', 'cult fit', 'gold gym', 'anytime fitness',
        'yoga class', 'zumba class', 'crossfit gym', 'pilates studio',
        'fitness tracker', 'health checkup', 'annual health package',
        'protein powder', 'whey protein', 'creatine supplement', 'bcaa',
        'physiotherapy', 'massage therapy', 'chiropractor', 'acupuncture',
        # Insurance
        'health insurance', 'medical insurance premium', 'star health',
        'hdfc ergo health', 'care health insurance', 'niva bupa',
    ] * 8,

    'Bills': [
        # Utilities
        'electricity bill', 'bijli bill', 'power bill', 'bescom bill',
        'tata power', 'adani electricity', 'msedcl payment', 'bses payment',
        'water bill', 'water charges', 'jal board', 'bwssb payment',
        'gas bill', 'piped gas', 'mahanagar gas', 'indraprastha gas',
        'lpg cylinder', 'indane gas', 'hp gas', 'bharat gas booking',
        # Internet & Mobile
        'internet bill', 'broadband payment', 'wifi recharge', 'airtel fiber',
        'jio fiber', 'act broadband', 'hathway internet', 'tikona broadband',
        'mobile recharge', 'prepaid recharge', 'jio recharge', 'airtel recharge',
        'vodafone recharge', 'vi recharge', 'bsnl recharge', 'postpaid bill',
        'airtel postpaid', 'jio postpaid', 'vodafone postpaid',
        # Streaming - Entertainment subscriptions go to Bills
        'netflix subscription', 'netflix monthly', 'netflix annual',
        'amazon prime', 'prime video subscription', 'hotstar premium',
        'disney plus hotstar', 'zee5 subscription', 'sonyliv premium',
        'spotify premium', 'apple music', 'youtube premium', 'gaana subscription',
        'jiocinema premium', 'mxplayer pro', 'voot select',
        # Housing
        'house rent', 'apartment rent', 'pg charges', 'hostel fees',
        'maintenance charges', 'society dues', 'flat rent payment',
        'nobroker rent', 'makaan rent', 'housing loan emi',
        # Loans & Insurance
        'loan emi', 'home loan', 'personal loan emi', 'car loan',
        'education loan', 'credit card bill', 'credit card payment',
        'life insurance', 'lic premium', 'term insurance', 'ulip premium',
        'car insurance', 'bike insurance', 'vehicle insurance',
        # Taxes & Government
        'property tax', 'income tax', 'gst payment', 'advance tax',
        'professional tax', 'road tax',
    ] * 8,

    'Shopping': [
        # E-commerce
        'amazon order', 'amazon purchase', 'flipkart order', 'flipkart sale',
        'meesho order', 'snapdeal purchase', 'shopclues order', 'paytm mall',
        'tata cliq', 'reliance digital', 'croma electronics', 'vijay sales',
        # Fashion
        'myntra clothes', 'ajio fashion', 'nykaa fashion', 'bewakoof tshirt',
        'zara purchase', 'h&m clothes', 'uniqlo shirt', 'marks spencer',
        'westside clothes', 'pantaloons purchase', 'lifestyle store',
        'clothing store', 'shirt purchase', 'jeans buy', 'dress shopping',
        'ethnic wear', 'saree purchase', 'kurta buy', 'lehenga shopping',
        # Footwear
        'nike shoes', 'adidas footwear', 'puma sneakers', 'reebok shoes',
        'bata shoes', 'metro shoes', 'shoe mart', 'woodland shoes',
        'crocs purchase', 'floaters sandals', 'heel purchase',
        # Beauty & Personal Care
        'nykaa beauty', 'purple beauty', 'sugar cosmetics', 'lakme product',
        'maybelline makeup', 'loreal product', 'face wash', 'moisturizer',
        'shampoo conditioner', 'body lotion', 'sunscreen', 'serum purchase',
        'hair oil', 'hair color', 'nail polish', 'lipstick',
        'perfume purchase', 'deodorant', 'trimmer buy', 'razor blades',
        # Electronics
        'mobile phone', 'smartphone buy', 'iphone purchase', 'samsung phone',
        'laptop purchase', 'macbook buy', 'dell laptop', 'hp laptop',
        'headphones buy', 'earphones purchase', 'airpods', 'boat earbuds',
        'smartwatch', 'fitness band', 'tablet purchase', 'ipad buy',
        'tv purchase', 'led tv', 'speaker purchase', 'camera buy',
        # Home & Kitchen
        'home decor', 'ikea purchase', 'pepperfry furniture', 'urban ladder',
        'kitchen items', 'cookware purchase', 'pressure cooker', 'mixer grinder',
        'bedding purchase', 'pillow blanket', 'curtains buy', 'bathroom items',
        # Books & Stationery
        'amazon books', 'flipkart books', 'crossword bookstore', 'oxford bookstore',
        'stationery shop', 'notebook pen', 'office supplies', 'art supplies',
        # Gifts
        'gift shopping', 'gift card', 'amazon gift', 'flipkart voucher',
        'jewelry store', 'tanishq jewellery', 'malabar gold', 'kalyan jewellers',
    ] * 7,

    'Entertainment': [
        # Movies & Cinema
        'movie tickets', 'pvr cinemas', 'inox theater', 'cinepolis',
        'bookmyshow movie', 'multiplex ticket', 'imax experience', 'film ticket',
        # Live Events
        'concert tickets', 'music festival', 'bookmyshow event', 'paytm insider',
        'comedy show', 'standup comedy', 'theater play', 'drama performance',
        'sports match ticket', 'ipl ticket', 'cricket match', 'football game',
        'kabaddi match', 'badminton tournament', 'tennis match',
        # Theme Parks & Activities
        'amusement park', 'water park', 'wonderla ticket', 'essel world',
        'adventure sports', 'bungee jumping', 'skydiving', 'trekking trip',
        'escape room', 'gaming zone', 'virtual reality', 'laser tag',
        'bowling alley', 'pool table', 'arcade games', 'go karting',
        # Travel & Stays
        'weekend trip', 'vacation package', 'holiday booking', 'tour package',
        'hotel booking', 'oyo rooms', 'makemytrip hotel', 'goibibo stay',
        'airbnb booking', 'resort stay', 'beach resort', 'hill station trip',
        'goa trip', 'manali vacation', 'kerala trip', 'rajasthan tour',
        'international flight', 'visa fees travel', 'travel insurance',
        # Gaming
        'steam games', 'playstation store', 'xbox gamepass', 'nintendo switch',
        'gaming subscription', 'pubg uc purchase', 'free fire diamonds',
        'valorant points', 'battlepass purchase', 'game dlc',
        # Nightlife & Social
        'party expenses', 'club entry', 'bar bill', 'pub night',
        'lounge entry', 'nightclub', 'drinks party', 'celebration dinner',
        # Hobbies
        'photography equipment', 'painting supplies', 'musical instrument',
        'guitar purchase', 'fitness equipment', 'yoga mat', 'sports equipment',
        'cricket bat', 'football purchase', 'swimming pool entry',
    ] * 6,

    'Income': [
        'salary credited', 'monthly salary', 'weekly salary', 'salary received',
        'bonus received', 'performance bonus', 'annual bonus', 'incentive payment',
        'freelance payment', 'freelance project', 'consulting fees', 'client payment',
        'project payment', 'contract payment', 'gig payment', 'upwork payment',
        'fiverr earning', 'toptal payment', 'freelancer earning',
        'dividend received', 'stock dividend', 'mutual fund dividend',
        'interest credited', 'fd interest', 'savings interest', 'rd maturity',
        'rental income', 'property rent received', 'tenant payment',
        'investment returns', 'stock profit', 'equity profit', 'crypto profit',
        'refund received', 'cashback credited', 'reward points redeemed',
        'amazon cashback', 'paytm cashback', 'gpay reward', 'phonepe cashback',
        'commission earned', 'referral bonus', 'affiliate income',
        'pension received', 'scholarship credited', 'stipend received',
        'prize money', 'contest winning', 'lottery prize', 'game reward',
        'reimbursement', 'expense claim', 'insurance claim', 'settlement',
        'gift money received', 'pocket money', 'allowance credited',
    ] * 5,

    'Others': [
        'temple donation', 'mosque donation', 'church offering', 'gurudwara',
        'charity donation', 'ngo contribution', 'crowdfunding', 'relief fund',
        'traffic fine', 'parking challan', 'penalty payment', 'late fee',
        'legal fees', 'lawyer charges', 'court fees', 'notary charges',
        'courier service', 'delhivery charges', 'bluedart courier', 'dtdc courier',
        'postal charges', 'speed post', 'document courier',
        'government fees', 'passport fees', 'visa application', 'license renewal',
        'driving license', 'aadhar update', 'pan card fees', 'certificate fees',
        'pet care', 'veterinary bill', 'pet food', 'dog food', 'cat food',
        'pet grooming', 'veterinary medicine', 'pet accessories',
        'laundry service', 'dry cleaning', 'uclean laundry', 'washmart',
        'tailor alterations', 'stitching charges', 'cobbler shoe repair',
        'birthday gift', 'wedding gift', 'anniversary gift', 'baby shower gift',
        'festival expenses', 'diwali shopping', 'holi expenses', 'eid celebration',
        'home repair', 'plumber charges', 'electrician fees', 'carpenter work',
        'painting charges', 'cleaning service', 'maid salary', 'cook salary',
        'miscellaneous', 'other expenses', 'general payment', 'unknown expense',
        'atm withdrawal', 'cash withdrawal', 'bank charges', 'account fees',
    ] * 5,
}

# Create DataFrame
rows = []
for category, descriptions in sample_data.items():
    for desc in descriptions:
        # Add slight variations to reduce repetition
        variations = [
            desc,
            desc + ' payment',
            desc + ' purchase',
            'paid for ' + desc,
        ]
        for v in variations[:2]:  # use 2 variations per entry
            rows.append({'description': v, 'category': category})

df = pd.DataFrame(rows)
df = df.drop_duplicates(subset=['description'])
df = df.sample(frac=1, random_state=42).reset_index(drop=True)
df.to_csv('dataset.csv', index=False)

print(f"\n✅ Dataset created successfully!")
print(f"   Total samples: {len(df)}")
print(f"\n📊 Category distribution:")
print(df['category'].value_counts().to_string())
print(f"\n💾 Saved as: dataset.csv")
print(f"\nNow run: python train_model.py")