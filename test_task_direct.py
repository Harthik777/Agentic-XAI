import requests
import json

def test_task_endpoint():
    """Test the /task endpoint directly to see logging"""
    
    base_url = "http://localhost:8000"
    
    # Test data
    task_data = {
        "task": "Should I invest in renewable energy stocks for my portfolio?",
        "context": "I'm a 25-year-old with moderate risk tolerance and 10-year investment horizon",
        "priority": "medium"
    }
    
    print("🧪 Testing /task endpoint...")
    print(f"📝 Task: {task_data['task']}")
    print(f"🎯 Priority: {task_data['priority']}")
    print()
    
    try:
        response = requests.post(
            f"{base_url}/task",
            json=task_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Confidence: {data.get('confidence', 'N/A')}%")
            print(f"🆔 Decision ID: {data.get('decision_id', 'N/A')}")
            print(f"💡 Recommendation: {data.get('recommendation', 'N/A')[:100]}...")
        else:
            print(f"❌ Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Backend not running on localhost:8000")
    except requests.exceptions.Timeout:
        print("⏱️ Timeout: Request took too long")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_task_endpoint() 