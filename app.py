from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing
import firebase_admin
from firebase_admin import credentials, db
import datetime

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # This will handle CORS for all routes

# Initialize Firebase Admin SDK
cred = credentials.Certificate({
    "type": "service_account",
    "project_id": "your-project-id",
    "private_key_id": "your-private-key-id",
    "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
    "client_id": "your-client-id",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com"
})

# Initialize the Firebase Admin SDK with the credentials and database URL
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://your-project-id.firebaseio.com/'
})

def get_storage_data():
    ref = db.reference('storages')
    return ref.get()

def remove_item(item_name, amount):
    storages = get_storage_data()
    
    best_storage = None
    best_size = -1
    best_present = float('inf')

    for storage_id, storage_data in storages.items():
        size = storage_data.get('size', 0)
        item_data = storage_data.get('items', {}).get(item_name, {})
        present = item_data.get('present', 0)

        if not isinstance(size, int):
            continue
        if not isinstance(present, int):
            continue

        if size > best_size or (size == best_size and present < best_present):
            best_size = size
            best_present = present
            best_storage = storage_id
     
    if best_storage:
        update_item(best_storage, item_name, amount, add=True)
        return f"Remove {amount} of {item_name} to {best_storage}"
    else:
        return "No suitable storage found for adding the item."

def add_item(item_name, amount):
    storages = get_storage_data()
    
    best_storage = None
    worst_size = float('inf')
    best_present = -1

    for storage_id, storage_data in storages.items():
        size = storage_data.get('size', 0)
        item_data = storage_data.get('items', {}).get(item_name, {})
        present = item_data.get('present', 0)

        if not isinstance(size, int):
            continue
        if not isinstance(present, int):
            continue

        if size < worst_size or (size == worst_size and present > best_present):
            worst_size = size
            best_present = present
            best_storage = storage_id

    if best_storage:
        update_item(best_storage, item_name, amount, add=False)
        return f"Add {amount} of {item_name} from {best_storage}"
    else:
        return "No suitable storage found for removing the item."

def update_item(storage_id, item_name, amount, add=True):
    ref = db.reference(f'storages/{storage_id}/items/{item_name}')
    item_data = ref.get()

    if item_data:
        present = item_data.get('present', 0)
        new_present = present + amount if add else present - amount
        ref.update({'present': new_present})

        size_ref = db.reference(f'storages/{storage_id}/size')
        current_size = size_ref.get()

        if isinstance(current_size, dict):
            current_size = current_size.get('size', 0)
        
        if not isinstance(current_size, int):
            return "Error: Size for storage is not an integer."

        new_size = current_size - amount if add else current_size + amount
        size_ref.set(new_size)

@app.route('/update_inventory', methods=['POST'])
def update_inventory():
    data = request.get_json()
    operation = data.get('operation')
    item_name = data.get('item_name')
    amount = data.get('amount')

    if operation == "add":
        result = add_item(item_name, amount)
    elif operation == "remove":
        result = remove_item(item_name, amount)
    else:
        result = "Invalid operation. Please enter 'add' or 'remove'."

    return jsonify({"result": result})

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    item_name = data.get('item', '')
    storage_name = data.get('storage', '')

    # Get data from Firebase Realtime Database
    ref = db.reference('storages')
    ref2 = ref.child(storage_name).child('items')
    item_data = ref2.child(item_name).get()

    if not item_data:
        return jsonify({"error": "Item not found"}), 404

    dates = []
    sales_data = []

    for date_str, sales in item_data.items():
        if date_str != 'present':
            dates.append(datetime.datetime.strptime(date_str, '%Y-%m-%d'))
            sales_data.append(sales)

    if not dates:
        return jsonify({"error": "No sales data found for the item"}), 404

    # Create a pandas Series with sales data
    sales_series = pd.Series(sales_data, index=dates)

    # Model and forecast
    model = ExponentialSmoothing(sales_series, seasonal='add', seasonal_periods=7)
    fit = model.fit()
    forecast = fit.forecast(steps=30)
    predicted_sales = forecast.cumsum()

    current_inventory = item_data['present']
    end_date = None

    for day, sales in enumerate(predicted_sales):
        if sales >= current_inventory:
            end_date = dates[-1] + pd.Timedelta(days=day)
            break

    if end_date:
        return jsonify({"values": list(predicted_sales), "date": end_date.date().strftime("%Y-%m-%d")})
    else:
        return jsonify({"date": "Not expected to run out in the next 30 days"})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
