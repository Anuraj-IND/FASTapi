from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import httpx
import json

app = FastAPI(title="Disaster Safety Portal")

# Set up templates and static files
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Safety guidelines for different disasters
SAFETY_GUIDELINES = {
    "flood": {
        "immediate": [
            "Move to higher ground immediately",
            "Avoid walking or driving through flood waters",
            "Stay away from power lines and electrical wires"
        ],
        "preparation": [
            "Keep emergency kit ready",
            "Store important documents in waterproof container",
            "Know your evacuation route"
        ]
    },
    "earthquake": {
        "immediate": [
            "Drop, Cover, and Hold On",
            "Stay away from windows and exterior walls",
            "If indoors, stay inside until shaking stops"
        ],
        "preparation": [
            "Identify safe spots in each room",
            "Secure heavy furniture and objects",
            "Keep emergency supplies accessible"
        ]
    },
    "cyclone": {
        "immediate": [
            "Stay indoors and away from windows",
            "Listen to official instructions",
            "Move to designated shelter if advised"
        ],
        "preparation": [
            "Board up windows and secure loose items",
            "Keep emergency supplies ready",
            "Know your evacuation route"
        ]
    },
    "heavyrain": {
        "immediate": [
            "Avoid flood-prone areas",
            "Stay indoors if possible",
            "Be prepared for power outages"
        ],
        "preparation": [
            "Clear drainage systems",
            "Keep emergency lighting ready",
            "Store drinking water"
        ]
    }
}

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        "index.html", 
        {
            "request": request,
            "safety_guidelines": SAFETY_GUIDELINES
        }
    )

@app.get("/check-safety/{lat}/{lon}")
async def check_safety(lat: float, lon: float):
    # Simulating multiple active disasters
    return {
        "alerts": [
            {
                "type": "flood",
                "risk_level": "severe",
                "description": "Severe flooding expected. Water levels rising rapidly.",
                "safe_zones": [
                    {"lat": lat + 0.1, "lon": lon + 0.1, "name": "Highland Community Center", "distance": "2.5 km"},
                    {"lat": lat + 0.2, "lon": lon - 0.1, "name": "City Emergency Shelter", "distance": "3.1 km"}
                ]
            },
            {
                "type": "cyclone",
                "risk_level": "high",
                "description": "Category 3 cyclone approaching. Expected landfall in 6 hours.",
                "safe_zones": [
                    {"lat": lat - 0.1, "lon": lon + 0.15, "name": "Underground Storm Shelter", "distance": "1.8 km"},
                    {"lat": lat - 0.15, "lon": lon - 0.1, "name": "Reinforced School Building", "distance": "2.7 km"}
                ]
            },
            {
                "type": "heavyrain",
                "risk_level": "moderate",
                "description": "Torrential rainfall continuing for next 24 hours.",
                "safe_zones": [
                    {"lat": lat + 0.05, "lon": lon + 0.05, "name": "Municipal Safe House", "distance": "1.2 km"}
                ]
            }
        ],
        "emergency_instructions": "IMMEDIATE EVACUATION REQUIRED"
    }
