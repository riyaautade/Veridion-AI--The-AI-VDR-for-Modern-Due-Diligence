import json
import urllib.request
import urllib.error

# First login to get a token
login_data = b'username=seller_admin%40example.com&password=password'
req = urllib.request.Request('http://localhost:8000/api/auth/login', data=login_data)
try:
    with urllib.request.urlopen(req) as response:
        token = json.loads(response.read())['access_token']
except urllib.error.HTTPError as e:
    print("Login failed:", e.read())
    exit(1)

# Now post a deal
payload = {
    "name": "Test Deal",
    "seller_company": "Acme Corp",
    "buyer_company": "Globex"
}
req2 = urllib.request.Request(
    'http://localhost:8000/api/deals',
    data=json.dumps(payload).encode('utf-8'),
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
)

try:
    with urllib.request.urlopen(req2) as response:
        print("Success:", response.read())
except urllib.error.HTTPError as e:
    print("Error code:", e.code)
    print("Error response:", e.read().decode('utf-8'))
