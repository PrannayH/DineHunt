import React, { useState, useEffect } from 'react';
import { Card, List, Pagination, Input, Button, Form, Collapse, Upload, Image } from 'antd';
import axios from 'axios';
import { Link, useNavigate, useLocation} from 'react-router-dom';
import { EnvironmentOutlined, CameraOutlined, FilterOutlined, SearchOutlined, CloseOutlined, UploadOutlined } from '@ant-design/icons'; 
import qs from 'qs';

const { Item } = Form;
const { Panel } = Collapse;

const RestaurantList = () => {
    const location = useLocation();
    const [restaurants, setRestaurants] = useState([]);
    const [total, setTotal] = useState(0);
    const [dishInfo, setDishInfo] = useState(null); 
    const [newCuisine, setNewCuisine] = useState('');
    const [countryCode, setCountryCode] = useState(location.state?.filters?.countryCode || '');
    const [averageSpent, setAverageSpent] = useState(location.state?.filters?.averageSpent || '');
    const [cuisines, setCuisines] = useState(location.state?.filters?.cuisines || []);
    const [searchName, setSearchName] = useState(location.state?.searchName || '');
    const [page, setPage] = useState(location.state?.page || 1);
    const [perPage, setPerPage] = useState(location.state?.filters?.setPerPage || 10); 
    const [latitude, setLatitude] = useState(location.state?.filters?.latitude || '');
    const [longitude, setLongitude] = useState(location.state?.filters?.longitude || '');
    const [range, setRange] = useState(location.state?.filters?.range || '');
    const [imageFile, setImageFile] = useState(null);
    const [imageUploaded, setImageUploaded] = useState(false);

    const fetchRestaurants = async () => {
        try {
            const params = {};
            if (countryCode) params.country_code = countryCode;
            if (averageSpent) params.average_cost_for_two = averageSpent;
    
            
            let cuisinesParams = [];
            if (cuisines.length > 0) {
                cuisines.forEach(cuisine => {
                    cuisinesParams.push({ key: 'cuisines', value: cuisine });
                });
            }

            const response = await axios.get('http://localhost:8000/restaurants/', {
                params: {
                    page,
                    per_page: perPage,
                    ...params
                },
                paramsSerializer: params => {
                    const queryString = qs.stringify(params, { arrayFormat: 'repeat' });
                    const cuisinesString = cuisinesParams.map(param => `${param.key}=${param.value}`).join('&');
                    return `${queryString}&${cuisinesString}`;
                }
            });
    
            setRestaurants(response.data.restaurants);
            setTotal(response.data.total_count);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        }
    };

    const fetchRestaurantsNearby = async () => {
        if (latitude && longitude && range) {
            try {
                const response = await axios.get('http://localhost:8000/restaurants/nearby/', {
                    params: {
                        latitude: parseFloat(latitude),
                        longitude: parseFloat(longitude),
                        max_distance_km: parseInt(range, 10),
                    }
                });
                setRestaurants(response.data.restaurants);
                setTotal(response.data.total_count);
            } catch (error) {
                console.error('Error fetching nearby restaurants:', error);
            }
        }
    };

    const handleSearchByLocation = () => {
        fetchRestaurantsNearby();
    };

    const handleResetLocation = () => {
        setLatitude('');
        setLongitude('');
        setRange('');
        fetchRestaurants();
    };

    const handleImageUpload = async () => {
        if (imageFile) {
            const formData = new FormData();
            formData.append('image', imageFile);
    
            try {
                const response = await axios.post('http://localhost:8000/restaurants/search/image/', formData);
                const { predicted_food, cuisines } = response.data;

                if (predicted_food && Array.isArray(cuisines)) {
                    setDishInfo({ predicted_food, cuisines });
                    setCuisines(cuisines);
                    fetchRestaurants();
                } else {
                    console.error('Unexpected response structure:', response.data);
                    setDishInfo(null);
                }
    
                setRestaurants(response.data.restaurants || []);
                setTotal(response.data.total_count || 0);
                setImageUploaded(true);
            } catch (error) {
                console.error('Error searching restaurants by image:', error);
            }
        }
    };
    

    const handleResetImage = () => {
        setImageFile(null);
        setImageUploaded(false);
        setDishInfo(null);
        setCuisines([]);
        fetchRestaurants();
    };

    const handleSearchByFilters = () => {
        fetchRestaurants();
    };

    const handleResetFilters = () => {
        setCountryCode('');
        setAverageSpent('');
        setCuisines([]);
        fetchRestaurants();
    };

    const handleAddCuisine = () => {
        if (newCuisine && !cuisines.includes(newCuisine)) {
            setCuisines([...cuisines, newCuisine]);
            setNewCuisine('');
        }
    };

    const handleRemoveCuisine = (cuisineToRemove) => {
        setCuisines(cuisines.filter(cuisine => cuisine !== cuisineToRemove));
    };

    const handleSearch = async () => {
        try {
            const response = await axios.get('http://localhost:8000/restaurants/search/', {
                params: {
                    name: searchName
                }
            });
            setRestaurants(response.data.restaurants);
            setTotal(response.data.total_count);
        } catch (error) {
            console.error('Error searching restaurants by name:', error);
        }
    };

    const handleResetSearch = () => {
        setSearchName('');
        fetchRestaurants();
    };


    useEffect(() => {
        fetchRestaurants();
    }, [page, perPage, cuisines]);

    return (
        <div className="flex">
            {/* Sidebar */}
            <div className="w-1/4 p-5 bg-[#FD243E] shadow-lg h-screen overflow-y-auto">
                <Collapse defaultActiveKey={[]} className="bg-[#FD243E] text-white rounded-lg shadow-md " >
                <Panel 
                        header={<><EnvironmentOutlined className="mr-2 rounded-t-lg" /> Search by Location</>} 
                        key="1" 
                        className="bg-white rounded-t-lg text-[#FD243E] font-semibold hover:text-[#C8102E] transition duration-300"
                    >
                        <Form layout="vertical" className="space-y-4 rounded-lg">
                            <Item label="Latitude">
                                <Input
                                    type="number"
                                    step="any"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    className="border rounded-md p-2"
                                />
                            </Item>
                            <Item label="Longitude">
                                <Input
                                    type="number"
                                    step="any"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    className="border rounded-md p-2"
                                />
                            </Item>
                            <Item label="Range (km)">
                                <Input
                                    type="number"
                                    value={range}
                                    onChange={(e) => setRange(e.target.value)}
                                    className="border rounded-md p-2"
                                />
                            </Item>
                            <Button
                                type="primary"
                                onClick={handleSearchByLocation}
                                className="bg-[#FD243E] text-white"
                            >
                                Search
                            </Button>
                            <Button
                                type="default"
                                onClick={handleResetLocation}
                                className="ml-2 bg-gray-300 text-black"
                            >
                                Reset
                            </Button>
                        </Form>
                    </Panel>
                    <Panel
                        header={<><CameraOutlined className="mr-2" /> Search by Food Image</>}
                        key="2"
                        className="bg-white text-[#FD243E] font-semibold hover:text-[#C8102E] transition duration-300"
                    >
                        <div className="p-4 space-y-4">
                            {!imageUploaded ? (
                                <>
                                    <Upload
                                        beforeUpload={(file) => {
                                            setImageFile(file);
                                            return false;
                                        }}
                                        showUploadList={false}
                                        accept="image/*"
                                    >
                                        <Button type="primary" className="bg-[#FD243E] text-white hover:bg-[#FD243E]">
                                            Upload Image
                                        </Button>
                                    </Upload>
                                    {imageFile && (
                                        <div className="mt-2 flex items-center space-x-2 bg-gray-100 p-3 rounded-lg shadow-sm">
                                            <UploadOutlined className="text-[#FD243E]" />
                                            <span className="text-gray-700 font-medium">{imageFile.name}</span>
                                        </div>
                                    )}
                                    <div className="flex space-x-2 mt-4">
                                        <Button
                                            type="primary"
                                            onClick={handleImageUpload}
                                            disabled={!imageFile}
                                            className="bg-[#FD243E] text-white hover:bg-[#FF8E90]"
                                        >
                                            Search
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="mt-2">
                                    <div className="flex flex-col items-center">
                                        <Image src={URL.createObjectURL(imageFile)} alt="Uploaded" width={200} className="rounded-md shadow-lg" />
                                        <p className="text-green-600 font-semibold mt-2">
                                            Image Uploaded Successfully!
                                        </p>
                                        <span className="text-gray-700 font-medium mt-1">
                                            {imageFile.name}
                                        </span>
                                        <Button
                                            type="default"
                                            onClick={handleResetImage}
                                            className="bg-gray-300 text-black hover:bg-gray-400 mt-4"
                                        >
                                            Reset Image
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {imageUploaded && dishInfo && (
                                <div className="mt-4 p-4 bg-[#FD243E] rounded-md text-white">
                                    <p><strong>Predicted Food:</strong> {dishInfo.predicted_food || 'N/A'}</p>
                                    <p><strong>Cuisines:</strong> {dishInfo.cuisines?.join(', ') || 'N/A'}</p>
                                </div>
                            )}
                        </div>
                    </Panel>
                    <Panel 
                        header={<><FilterOutlined className="mr-2" /> Filters</>} 
                        key="3" 
                        className="bg-white text-[#FD243E] font-semibold hover:text-[#C8102E] transition duration-300"
                    >
                        <Form layout="vertical" className="space-y-4">
                            <Item label="Country Code">
                                <Input
                                    type="number"
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="border rounded-md p-2"
                                />
                            </Item>
                            <Item label="Cost for two">
                                <Input
                                    type="number"
                                    step="any"
                                    value={averageSpent}
                                    onChange={(e) => setAverageSpent(e.target.value)}
                                    className="border rounded-md p-2"
                                />
                            </Item>
                            
                            <Item label="Cuisines">
                                <div className="space-y-2">
                                    {cuisines.map((cuisine, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <span className="text-gray-700">{cuisine}</span>
                                            <Button 
                                                type="link"
                                                onClick={() => handleRemoveCuisine(cuisine)}
                                                className="text-red-500"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            placeholder="Enter cuisine"
                                            value={newCuisine}
                                            onChange={(e) => setNewCuisine(e.target.value)}
                                            className="border rounded-md p-2 flex-grow"
                                        />
                                        <Button 
                                            type="dashed" 
                                            onClick={handleAddCuisine}
                                            className="bg-[#FD243E] text-white"
                                        >
                                            Add Cuisine
                                        </Button>
                                    </div>
                                </div>
                            </Item>
                            <Button
                                type="primary"
                                onClick={handleSearchByFilters}
                                className="bg-[#FD243E] text-white"
                            >
                                Apply Filters
                            </Button>
                            <Button
                                type="default"
                                onClick={handleResetFilters}
                                className="ml-7 bg-gray-300 text-black"
                            >
                                Reset Filters
                            </Button>
                        </Form>
                    </Panel>
                </Collapse>
            </div>

            {/* Restaurant List */}
            <div className="w-3/4 p-4 h-screen overflow-y-auto">
                <div className="mb-5 flex items-center space-x-2">
                    <Input
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        placeholder="Search by restaurant name"
                        className="border rounded-md p-2 flex-grow"
                    />
                    <Button
                        type="primary"
                        onClick={handleSearch}
                        className="bg-[#FD243E] text-white"
                    >
                        <SearchOutlined />
                    </Button>
                    <Button
                        type="default"
                        onClick={handleResetSearch}
                        className="bg-gray-300 text-black"
                    >
                        <CloseOutlined />
                    </Button>
                </div>
                <List
                    grid={{ gutter: 16, column: 3 }}
                    dataSource={restaurants}
                    renderItem={restaurant => (
                        <List.Item>
                            <Card
                                title={<div className="flex items-center">
                                    <span className="truncate w-3/4" title={restaurant.name}>
                                        {restaurant.name.length > 20
                                            ? `${restaurant.name.substring(0, 20)}...`
                                            : restaurant.name}
                                    </span>
                                    {restaurant.aggregate_rating && (
                                        <span className="text-gray-500 text-sm ml-2">
                                            ({restaurant.aggregate_rating})
                                        </span>
                                    )}
                                </div>}
                                extra={
                                    <Link
                                        to={`/restaurants/${restaurant.restaurant_id}`}
                                        state={{ filters: { countryCode, averageSpent, cuisines, perPage, latitude, longitude, range }, searchName, page }}
                                        className="bg-[#FD243E] text-white py-2 px-4 rounded-md hover:bg-[#C8102E] transition duration-300"
                                    >
                                        Details
                                    </Link>
                                }
                                className="shadow-[0_4px_8px_rgba(253,36,62,0.2)]" // Custom red shadow with opacity
                            >
                                <p>
                                    <strong className="text-[#C8102E]">Address:</strong> {restaurant.address}
                                </p>
                                <p>
                                    <strong className="text-[#C8102E]">Average Cost for Two:</strong> {restaurant.average_cost_for_two}
                                </p>
                                <p>
                                    <strong className="text-[#C8102E]">Cuisines:</strong> {restaurant.cuisines.join(', ')}
                                </p>
                            </Card>
                        </List.Item>
                    )}
                />
                <Pagination
                    current={page}
                    pageSize={perPage}
                    total={total}
                    onChange={page => setPage(page)}
                    showSizeChanger
                    pageSizeOptions={['10', '20', '50']}  // Customize the dropdown options
                    onShowSizeChange={(current, size) => setPerPage(size)}
                    className="mt-4"
                />
            </div>
        </div>
    );
};

export default RestaurantList;
