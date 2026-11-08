# GridGuard ⚡
### Smart Grid Anomaly Detection & AI-Powered Transformer Monitoring

GridGuard is a smart-grid monitoring prototype that uses machine learning to detect unusual transformer behavior and AI to help explain potential issues.

The system simulates electrical transformer sensor readings, identifies anomalies using an Isolation Forest model, and generates AI-assisted incident reports with possible explanations and recommended technician actions.

The goal is to demonstrate how machine learning and AI can support predictive maintenance and make electrical infrastructure monitoring more accessible.

## Features

- **Transformer Monitoring:** Monitor four simulated transformers (TX-001 through TX-004).
- **Sensor Simulation:** Generate temperature, voltage, current, load, and frequency readings.
- **Fault Simulation:** Inject different fault scenarios into a selected transformer.
- **Machine Learning Detection:** Use Isolation Forest to identify unusual sensor patterns.
- **Incident Alerts:** Display detected anomalies and their associated sensor evidence.
- **AI Incident Analysis:** Generate explanations, possible causes, and recommended investigation steps using Groq.
- **Sensor Analytics:** Visualize sensor measurements through interactive charts.
- **Human-in-the-Loop Design:** Provide advisory recommendations without automatically controlling infrastructure.

## How It Works

GridGuard follows a four-step workflow:

1. **Generate Sensor Data:** Python simulates readings from four electrical transformers.
2. **Detect Anomalies:** An Isolation Forest model analyzes sensor measurements and flags unusual patterns.
3. **Analyze Incidents:** The Groq API sends incident information to an AI model, which generates an explanation and suggested actions.
4. **Display Results:** A React dashboard presents transformer readings, anomaly alerts, charts, and AI-generated reports.

## System Architecture

```text
             SENSOR SIMULATOR
                    |
                    v
             PYTHON BACKEND
               (FastAPI)
                    |
                    v
          ISOLATION FOREST MODEL
             Anomaly Detection
                    |
                    v
              INCIDENT ALERTS
                    |
                    v
              GROQ AI ANALYST
           Explanation & Guidance
                    |
                    v
             REACT DASHBOARD
       Monitoring, Alerts & Analytics
```

## Technologies Used

| Technology | Purpose |
|---|---|
| Python | Backend logic and sensor simulation |
| FastAPI | Backend API |
| Scikit-learn | Isolation Forest anomaly detection |
| Pandas | Sensor data processing |
| Groq API | AI-powered incident analysis |
| React | Frontend dashboard |
| Vite | Frontend development server |
| Axios | API communication |
| Recharts | Sensor visualization |
| Lucide React | Dashboard icons |

## Supported Sensor Measurements

| Measurement | Description |
|---|---|
| Temperature (°C) | Transformer temperature |
| Voltage (V) | Electrical voltage |
| Current (A) | Electrical current |
| Load (%) | Transformer load percentage |
| Frequency (Hz) | Electrical system frequency |

## Simulated Fault Scenarios

GridGuard supports the following fault scenarios:

- Overheating
- Voltage Drop
- Current Spike
- Overload
- Frequency Instability

Users can select which transformer receives a simulated fault.

## Getting Started

### Prerequisites

- Python 3.10 or newer
- Node.js and npm
- A Groq API key for AI incident analysis

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/GridGuard.git
cd GridGuard
```

### 2. Set Up the Backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
```

Replace the placeholder with your own Groq API key.

**Never upload your `.env` file or expose your API key publicly.**

### 4. Start the Backend

From the `backend` directory, run:

```bash
uvicorn main:app --reload
```

The backend will be available at:

`http://127.0.0.1:8000`

Interactive API documentation:

`http://127.0.0.1:8000/docs`

### 5. Set Up the Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

### 6. Start the Frontend

```bash
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

## Example Workflow

1. Open the GridGuard dashboard.
2. Run a normal simulation to populate transformer readings.
3. Select a transformer and a fault scenario.
4. Simulate the fault.
5. Open Incident Alerts to review detected anomalies.
6. Select an incident and generate an AI-assisted report.
7. Explore Sensor Analytics to view measurement trends.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API information |
| GET | `/health` | Backend health check |
| GET | `/api/readings` | Retrieve sensor readings |
| GET | `/api/alerts` | Retrieve detected alerts |
| POST | `/api/simulate` | Run a normal simulation |
| POST | `/api/simulate-fault` | Generate a simulated fault |
| POST | `/api/live-reading` | Generate a new simulated reading |
| POST | `/api/analyze-incident` | Generate an AI incident report |

## Important Limitations

- GridGuard currently uses synthetic sensor data, not measurements from real electrical transformers.
- The Isolation Forest anomaly score is an outlier score, not a probability of equipment failure.
- An anomaly does not necessarily indicate a confirmed equipment fault.
- AI-generated explanations are possible hypotheses and should not be treated as confirmed diagnoses.
- All recommendations require human review and verification.
- The prototype does not connect to, control, or shut down real electrical infrastructure.
- Simulation history is stored in backend memory and is cleared when the backend restarts.

## Future Improvements

Potential future development includes:

- Integration with real IoT sensor devices.
- Persistent storage for historical transformer readings and incidents.
- Real-time monitoring and notifications.
- More advanced anomaly detection models.
- Transformer health trends and predictive maintenance analytics.
- User authentication and role-based access.

## Project Purpose

GridGuard was developed as a demonstration of how machine learning and generative AI can work together to support electrical infrastructure monitoring, anomaly detection, and technician decision-making.

**GridGuard — Detect unusual patterns. Understand potential risks. Support better decisions.**
