import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai

# =======================================================
# 1. LOAD CONFIGURATION FROM JSON
# =======================================================
try:
    with open('config.json', 'r') as config_file:
        config_data = json.load(config_file)
        api_key = config_data.get("GEMINI_API_KEY", "")
except FileNotFoundError:
    print("⚠️ ERROR: config.json not found! Please create it.")
    api_key = ""

# Initialize the new SDK client with your key
try:
    client = genai.Client(api_key=api_key)
except Exception as e:
    print(f"Failed to initialize Gemini Client: {e}")

# =======================================================
# 2. SETUP FLASK SERVER
# =======================================================
app = Flask(__name__)
CORS(app) 

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get("message", "")
    print(f"\n[RECEIVED] User asked: {user_message}")
    
    try:
        # Give SeekerBot its personality
        system_prompt = f"You are SeekerBot, an AI assistant for a social platform called SEEKERS. Answer concisely: {user_message}"
        
        # Use the new generate_content syntax
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=system_prompt,
        )
        
        print("[REPLIED] Gemini successfully generated an answer.")
        return jsonify({"reply": response.text})
        
    except Exception as e:
        print(f"❌ API ERROR: {e}")
        return jsonify({"reply": f"Connection error: {str(e)}"})

if __name__ == '__main__':
    print("🤖 SeekerBot Python Backend (p.py) is running on http://127.0.0.1:5000")
    app.run(port=5000, debug=True)