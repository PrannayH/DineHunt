from fastapi import FastAPI, HTTPException, Query, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from app.models import Restaurant, RestaurantList
from app.db import get_restaurant_collection
from pymongo import GEOSPHERE
import logging
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import torch
from typing import List
import re

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# Load the model and processor on startup
model_name = "skylord/swin-finetuned-food101"
model = None
processor = None

cuisine_mapping = {
    "pho": ["Asian", "Vietnamese"],
    "pad_thai": ["Thai", "Asian"],
    "fish_and_chips": ["British", "European"],
    "paella": ["Spanish", "European"],
    "sushi": ["Japanese", "Asian"],
    "falafel": ["Mediterranean"],
    "samosa": ["Indian"],
    "chicken_curry": ["Indian"],
    "tacos": ["Mexican"],
    "churros": ["Mexican", "Desserts"],
    "hamburger": ["American"],
    "hotdog": ["American"],
    "french_toast": ["French", "European"],
    "pizza": ["Italian"],
    "spaghetti_carbonara": ["Italian"],
    "ravioli": ["Italian"],
    "bibimbap": ["Korean", "Asian"],
    "dumplings": ["Chinese", "Asian"],
    "tiramisu": ["Desserts"],
    "cheesecake": ["Desserts"]
}


@app.on_event("startup")
async def startup_event():
    global model, processor
    try:
        processor = AutoImageProcessor.from_pretrained(model_name)
        model = AutoModelForImageClassification.from_pretrained(model_name)
        logger.info("Model and processor loaded successfully.")
        
        # Verify MongoDB connection
        restaurant_collection = get_restaurant_collection()
        restaurant_collection.find_one()
        logger.info("MongoDB connection established.")
        
    except Exception as e:
        logger.error(f"Error during startup: {e}")

# Endpoint to classify cuisine based on uploaded image
@app.post("/restaurants/search/image/")
async def classify_cuisine_by_image(image: UploadFile = File(...)):
    global model, processor

    try:
        # Load the image from the uploaded file
        image = Image.open(image.file).convert("RGB")
        
        # Preprocess the image
        inputs = processor(image, return_tensors="pt")
        
        # Make predictions
        with torch.no_grad():
            logits = model(**inputs).logits
        
        # Get the predicted label
        predicted_label = logits.argmax(-1).item()
        predicted_food = model.config.id2label[predicted_label]
        
        # Get the corresponding cuisine(s) from the mapping
        predicted_cuisines = cuisine_mapping.get(predicted_food, ["Unknown"])
        
        # Log and return the result
        logger.info(f"Predicted food: {predicted_food}, Cuisines: {predicted_cuisines}")
        return {"predicted_food": predicted_food, "cuisines": predicted_cuisines}
    
    except Exception as e:
        logger.error(f"Error classifying the image: {e}")
        raise HTTPException(status_code=500, detail="Error processing the image")

@app.get("/restaurants/{restaurant_id}", response_model=Restaurant)
def get_restaurant_by_id(restaurant_id: int):
    restaurant_collection = get_restaurant_collection()
    restaurant = restaurant_collection.find_one({"restaurant_id": restaurant_id})

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    return Restaurant(
        id=str(restaurant.get('_id')),  
        restaurant_id=restaurant['restaurant_id'],
        name=restaurant['name'],
        country_code=restaurant['country_code'],
        city=restaurant['city'],
        address=restaurant['address'],
        locality=restaurant['locality'],
        locality_verbose=restaurant['locality_verbose'],
        longitude=restaurant['longitude'],
        latitude=restaurant['latitude'],
        cuisines=restaurant['cuisines'],  
        average_cost_for_two=restaurant.get('average_cost_for_two'),
        currency=restaurant.get('currency'),
        has_table_booking=restaurant.get('has_table_booking'),
        has_online_delivery=restaurant.get('has_online_delivery'),
        is_delivering_now=restaurant.get('is_delivering'),
        switch_to_order_menu=restaurant.get('switch_to_order_menu'),
        price_range=restaurant.get('price_range'),
        aggregate_rating=restaurant.get('aggregate_rating'),
        rating_color=restaurant.get('rating_color'),
        rating_text=restaurant.get('rating_text'),
        votes=restaurant.get('votes'),
    )

@app.get("/restaurants/", response_model=RestaurantList)
def get_restaurants(
    page: int = 1,
    per_page: int = 10,
    country: int = Query(None, alias='country_code'),
    average_cost_for_two: float = Query(None, alias='average_cost_for_two'),
    cuisines: List[str] = Query(None), 
):
    restaurant_collection = get_restaurant_collection()
    
    query_filter = {}
    if country:
        query_filter['country_code'] = country
    if average_cost_for_two is not None:
        query_filter['average_cost_for_two'] = average_cost_for_two
    if cuisines:
        capitalized_cuisines = [cuisine.capitalize() for cuisine in cuisines]
        query_filter['cuisines'] = {'$in': capitalized_cuisines} 
    
    logger.debug(f"Query filter: {query_filter}")

    total_count = restaurant_collection.count_documents(query_filter)
    restaurants = restaurant_collection.find(query_filter).skip((page - 1) * per_page).limit(per_page)

    restaurant_list = [
        Restaurant(
            id=str(r.get('_id')),  
            restaurant_id=r['restaurant_id'],
            name=r['name'],
            country_code=r['country_code'],
            city=r['city'],
            address=r['address'],
            locality=r['locality'],
            locality_verbose=r['locality_verbose'],
            longitude=r['longitude'],
            latitude=r['latitude'],
            cuisines=r['cuisines'],  
            average_cost_for_two=r.get('average_cost_for_two'),
            currency=r.get('currency'),
            has_table_booking=r.get('has_table_booking'),
            has_online_delivery=r.get('has_online_delivery'),
            is_delivering_now=r.get('is_delivering'),
            switch_to_order_menu=r.get('switch_to_order_menu'),
            price_range=r.get('price_range'),
            aggregate_rating=r.get('aggregate_rating'),
            rating_color=r.get('rating_color'),
            rating_text=r.get('rating_text'),
            votes=r.get('votes'),
        )
        for r in restaurants
    ]

    return RestaurantList(
        restaurants=restaurant_list,
        total_count=total_count,
        page=page,
        per_page=per_page,
    )

@app.get("/restaurants/nearby/", response_model=RestaurantList)
def get_restaurants_nearby(
    latitude: float,
    longitude: float,
    max_distance_km: float = Query(3, gt=0)  
):
    restaurant_collection = get_restaurant_collection()

    max_distance_m = max_distance_km * 1000

    restaurants = restaurant_collection.find({
        "location": {
            "$geoWithin": {
                "$centerSphere": [[longitude, latitude], max_distance_m / 6378137.0] 
            }
        }
    })

    restaurant_list = [
        Restaurant(
            id=str(r.get('_id')), 
            restaurant_id=r['restaurant_id'],
            name=r['name'],
            country_code=r['country_code'],
            city=r['city'],
            address=r['address'],
            locality=r['locality'],
            locality_verbose=r['locality_verbose'],
            longitude=r['longitude'],
            latitude=r['latitude'],
            cuisines=r['cuisines'],
            average_cost_for_two=r.get('average_cost_for_two'),
            currency=r.get('currency'),
            has_table_booking=r.get('has_table_booking'),
            has_online_delivery=r.get('has_online_delivery'),
            is_delivering_now=r.get('is_delivering'),
            switch_to_order_menu=r.get('switch_to_order_menu'),
            price_range=r.get('price_range'),
            aggregate_rating=r.get('aggregate_rating'),
            rating_color=r.get('rating_color'),
            rating_text=r.get('rating_text'),
            votes=r.get('votes'),
        )
        for r in restaurants
    ]

    return RestaurantList(
        restaurants=restaurant_list,
        total_count=len(restaurant_list),  
        page=1,
        per_page=len(restaurant_list), 
    )

@app.get("/restaurants/search/")
async def search_restaurants_by_name(name: str = Query(..., min_length=1)):
    restaurant_collection = get_restaurant_collection()

    # Regex pattern for case-insensitive and prefix matching
    pattern = f"^{re.escape(name)}"
    search_query = {"name": {"$regex": pattern, "$options": "i"}}
    
    restaurants = restaurant_collection.find(search_query)
    
    restaurant_list = [
        Restaurant(
            id=str(r.get('_id')),  
            restaurant_id=r['restaurant_id'],
            name=r['name'],
            country_code=r['country_code'],
            city=r['city'],
            address=r['address'],
            locality=r['locality'],
            locality_verbose=r['locality_verbose'],
            longitude=r['longitude'],
            latitude=r['latitude'],
            cuisines=r['cuisines'],
            average_cost_for_two=r.get('average_cost_for_two'),
            currency=r.get('currency'),
            has_table_booking=r.get('has_table_booking'),
            has_online_delivery=r.get('has_online_delivery'),
            is_delivering_now=r.get('is_delivering'),
            switch_to_order_menu=r.get('switch_to_order_menu'),
            price_range=r.get('price_range'),
            aggregate_rating=r.get('aggregate_rating'),
            rating_color=r.get('rating_color'),
            rating_text=r.get('rating_text'),
            votes=r.get('votes'),
        )
        for r in restaurants
    ]
    
    return RestaurantList(
        restaurants=restaurant_list,
        total_count=len(restaurant_list),
        page=1,
        per_page=len(restaurant_list),
    )