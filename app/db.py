import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# Get the MongoDB URI from the environment
MONGO_URI = os.getenv("MONGO_URI")

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client['zomato_db']
restaurants_collection = db['restaurants']

# Function to get the restaurants collection
def get_restaurant_collection():
    return restaurants_collection
