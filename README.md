# Zomato Restaurant Listing & Searching

## Project Overview

The Zomato Restaurant Listing & Searching project is a web application designed to display and search for restaurants based on various criteria. It leverages a FastAPI backend for data management and a ReactJS frontend for user interaction. Users can search for restaurants by location, image, and filters, and view detailed information about each restaurant.

## Key Use Cases

### Data Loading
Created an independent script to load the Zomato restaurant data from [Kaggle](https://www.kaggle.com/datasets/shrutimehta/zomato-restaurants-data) into a database.

### Web API Service
Developed a web API service with the following endpoints:
- *Get Restaurant by ID*: Retrieve details of a specific restaurant by its ID.
- *Get List of Restaurants*: Fetch a list of restaurants with pagination support.

### User Interface
Developed a web application with the following pages:
- *Restaurant List Page*: Display a list of restaurants. Clicking on a restaurant navigates to the restaurant's detail page.
- *Restaurant Detail Page*: Show details of a specific restaurant.
- *Location Search*: Search restaurants within a given latitude and longitude range.
- *Image Search*: Upload an image of food and search for restaurants offering similar cuisines. Used SWIN model.

## Additional Use Cases
Implemented the following additional features:
- *Filtering Options*:
  - By Country
  - By Average Spend for Two People
  - By Cuisines
- *Search Functionality*: Enable search for restaurants by name.

## Tech Stack
- *Backend*: Python, FastAPI
- *Frontend*: ReactJS
- *Database*: MongoDB
- *HTTP Requests*: Axios
- *Image Classification Model*: [skylord/swin-finetuned-food101](https://huggingface.co/skylord/swin-finetuned-food101) (Trained on the [Food-101 dataset](https://huggingface.co/datasets/ethz/food101))

## Commands to run the project
### Clone the repository
```bash
git clone https://github.com/PrannayH/DineHunt.git
```
### Backend
To start the FastAPI server, run:
```bash
cd pes-Prannay
uvicorn app.main:app --reload
```
### Frontend
To start the React app, run:
```bash
cd pes-Prannay/zomato-frontend
npm start
```
