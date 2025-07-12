import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv("api/.env")

api_key = "AIzaSyA2TmD3yc-yJrCafcVCcLUHVkvKreKrCU8"
print(f"🔑 Using API key: {api_key[:8]}...")

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"

payload = {
    "contents": [{
        "parts": [{"text": "Hello, respond with just 'OK' if you can read this."}]
    }],
    "generationConfig": {
        "temperature": 0.7,
        "maxOutputTokens": 100
    }
}

print("🚀 Making test request to Gemini API...")

try:
    response = requests.post(url, json=payload, timeout=30)
    print(f"📊 Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        content = result["candidates"][0]["content"]["parts"][0]["text"]
        print(f"✅ Success! Response: {content}")
    else:
        print(f"❌ Error Response: {response.text}")
        
except Exception as e:
    print(f"❌ Exception: {e}") 