from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

import requests

@app.get("/v1/")
def read_root():
    return {"message": "FastAPI is operational"}


# In-memory cache
db_cache = {}

@app.post("/v1/populate-db")
def populate_db(api_key: str):
    headers = {"Authorization": f"Bearer {api_key}"}
    endpoints = [
        "account",
        "characters",
        "wallet",
        "commerce/transactions/current/buys",
        "commerce/transactions/current/sells",
    ]

    for endpoint in endpoints:
        url = f"https://api.guildwars2.com/v2/{endpoint}"
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            db_cache[endpoint] = response.json()
            print(f"Successfully fetched and cached data from {endpoint}:")
        else:
            print(f"Failed to fetch data from {endpoint}: {response.status_code}")

    return {"message": "Data fetching and caching process completed."}

@app.get("/v1/data/{endpoint_name}")
def get_data(endpoint_name: str):
    if endpoint_name in db_cache:
        return db_cache[endpoint_name]
    else:
        return {"error": "Data not found. Please populate the database first."}
