
import os
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq


# Load the backend .env file
ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(ENV_PATH)

MODEL = os.getenv(
    "GROQ_MODEL",
    "llama-3.3-70b-versatile"
)


def analyze_incident(alert):
    """
    Generate an evidence-based incident explanation
    using the sensor data and anomaly detector results.
    """

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is missing. Check backend/.env."
        )

    client = Groq(api_key=api_key)

    reading = alert.get("reading", {})

    incident_data = {
        "transformer_id": alert.get("transformer_id"),
        "timestamp": alert.get("timestamp"),
        "is_anomaly": alert.get("is_anomaly"),
        "anomaly_score": alert.get("anomaly_score"),
        "detection_type": alert.get("detection_type"),
        "sensor_evidence": alert.get("sensor_evidence", []),
        "model_explanation": alert.get("model_explanation"),
        "sensor_readings": {
            "temperature_c": reading.get("temperature_c"),
            "voltage_v": reading.get("voltage_v"),
            "current_a": reading.get("current_a"),
            "load_pct": reading.get("load_pct"),
            "frequency_hz": reading.get("frequency_hz")
        },
        "simulated_fault": reading.get("simulated_fault")
    }

    system_prompt = """
You are GridGuard's AI incident analyst for a smart-grid
monitoring demonstration.

Your job is to explain anomaly alerts to human technicians.

IMPORTANT RULES:

1. Use only the supplied incident data.
2. Never invent sensor measurements, equipment history,
   weather conditions, or infrastructure details.
3. Clearly separate observed measurements from possible causes.
4. Treat possible causes as hypotheses, not confirmed diagnoses.
5. An Isolation Forest anomaly score is NOT a probability
   or confidence percentage.
6. A simulated_fault label is demonstration metadata.
   It is not independent sensor evidence.
7. Do not claim that equipment has failed unless the data
   actually establishes that.
8. Never recommend automatically switching off, disconnecting,
   or controlling real electrical infrastructure.
9. Recommend human inspection and established safety procedures.
10. Mention that this demonstration uses synthetic data.

Write a concise, professional incident report with these sections:

## Incident Summary
## Observed Evidence
## Possible Explanations
## Recommended Technician Actions
## Limitations

If evidence is insufficient, explicitly say so.
"""

    user_prompt = (
        "Analyze this GridGuard incident using the supplied data. "
        "Do not infer facts that are not present:\n\n"
        f"{incident_data}"
    )

    completion = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],
        temperature=0.2,
        max_completion_tokens=900
    )

    analysis = completion.choices[0].message.content

    return {
        "transformer_id": alert.get("transformer_id"),
        "analysis": analysis,
        "model": MODEL
    }
