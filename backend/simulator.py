
import random
from datetime import datetime, timezone, timedelta


TRANSFORMERS = [
    "TX-001",
    "TX-002",
    "TX-003",
    "TX-004"
]

NORMAL_RANGES = {
    "temperature_c": (45, 75),
    "voltage_v": (230, 240),
    "current_a": (80, 140),
    "load_pct": (40, 85),
    "frequency_hz": (59.9, 60.1)
}

FAULT_TYPES = [
    "overheating",
    "voltage_drop",
    "current_spike",
    "overload",
    "frequency_instability"
]


def generate_normal_reading(transformer_id, timestamp=None):
    """Generate one normal transformer sensor reading."""

    if timestamp is None:
        timestamp = datetime.now(timezone.utc)

    return {
        "transformer_id": transformer_id,
        "timestamp": timestamp.isoformat(),
        "temperature_c": round(random.uniform(45, 75), 2),
        "voltage_v": round(random.uniform(230, 240), 2),
        "current_a": round(random.uniform(80, 140), 2),
        "load_pct": round(random.uniform(40, 85), 2),
        "frequency_hz": round(random.uniform(59.9, 60.1), 3)
    }


def inject_anomaly(reading, anomaly_type=None):
    """Inject a selected or random fault into a reading."""

    if anomaly_type is None:
        anomaly_type = random.choice(FAULT_TYPES)

    if anomaly_type not in FAULT_TYPES:
        raise ValueError(f"Unsupported fault type: {anomaly_type}")

    if anomaly_type == "overheating":
        reading["temperature_c"] = 100.0
        reading["current_a"] = 165.0

    elif anomaly_type == "voltage_drop":
        reading["voltage_v"] = 205.0

    elif anomaly_type == "current_spike":
        reading["current_a"] = 220.0

    elif anomaly_type == "overload":
        reading["load_pct"] = 110.0
        reading["current_a"] = 190.0

    elif anomaly_type == "frequency_instability":
        reading["frequency_hz"] = 58.8

    # Evaluation metadata only. Never used as a detector feature.
    reading["simulated_fault"] = anomaly_type

    return reading


def generate_readings(count=100, anomaly_rate=0.08, seed=42):
    """Generate a historical batch of sensor readings."""

    random.seed(seed)

    readings = []
    start_time = datetime.now(timezone.utc) - timedelta(minutes=count)

    for i in range(count):
        transformer_id = random.choice(TRANSFORMERS)
        timestamp = start_time + timedelta(minutes=i)

        reading = generate_normal_reading(
            transformer_id,
            timestamp
        )

        if random.random() < anomaly_rate:
            reading = inject_anomaly(reading)

        readings.append(reading)

    return readings


def generate_live_reading():
    """Generate one new reading for live monitoring."""

    transformer_id = random.choice(TRANSFORMERS)
    reading = generate_normal_reading(transformer_id)

    if random.random() < 0.08:
        reading = inject_anomaly(reading)

    return reading


def generate_fault_scenario(
    fault_type,
    transformer_id="TX-001",
    count=20
):
    """
    Generate a repeatable demonstration scenario.

    The selected transformer operates normally for the first
    readings, then experiences the requested fault at the end.
    """

    if fault_type not in FAULT_TYPES:
        raise ValueError(
            f"Unsupported fault type. Choose from: {FAULT_TYPES}"
        )

    if transformer_id not in TRANSFORMERS:
        raise ValueError("Unknown transformer ID")

    if not 2 <= count <= 100:
        raise ValueError("Count must be between 2 and 100")

    readings = []

    start_time = datetime.now(timezone.utc) - timedelta(
        minutes=count
    )

    for i in range(count):
        timestamp = start_time + timedelta(minutes=i)

        reading = generate_normal_reading(
            transformer_id,
            timestamp
        )

        # Introduce the selected fault in the final reading.
        if i == count - 1:
            reading = inject_anomaly(reading, fault_type)

        readings.append(reading)

    return readings


if __name__ == "__main__":
    sample_readings = generate_readings(count=20)

    print("\nGRIDGUARD SENSOR SIMULATOR")
    print("=" * 50)

    for reading in sample_readings:
        print(reading)

    anomaly_count = sum(
        1 for reading in sample_readings
        if "simulated_fault" in reading
    )

    print("\nSimulation Summary")
    print("=" * 50)
    print(f"Total readings: {len(sample_readings)}")
    print(f"Simulated anomalies: {anomaly_count}")
    print(f"Normal readings: {len(sample_readings) - anomaly_count}")

