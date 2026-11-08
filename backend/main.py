
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from simulator import (
    generate_readings,
    generate_live_reading,
    generate_fault_scenario
)
from detector import GridAnomalyDetector
from ai_analyst import analyze_incident


# Initialize the application
app = FastAPI(
    title="GridGuard API",
    description="Smart Grid Anomaly Monitoring System",
    version="1.0"
)


# Allow the React frontend to communicate with Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize and train the detector
detector = GridAnomalyDetector()
detector.train()


# Store generated readings and alerts
readings_history = []
alerts_history = []


@app.get("/")
def home():
    return {
        "message": "Welcome to GridGuard API",
        "status": "online"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "detector_trained": detector.trained
    }


@app.get("/api/readings")
def get_readings():
    return {
        "total": len(readings_history),
        "readings": readings_history
    }


@app.get("/api/alerts")
def get_alerts():
    return {
        "total": len(alerts_history),
        "alerts": alerts_history
    }
    

@app.post("/api/analyze-incident")
def analyze_grid_incident(alert_index: int = 0):

    if not alerts_history:
        raise HTTPException(
            status_code=404,
            detail="No incidents available to analyze."
        )

    if alert_index < 0 or alert_index >= len(alerts_history):
        raise HTTPException(
            status_code=404,
            detail="Invalid alert index."
        )

    selected_alert = alerts_history[alert_index]

    try:
        result = analyze_incident(selected_alert)
        return result

    except RuntimeError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    except Exception as error:
        print("Groq analysis error:", str(error))

        raise HTTPException(
            status_code=502,
            detail="AI incident analysis failed. Check the backend logs."
        )



@app.post("/api/simulate")
def simulate_readings(count: int = 20):
    global readings_history, alerts_history

    if count < 1 or count > 500:
        raise HTTPException(
            status_code=400,
            detail="Count must be between 1 and 500"
        )

    new_readings = generate_readings(
        count=count,
        anomaly_rate=0.08
    )

    readings_history = []
    alerts_history = []

    for reading in new_readings:
        result = detector.analyze(reading)

        readings_history.append(result)

        if result["is_anomaly"]:
            alerts_history.append(result)

    return {
        "message": "Simulation completed",
        "total_readings": len(readings_history),
        "total_alerts": len(alerts_history),
        "readings": readings_history,
        "alerts": alerts_history
    }


@app.post("/api/simulate-fault")
def simulate_fault(
    fault_type: str = "overheating",
    transformer_id: str = "TX-001",
    count: int = 20
):
    global readings_history, alerts_history

    try:
        new_readings = generate_fault_scenario(
            fault_type=fault_type,
            transformer_id=transformer_id,
            count=count
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    # Add new readings without deleting existing transformer data
    for reading in new_readings:
        result = detector.analyze(reading)

        readings_history.append(result)

        if result["is_anomaly"]:
            alerts_history.append(result)

    return {
        "message": f"{fault_type} scenario completed",
        "fault_type": fault_type,
        "transformer_id": transformer_id,
        "total_readings": len(readings_history),
        "total_alerts": len(alerts_history),
        "readings": readings_history,
        "alerts": alerts_history
    }



@app.post("/api/live-reading")
def live_reading():
    reading = generate_live_reading()

    result = detector.analyze(reading)

    readings_history.append(result)

    if result["is_anomaly"]:
        alerts_history.append(result)

    return result
