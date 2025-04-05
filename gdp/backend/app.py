from flask import Flask, request, jsonify, render_template
import pickle
import os
import logging
from werkzeug.utils import secure_filename
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Update template folder configuration
app.template_folder = os.path.abspath('../frontend')
# Set static folder configuration
app.static_folder = os.path.abspath('../frontend')

# Try to load the ML model if it exists
try:
    with open('train_data.pkl', 'rb') as file:
        model = pickle.load(file)
    logger.info("ML model loaded successfully")
except FileNotFoundError:
    logger.warning("train_data.pkl not found. ML prediction functionality will be disabled.")
    model = None

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Check if model is available
        if model is None:
            return jsonify({'error': 'ML model not available'}), 503
            
        # Get data from frontend
        data = request.get_json()

        # Preprocess data into a format suitable for the ML model
        input_features = preprocess_data(data)

        # Use the loaded model to make predictions
        predictions = model.predict([input_features])

        # Send predictions back to frontend
        return jsonify({'predictions': predictions.tolist()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def preprocess_data(data):
    # Example: Convert JSON to numerical features (you need to modify based on your model's expectations)
    try:
        return [data['feature1'], data['feature2'], data['feature3']]
    except KeyError as e:
        raise ValueError(f"Missing required feature: {str(e)}")

@app.route('/')
def index():
    return render_template('index.html')  # Path is now correct because of template_folder setting above

#for profile page
@app.route('/api/profile', methods=['GET', 'POST'])
def handle_profile():
    if request.method == 'POST':
        try:
            data = request.get_json()
            profile_path = os.path.join(app.static_folder, 'data', 'profile.json')
            os.makedirs(os.path.dirname(profile_path), exist_ok=True)
            
            with open(profile_path, 'w') as f:
                json.dump(data, f)
            
            return jsonify({'status': 'success', 'message': 'Profile updated successfully'})
        except Exception as e:
            logger.error(f"Profile update error: {str(e)}")
            return jsonify({'error': str(e)}), 500
    else:
        try:
            profile_path = os.path.join(app.static_folder, 'data', 'profile.json')
            if os.path.exists(profile_path):
                with open(profile_path, 'r') as f:
                    profile_data = json.load(f)
                return jsonify(profile_data)
            return jsonify({'status': 'not_found'}), 404
        except Exception as e:
            logger.error(f"Profile retrieval error: {str(e)}")
            return jsonify({'error': str(e)}), 500

@app.route('/api/profile/image', methods=['POST'])
def upload_profile_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file'}), 400
            
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        if file:
            filename = secure_filename(file.filename)
            upload_path = os.path.join(app.static_folder, 'uploads', filename)
            os.makedirs(os.path.dirname(upload_path), exist_ok=True)
            file.save(upload_path)
            
            return jsonify({
                'status': 'success',
                'filename': filename,
                'path': f'/uploads/{filename}'
            })
    except Exception as e:
        logger.error(f"Image upload error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Run the app
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)