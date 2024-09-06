import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaMapMarkerAlt, FaUtensils, FaMoneyBillWave } from 'react-icons/fa';

const RestaurantDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [restaurant, setRestaurant] = useState(null);

    useEffect(() => {
        const fetchRestaurantDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/restaurants/${id}`);
                setRestaurant(response.data);
            } catch (error) {
                console.error('Error fetching restaurant details:', error);
            }
        };

        fetchRestaurantDetails();
    }, [id]);

    if (!restaurant) {
        return <div className="flex justify-center items-center h-screen"><p className="text-2xl text-gray-600">Loading...</p></div>;
    }

    const ratingColor = restaurant.rating_color || '#005700'; 

    return (
        <div className="min-h-screen bg-gradient-to-r from-[#FD243E] via-[#FF8E90] to-[#FD243E] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-24 h-24 bg-[#FD243E] rounded-full opacity-20"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#FF8E90] rounded-full opacity-20"></div>

                <h1 className="text-5xl font-bold mb-6 text-gray-800 relative z-10">{restaurant.name}</h1>

                <div className="shadow-[10px_15px_15px_10px_rgba(253,36,62,0.2)] p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 col-span-full grid grid-rows-2 gap-2 mb-8">

                    <div className="flex justify-between">
                        <p className="text-lg font-semibold "><strong className="text-[#C8102E]">Aggregate Rating:</strong> {restaurant.aggregate_rating}</p>
                        <p className="text-lg font-semibold"><strong className="text-[#C8102E]">Total Votes:</strong> {restaurant.votes}</p>
                    </div>

                    <div className="flex justify-between items-center">
                        <p className="text-lg font-semibold" style={{ color: ratingColor }}>{restaurant.rating_text}</p>
                        <p className="text-lg font-semibold"><strong className="text-[#C8102E]">Price Range:</strong> {restaurant.price_range}</p>
                    </div>                        
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left relative z-10 mb-8">
                    <div className="p-4 bg-[#C8102E] text-white rounded-lg shadow-md hover:shadow-lg transition duration-200">
                        <FaUtensils className="inline-block text-2xl mr-2" />
                        <p className="text-lg font-semibold"><strong>Cuisines:</strong> {restaurant.cuisines && restaurant.cuisines.length > 0 ? restaurant.cuisines.join(', ') : 'Not available'}</p>
                    </div>

                    <div className="p-4 bg-[#FD243E] text-white rounded-lg shadow-md hover:shadow-lg transition duration-200">
                        <FaMoneyBillWave className="inline-block text-2xl mr-2" />
                        <p className="text-lg font-semibold"><strong>Average Cost for Two:</strong> {restaurant.currency} {restaurant.average_cost_for_two}</p>
                        <p className="text-lg font-semibold"><strong>Price Range:</strong> {restaurant.price_range}</p>
                    </div>

                    <div className="p-4 bg-[#FD243E] text-white rounded-lg shadow-md hover:shadow-lg transition duration-200">
                        <p className="text-lg font-semibold"><strong>Restaurant ID:</strong> {restaurant.restaurant_id}</p>
                        <p className="text-lg font-semibold"><strong>Country Code:</strong> {restaurant.country_code}</p>
                    </div>

                    <div className="p-4 bg-[#C8102E] text-white rounded-lg shadow-md hover:shadow-lg transition duration-200">
                        <p className="text-lg font-semibold"><strong>Has Table Booking:</strong> {restaurant.has_table_booking ? 'Yes' : 'No'}</p>
                        <p className="text-lg font-semibold"><strong>Has Online Delivery:</strong> {restaurant.has_online_delivery ? 'Yes' : 'No'}</p>
                        <p className="text-lg font-semibold"><strong>Is Delivering Now:</strong> {restaurant.is_delivering_now ? 'Yes' : 'No'}</p>
                        <p className="text-lg font-semibold"><strong>Switch to Order Menu:</strong> {restaurant.switch_to_order_menu ? 'Yes' : 'No'}</p>
                    </div>
                </div>

                <div className="p-4 bg-[#C8102E] text-white rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full mb-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-start">
                                <FaMapMarkerAlt className="inline-block text-2xl mr-2" />
                                <div className="text-left">
                                    <p className="text-lg font-semibold"><strong>City:</strong> {restaurant.city}</p>
                                    <p className="text-sm">{restaurant.address}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1 text-left">
                            <p className="text-lg font-semibold"><strong>Locality:</strong> {restaurant.locality_verbose}</p>
                            <p className="text-lg font-semibold"><strong>Longitude:</strong> {restaurant.longitude}</p>
                            <p className="text-lg font-semibold"><strong>Latitude:</strong> {restaurant.latitude}</p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/', { state: location.state })}
                    className="mt-8 px-6 py-3 bg-[#FD243E] text-white text-lg font-semibold rounded-md hover:bg-[#A71A29] transition duration-200 relative z-10"
                >
                    Back to Restaurant List
                </button>
            </div>
        </div>
    );
};

export default RestaurantDetails;
