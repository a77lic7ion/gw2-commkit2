# GW2 Commander's Toolkit - FastAPI Backend

This directory contains a simple FastAPI backend designed to cache data from the official Guild Wars 2 API, reducing redundant calls and providing a local data source for the API Explorer.

## Setup

### 1. Install Dependencies

Ensure you have Python 3 installed. Then, navigate to this `backend` directory in your terminal and install the required packages using pip:

```bash
pip install -r requirements.txt
```

### 2. Run the Server

Once the dependencies are installed, you can start the FastAPI server using `uvicorn`. The frontend is configured to connect to `http://localhost:8888` by default.

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8888
```

- `--reload`: This flag enables auto-reloading, so the server will restart automatically when you make changes to the code.
- `--host 0.0.0.0`: This makes the server accessible from your local network, not just `localhost`.
- `--port 8888`: This specifies the port the server will run on. If you change this, be sure to update the "Fast-API Base URL" in the application's Settings page.

## Usage

After running the server, you can use the main application to populate the local database and query the cached endpoints via the API Explorer.
