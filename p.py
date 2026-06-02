from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
# CORS allows your p3.js file to talk to this Python server
CORS(app) 

# =======================================================
# 1. SETUP GEMINI AI 
# =======================================================
# Put your real API key from Google AI Studio here:
API_KEY = "http://localhost:5000/api/chat"
genai.configure(api_key=API_KEY)

# Initialize the Gemini model
model = genai.GenerativeModel('gemini-1.5-flash')

@app.route('/api/chat', methods=['POST'])
def chat():
    # 2. Receive the message from your SEEKERS frontend
    data = request.json
    user_message = data.get("message", "")
    
    print(f"\n[RECEIVED] User asked: {user_message}")
    
    try:
        # 3. Give SeekerBot a personality and ask Gemini for the answer!
        system_prompt = f"You are SeekerBot, an incredibly smart, helpful, and professional AI assistant built for a social platform called SEEKERS. Answer this user's prompt concisely: {user_message}"
        
        # Send the prompt to Google's servers
        response = model.generate_content(system_prompt)
        
        # Extract the text answer
        ai_reply = response.text
        print(f"[REPLIED] Gemini answered successfully.")
        
        # 4. Send the answer back to your JavaScript file!
        return jsonify({"reply": ai_reply})
        
    except Exception as e:
        print(f"ERROR: {e}")
        return jsonify({"reply": "Oops! My brain lost connection to the server. Did you put the correct API key in app.py?"})

if __name__ == '__main__':
    print("🤖 SeekerBot Python Backend is running on http://127.0.0.1:5000")
    app.run(port=5000, debug=True)