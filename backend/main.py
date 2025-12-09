from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

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

class ApiKey(BaseModel):
    apiKey: str

@app.get("/v1/")
def read_root():
    return {"message": "FastAPI is operational"}


# In-memory cache
db_cache = {}

@app.post("/v1/populate-db")
def populate_db(key: ApiKey):
    api_key = key.apiKey
    headers = {"Authorization": f"Bearer {api_key}"}

    # 1. Validate the API key first
    try:
        token_info_res = requests.get("https://api.guildwars2.com/v2/tokeninfo", headers=headers, timeout=10)
        if token_info_res.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid GW2 API Key or key does not have required permissions.")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Could not connect to the Guild Wars 2 API: {e}")

    # 2. Fetch data from endpoints
    endpoints = [
        "account", "characters", "wallet",
        "commerce/transactions/current/buys", "commerce/transactions/current/sells"
    ]

    successes = []
    failures = []

    for endpoint in endpoints:
        url = f"https://api.guildwars2.com/v2/{endpoint}"
        try:
            response = requests.get(url, headers=headers, timeout=15)
            if response.status_code == 200:
                db_cache[endpoint] = response.json()
                successes.append(endpoint)
                print(f"Successfully fetched and cached data from {endpoint}")
            else:
                failures.append({"endpoint": endpoint, "status_code": response.status_code, "reason": response.reason})
                print(f"Failed to fetch data from {endpoint}: {response.status_code}")
        except requests.exceptions.RequestException as e:
            failures.append({"endpoint": endpoint, "status_code": 503, "reason": str(e)})
            print(f"Network error fetching data from {endpoint}: {e}")

    return {
        "message": "Data fetching process completed.",
        "successful_endpoints": successes,
        "failed_endpoints": failures
    }

@app.get("/v1/data/{endpoint_name}")
def get_data(endpoint_name: str):
    if endpoint_name in db_cache:
        return db_cache[endpoint_name]
    else:
        return {"error": "Data not found. Please populate the database first."}
