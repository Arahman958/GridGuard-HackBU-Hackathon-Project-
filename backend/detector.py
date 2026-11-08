
import pandas as pd
from sklearn.ensemble import IsolationForest

from simulator import generate_readings


# Sensor measurements used by the ML model
FEATURES = [
    "temperature_c",
    "voltage_v",
    "current_a",
    "load_pct",
    "frequency_hz"
]


class GridAnomalyDetector:

    def __init__(self):
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.08,
            random_state=42
        )

        self.trained = False

    def train(self, baseline_readings=None):
        """
        Train the model using normal baseline sensor readings.
        """

        if baseline_readings is None:
            baseline_readings = generate_readings(
                count=1000,
                anomaly_rate=0,
                seed=42
            )

        df = pd.DataFrame(baseline_readings)
        X = df[FEATURES]

        self.model.fit(X)
        self.trained = True

    def analyze(self, reading):
        """
        Analyze one sensor reading and explain detected anomalies.
        """

        if not self.trained:
            raise RuntimeError("Detector has not been trained.")

        X = pd.DataFrame([reading])[FEATURES]

        prediction = self.model.predict(X)[0]
        score = self.model.decision_function(X)[0]

        is_anomaly = prediction == -1

        # Check individual sensor thresholds
        evidence = []

        if reading["temperature_c"] > 85:
            evidence.append(
                "Unusually high transformer temperature"
            )

        if reading["voltage_v"] < 220:
            evidence.append(
                "Voltage below expected operating range"
            )

        if reading["current_a"] > 170:
            evidence.append(
                "Unusually high electrical current"
            )

        if reading["load_pct"] > 90:
            evidence.append(
                "Transformer operating above expected load"
            )

        if not 59.8 <= reading["frequency_hz"] <= 60.2:
            evidence.append(
                "Electrical frequency outside expected range"
            )

        # Explain the ML model's decision separately
        if is_anomaly and evidence:
            model_explanation = (
                "The ML model detected an unusual sensor pattern, "
                "and one or more sensor thresholds were exceeded."
            )

            detection_type = "ml_and_sensor_warning"

        elif is_anomaly:
            model_explanation = (
                "The ML model detected an unusual combination of "
                "sensor measurements compared with its learned "
                "normal operating profile. No individual sensor "
                "crossed the configured warning thresholds."
            )

            detection_type = "ml_pattern_anomaly"

        elif evidence:
            model_explanation = (
                "The ML model did not classify this reading as "
                "an anomaly, but one or more individual sensor "
                "thresholds were exceeded. Human review is recommended."
            )

            detection_type = "sensor_warning_only"

        else:
            model_explanation = (
                "Sensor measurements are within configured "
                "warning thresholds, and the ML model did not "
                "detect an unusual pattern."
            )

            detection_type = "normal"

        return {
            "transformer_id": reading["transformer_id"],
            "timestamp": reading["timestamp"],
            "is_anomaly": bool(is_anomaly),
            "anomaly_score": round(float(score), 4),
            "detection_type": detection_type,
            "sensor_evidence": evidence,
            "model_explanation": model_explanation,
            "reading": reading
        }


if __name__ == "__main__":

    print("\nGRIDGUARD ANOMALY DETECTOR")
    print("=" * 50)

    detector = GridAnomalyDetector()

    print("Training model...")
    detector.train()

    print("Model training complete!")

    test_readings = generate_readings(
        count=20,
        anomaly_rate=0.08
    )

    detected_count = 0

    for reading in test_readings:

        result = detector.analyze(reading)

        if result["is_anomaly"]:
            detected_count += 1

            print("\nANOMALY DETECTED")
            print("Transformer:", result["transformer_id"])
            print("Score:", result["anomaly_score"])
            print("Detection type:", result["detection_type"])
            print("Evidence:", result["sensor_evidence"])
            print("Explanation:", result["model_explanation"])

    print("\nDETECTION SUMMARY")
    print("=" * 50)
    print("Total readings:", len(test_readings))
    print("Flagged readings:", detected_count)
