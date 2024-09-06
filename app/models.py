from pydantic import BaseModel
from typing import List, Optional

class Restaurant(BaseModel):
    id: Optional[str]  
    restaurant_id: int
    name: str
    country_code: int
    city: str
    address: str
    locality: str
    locality_verbose: str
    longitude: float
    latitude: float
    cuisines: List[str]
    average_cost_for_two: Optional[int]
    currency: Optional[str]
    has_table_booking: Optional[str]
    has_online_delivery: Optional[str]
    is_delivering_now: Optional[str]
    switch_to_order_menu: Optional[str]
    price_range: Optional[int]
    aggregate_rating: Optional[float]
    rating_color: Optional[str]
    rating_text: Optional[str]
    votes: Optional[int]

class RestaurantList(BaseModel):
    restaurants: List[Restaurant]
    total_count: int
    page: int
    per_page: int
