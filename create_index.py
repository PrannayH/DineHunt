import os
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

# Create indexes for multiple fields
indexes = [
    ("location", "2dsphere"),  # Geospatial index
    ("country_code", 1),       # Ascending index on country_code
    ("average_cost_for_two", 1),  # Ascending index on average_cost_for_two
    ("cuisines", 1),           # Ascending index on cuisines
    ("name", 1)                # Ascending index on name
]

# Create the indexes
for index in indexes:
    restaurants_collection.create_index([index])

print("Indexes created successfully!")
