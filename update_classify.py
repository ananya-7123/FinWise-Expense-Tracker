import os

fp = 'backend/app.py'
with open(fp, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. We will remove the old model loading stuff
start_marker_model = 'import joblib'
end_marker_model = '# ══════════════════════════════════════════════════════════\n#                     API ENDPOINTS'

if start_marker_model in content and end_marker_model in content:
    idx1 = content.find(start_marker_model)
    idx2 = content.find(end_marker_model)
    content = content[:idx1] + content[idx2:]

# 2. We will replace classify_transaction
old_classify_start = '@app.route(\'/api/classify\', methods=[\'POST\', \'OPTIONS\'])\n@login_required\ndef classify_transaction():'
old_classify_end = '        return jsonify({\n            \'success\': True,\n            \'transaction\': {\n                \'id\': new_txn.id,\n                \'description\': new_txn.description,\n                \'amount\': new_txn.amount,\n                \'category\': new_txn.category,\n                \'date\': new_txn.date.strftime(\'%Y-%m-%d\')\n            },\n            \'metadata\': {\n                \'confidence\': confidence,\n                \'icon\': category_data[\'icon\'],\n                \'color\': category_data[\'color\'],\n                \'all_probabilities\': all_probs\n            }\n        })\n\n    except Exception as e:\n        print("Classification Error:", e)\n        return jsonify({\'success\': False, \'error\': str(e)}), 500'

new_classify = '''@app.route('/api/classify', methods=['POST', 'OPTIONS'])
@login_required
def classify_transaction():

    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    try:
        data = request.get_json()
        description = data.get('description', '').strip()
        amount = data.get('amount', None)
        should_save = data.get('save', False)

        if not description:
            return jsonify({'error': 'Description cannot be empty'}), 400
            
        if not gemini_client:
             return jsonify({'success': False, 'error': 'Gemini API not configured.'}), 503

        # Use Gemini to classify
        prompt = f"""
        You are a highly accurate financial classification AI.
        Analyze this transaction description: "{description}"
        
        Categorize it into EXACTLY ONE of these 8 categories:
        Food, Transport, Healthcare, Bills, Shopping, Entertainment, Income, Others.
        
        Respond with ONLY a JSON object in this exact format, nothing else:
        {{"category": "CategoryName", "confidence": 99.5}}
        """
        
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        # Parse JSON
        import json
        
        resp_text = response.text.strip()
        if resp_text.startswith('```json'):
            resp_text = resp_text[7:]
        if resp_text.endswith('```'):
            resp_text = resp_text[:-3]
            
        try:
            ai_data = json.loads(resp_text)
            category = ai_data.get('category', 'Others')
            confidence = ai_data.get('confidence', 95.0)
        except json.JSONDecodeError:
            category = "Others"
            confidence = 80.0
            
        valid_categories = ['Food', 'Transport', 'Healthcare', 'Bills', 'Shopping', 'Entertainment', 'Income', 'Others']
        if category not in valid_categories:
            category = "Others"

        category_data = get_category_metadata(category)
        
        all_probs = {category: confidence}
        for c in valid_categories:
            if c != category:
                all_probs[c] = round((100 - confidence) / 7, 2)

        if not should_save:
            return jsonify({
                'success': True,
                'category': category,
                'confidence': confidence,
                'icon': category_data['icon'],
                'color': category_data['color'],
                'all_probabilities': all_probs
            })

        if amount is None:
            return jsonify({'error': 'Amount is required to save a transaction'}), 400

        try:
            amt_float = float(amount)
            if amt_float <= 0:
                 return jsonify({'error': 'Amount must be greater than zero'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid amount format'}), 400

        new_txn = Transaction(
            user_id=current_user.id,
            description=description,
            amount=amt_float,
            category=category,
            date=datetime.now()
        )
        
        from models import db
        db.session.add(new_txn)
        db.session.commit()

        return jsonify({
            'success': True,
            'transaction': {
                'id': new_txn.id,
                'description': new_txn.description,
                'amount': new_txn.amount,
                'category': new_txn.category,
                'date': new_txn.date.strftime('%Y-%m-%d')
            },
            'metadata': {
                'confidence': confidence,
                'icon': category_data['icon'],
                'color': category_data['color'],
                'all_probabilities': all_probs
            }
        })

    except Exception as e:
        print("Classification Error:", e)
        return jsonify({'success': False, 'error': str(e)}), 500'''

if old_classify_start in content and old_classify_end in content:
    idx1 = content.find(old_classify_start)
    idx2 = content.find(old_classify_end) + len(old_classify_end)
    content = content[:idx1] + new_classify + content[idx2:]

with open(fp, 'w', encoding='utf-8') as f:
    f.write(content)
