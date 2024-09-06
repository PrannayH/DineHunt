import os
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# Get the MongoDB connection string from the .env file
mongo_uri = os.getenv("MONGO_URI")

# Check if the connection string is loaded
if not mongo_uri:
    raise ValueError("MongoDB connection string not found in .env file.")

# Connect to the MongoDB Atlas database
client = MongoClient(mongo_uri)

# Access the specific database and collection
db = client['zomato_db']  # Create or use a database called 'zomato_db'
restaurants_collection = db['restaurants']  # Create or use a collection called 'restaurants'

# Drop the existing collection if you want to start fresh
restaurants_collection.drop()

# Load the CSV data using pandas and specify encoding
try:
    df = pd.read_csv('zomato.csv', encoding='ISO-8859-1')  # Or use encoding='latin1'
except UnicodeDecodeError as e:
    print(f"Error reading CSV file: {e}")
    exit()

# Rename the columns for better naming conventions
df.rename(columns={
    'Restaurant ID': 'restaurant_id',
    'Restaurant Name': 'name',
    'Country Code': 'country_code',
    'City': 'city',
    'Address': 'address',
    'Locality': 'locality',
    'Locality Verbose': 'locality_verbose',
    'Longitude': 'longitude',
    'Latitude': 'latitude',
    'Cuisines': 'cuisines',
    'Average Cost for two': 'average_cost_for_two',
    'Currency': 'currency',
    'Has Table booking': 'has_table_booking',
    'Has Online delivery': 'has_online_delivery',
    'Is delivering': 'is_delivering',
    'Switch to order menu': 'switch_to_order_menu',
    'Price range': 'price_range',
    'Aggregate rating': 'aggregate_rating',
    'Rating color': 'rating_color',
    'Rating text': 'rating_text',
    'Votes': 'votes'
}, inplace=True)

# Convert 'Cuisines' from a comma-separated string into a list of cuisines
df['cuisines'] = df['cuisines'].apply(lambda x: [c.strip() for c in x.split(',')] if pd.notnull(x) else [])

# Add the location field in GeoJSON format
df['location'] = df.apply(lambda row: [row['longitude'], row['latitude']], axis=1)

# Convert the dataframe to a list of dictionaries
restaurants_data = df.to_dict(orient='records')

# Insert the data into the MongoDB collection
restaurants_collection.insert_many(restaurants_data)

print("Data successfully loaded into MongoDB with location field and cuisines as arrays!")
