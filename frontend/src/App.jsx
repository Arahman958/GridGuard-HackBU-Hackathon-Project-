import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Cpu,
  Gauge,
  Radio,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import "./index.css";

const API = "http://127.0.0.1:8000";

const TRANSFORMERS = ["TX-001", "TX-002", "TX-003", "TX-004"];

function App() {
  const [readings, setReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [health, setHealth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [faultType, setFaultType] = useState("overheating");
  const [faultLoading, setFaultLoading] = useState(false);

  const [selectedTransformer, setSelectedTransformer] = useState("TX-001");

  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [selectedAlertIndex, setSelectedAlertIndex] = useState(null);

  const [activePage, setActivePage] = useState("overview");
  useEffect(() => {
    axios
      .get(`${API}/health`)
      .then((response) => {
        setHealth(response.data.status === "healthy");
      })
      .catch(() => {
        setError("Cannot connect to the GridGuard backend.");
      });

    axios
      .get(`${API}/api/readings`)
      .then((response) => setReadings(response.data.readings))
      .catch(() => {});

    axios
      .get(`${API}/api/alerts`)
      .then((response) => setAlerts(response.data.alerts))
      .catch(() => {});
  }, []);

  async function runSimulation() {
    setLoading(true);
    setError("");
    setAnalysis(null);
    setAnalysisError("");

    try {
      const response = await axios.post(`${API}/api/simulate?count=80`);
      setReadings(response.data.readings);
      setAlerts(response.data.alerts);
    } catch (err) {
      setError(
        "Simulation failed. Make sure the Python backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  async function runFaultSimulation() {
    setFaultLoading(true);
    setError("");
    setAnalysis(null);
    setAnalysisError("");

    try {
      const response = await axios.post(
        `${API}/api/simulate-fault?fault_type=${faultType}&transformer_id=${selectedTransformer}&count=20`
      );

      setReadings(response.data.readings);
      setAlerts(response.data.alerts);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Fault simulation failed. Check the backend connection."
      );
    } finally {
      setFaultLoading(false);
    }
  }

  async function analyzeIncident(index) {
    setAnalysisLoading(true);
    setAnalysisError("");
    setAnalysis(null);
    setSelectedAlertIndex(index);

    try {
      const response = await axios.post(
        `${API}/api/analyze-incident?alert_index=${index}`
      );

      setAnalysis(response.data);
    } catch (err) {
      setAnalysisError(
        err.response?.data?.detail ||
          "AI analysis failed. Please try again."
      );
    } finally {
      setAnalysisLoading(false);
    }
  }

  const latestTransformers = useMemo(() => {
    return TRANSFORMERS.map((id) => {
      const transformerReadings = readings.filter(
        (item) => item.transformer_id === id
      );

      return transformerReadings[transformerReadings.length - 1];
    });
  }, [readings]);

  const chartData = useMemo(() => {
    return readings.map((item, index) => ({
      time: index + 1,
      temperature: item.reading.temperature_c,
      voltage: item.reading.voltage_v,
      current: item.reading.current_a,
      load: item.reading.load_pct,
      frequency: item.reading.frequency_hz,
    }));
  }, [readings]);

  const normalCount = readings.length - alerts.length;

  const pageInfo = {
  overview: {
    breadcrumb: "DASHBOARD",
    title: "Overview",
    description: "Monitor your smart grid and transformer network."
  },
  transformers: {
    breadcrumb: "ASSETS",
    title: "Transformer Monitoring",
    description: "Inspect individual transformers and their sensor readings."
  },
  alerts: {
    breadcrumb: "MONITORING",
    title: "Incident Alerts",
    description: "Review detected anomalies and investigate potential incidents."
  },
  analytics: {
    breadcrumb: "INSIGHTS",
    title: "Sensor Analytics",
    description: "Explore sensor measurements and trends across the network."
  }
}[activePage];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Zap size={23} fill="currentColor" />
          </div>
          <div>
            <h1>GridGuard</h1>
            <span>INTELLIGENT GRID MONITORING</span>
          </div>
        </div>

        <div className="nav-section">MAIN MENU</div>

<button
  className={`nav-item ${activePage === "overview" ? "active" : ""}`}
  onClick={() => setActivePage("overview")}
>
  <Activity size={18} />
  <span>Overview</span>
</button>

<button
  className={`nav-item ${activePage === "transformers" ? "active" : ""}`}
  onClick={() => setActivePage("transformers")}
>
  <Radio size={18} />
  <span>Transformers</span>
</button>

<button
  className={`nav-item ${activePage === "alerts" ? "active" : ""}`}
  onClick={() => setActivePage("alerts")}
>
  <AlertTriangle size={18} />
  <span>Incident alerts</span>
  <span className="nav-count">{alerts.length}</span>
</button>

<button
  className={`nav-item ${activePage === "analytics" ? "active" : ""}`}
  onClick={() => setActivePage("analytics")}
>
  <Gauge size={18} />
  <span>Sensor analytics</span>
</button>

        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <div className="status-dot" />
            <div>
              <strong>Backend connection</strong>
              <span>{health ? "Connected" : "Checking..."}</span>
            </div>
          </div>
          <p>GridGuard v1.0 · HackBU 2026</p>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div>
            <div className="breadcrumb">{pageInfo.breadcrumb}</div>
            <h1>{pageInfo.title}</h1>
            <p>{pageInfo.description}</p>
            <p>
              Monitor simulated transformer activity and detect unusual
              behavior.
            </p>
          </div>

<div className="topbar-right">
  <div className="system-indicator">
    <span className="status-dot" />
    {health ? "SYSTEM ONLINE" : "CONNECTING"}
  </div>

  <button
    className="run-button"
    onClick={runSimulation}
    disabled={loading || faultLoading}
  >
    <RefreshCw
      size={16}
      className={loading ? "spinning" : ""}
    />
    {loading ? "Running..." : "Run simulation"}
  </button>

  {/* Fault type selector */}
  <select
    className="fault-select"
    value={faultType}
    onChange={(e) => setFaultType(e.target.value)}
    disabled={faultLoading || loading}
    aria-label="Select fault scenario"
  >
    <option value="overheating">Overheating</option>
    <option value="voltage_drop">Voltage Drop</option>
    <option value="current_spike">Current Spike</option>
    <option value="overload">Overload</option>
    <option value="frequency_instability">
      Frequency Instability
    </option>
  </select>

  {/* Transformer selector */}
  <select
    className="fault-select"
    value={selectedTransformer}
    onChange={(e) => setSelectedTransformer(e.target.value)}
    disabled={faultLoading || loading}
    aria-label="Select transformer"
  >
    <option value="TX-001">TX-001</option>
    <option value="TX-002">TX-002</option>
    <option value="TX-003">TX-003</option>
    <option value="TX-004">TX-004</option>
  </select>

  <button
    className="fault-button"
    onClick={runFaultSimulation}
    disabled={faultLoading || loading}
  >
    <AlertTriangle size={16} />
    {faultLoading ? "Simulating..." : "Simulate Fault"}
  </button>
</div>

        </header>

        {error && <div className="error-banner">{error}</div>}

        {activePage === "overview" && (
  <section className="welcome-banner">
    <div>
      <span className="eyebrow">SMART GRID INTELLIGENCE</span>
      <h3>Infrastructure monitoring, made smarter.</h3>
      <p>
        Analyze transformer sensor data, identify anomalies,
        and surface evidence for human investigation.
      </p>
    </div>
    <div className="banner-icon">
      <ShieldCheck size={64} />
    </div>
  </section>
)}

{(activePage === "overview" || activePage === "analytics") && (
  <section className="stats-grid">
    <StatCard
      icon={<Radio />}
      label="TRANSFORMERS"
      value="04"
      detail="Simulated assets"
      color="blue"
    />

    <StatCard
      icon={<AlertTriangle />}
      label="ANOMALIES DETECTED"
      value={alerts.length.toString().padStart(2, "0")}
      detail="Flagged by ML model"
      color="orange"
    />

    <StatCard
      icon={<Activity />}
      label="READINGS ANALYZED"
      value={readings.length.toString()}
      detail="Sensor observations"
      color="purple"
    />

    <StatCard
      icon={<CheckCircle2 />}
      label="NORMAL READINGS"
      value={normalCount.toString()}
      detail="Not flagged by model"
      color="green"
    />
  </section>
)}

        {activePage === "overview" && (
      <section className="content-grid">
          <div className="panel chart-panel" id="analytics">
            <div className="panel-heading">
              <div>
                <h3>Temperature monitoring</h3>
                <p>Transformer temperature across generated readings</p>
              </div>
              <span className="chart-tag">
                <span className="status-dot" />
                SENSOR DATA
              </span>
            </div>

            {chartData.length > 0 ? (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="temperatureFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#38bdf8"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="#38bdf8"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#263449"
                    />

                    <XAxis
                      dataKey="time"
                      stroke="#718096"
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      stroke="#718096"
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />

                    <Tooltip
                      contentStyle={{
                        background: "#172337",
                        border: "1px solid #34445c",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="temperature"
                      name="Temperature"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      fill="url(#temperatureFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-chart">
                <Activity size={35} />
                <h4>No sensor data yet</h4>
                <p>Run a simulation to generate transformer readings.</p>
              </div>
            )}

            <div className="chart-footer">
              <span>
                <span className="legend-dot" /> Temperature (°C)
              </span>
              <span>Generated sensor observations</span>
            </div>
          </div>

          <div className="panel transformer-panel" id="transformers">
            <div className="panel-heading">
              <div>
                <h3>Transformer status</h3>
                <p>Latest available readings</p>
              </div>
              <Cpu size={20} className="muted-icon" />
            </div>

            <div className="transformer-list">
              {TRANSFORMERS.map((id, index) => {
                const item = latestTransformers[index];
                const anomaly = item?.is_anomaly;

                return (
                  <div className="transformer-item" key={id}>
                    <div className="transformer-symbol">
                      <Zap size={18} />
                    </div>

                    <div className="transformer-info">
                      <strong>{id}</strong>
                      <span>
                        {item
                          ? `${item.reading.temperature_c}°C · ${item.reading.load_pct}% load`
                          : "Awaiting readings"}
                      </span>
                    </div>

                    <span
                      className={`status-pill ${
                        !item ? "pending" : anomaly ? "warning" : "normal"
                      }`}
                    >
                      {!item ? "PENDING" : anomaly ? "REVIEW" : "NORMAL"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        )}

        
        {activePage === "transformers" && (
          <section className="transformer-page">
            <div className="page-intro">
              <h2>Transformer Assets</h2>
              <p>
                Monitor individual transformer performance and inspect
                their latest sensor measurements.
              </p>
            </div>

            <div className="transformer-detail-grid">
              {TRANSFORMERS.map((id, index) => {
                const item = latestTransformers[index];
                const sensor = item?.reading;

                return (
                  <div className="panel transformer-detail-card" key={id}>
                    <div className="panel-heading">
                      <div>
                        <h3>{id}</h3>
                        <p>Transformer monitoring unit</p>
                      </div>

                      <span
                        className={`status-pill ${
                          !item
                            ? "pending"
                            : item.is_anomaly
                            ? "warning"
                            : "normal"
                        }`}
                      >
                        {!item
                          ? "PENDING"
                          : item.is_anomaly
                          ? "REVIEW"
                          : "NORMAL"}
                      </span>
                    </div>

                    {sensor ? (
                      <div className="sensor-reading-grid">
                        <div className="sensor-reading">
                          <span>TEMPERATURE</span>
                          <strong>{sensor.temperature_c}°C</strong>
                        </div>

                        <div className="sensor-reading">
                          <span>VOLTAGE</span>
                          <strong>{sensor.voltage_v} V</strong>
                        </div>

                        <div className="sensor-reading">
                          <span>CURRENT</span>
                          <strong>{sensor.current_a} A</strong>
                        </div>

                        <div className="sensor-reading">
                          <span>LOAD</span>
                          <strong>{sensor.load_pct}%</strong>
                        </div>

                        <div className="sensor-reading">
                          <span>FREQUENCY</span>
                          <strong>{sensor.frequency_hz} Hz</strong>
                        </div>
                      </div>
                    ) : (
                      <div className="empty-transformer">
                        No readings available. Run a simulation to
                        populate this asset.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}


        {activePage === "overview" && (
  <section className="panel alerts-panel" id="alerts">
          <div className="panel-heading">
            <div>
              <h3>Recent anomaly alerts</h3>
              <p>Readings flagged for further human investigation</p>
            </div>
            <span className="alert-total">{alerts.length} FLAGGED</span>
          </div>

          {alerts.length > 0 ? (
            <div className="alerts-list">
              {alerts.slice(0, 6).map((alert, index) => (
                <div className="alert-item" key={index}>
                  <div className="alert-icon">
                    <AlertTriangle size={18} />
                  </div>

                  <div className="alert-description">
                    <strong>{alert.transformer_id}</strong>
                    <span>
                      {alert.sensor_evidence.length > 0
                        ? alert.sensor_evidence.join(" · ")
                        : "Unusual combination of sensor measurements"}
                    </span>
                  </div>

                  <div className="alert-score">
                    <span>ANOMALY SCORE</span>
                    <strong>{alert.anomaly_score}</strong>
                  </div>

                  <button
                    className="analyze-button"
                    onClick={() => analyzeIncident(index)}
                    disabled={analysisLoading}
                  >
                    {analysisLoading && selectedAlertIndex === index
                      ? "Analyzing..."
                      : "Analyze Incident"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-alerts">
              <CheckCircle2 size={22} />
              <span>No anomalies currently flagged.</span>
            </div>
          )}
        </section>
        )}

        
        {activePage === "alerts" && (
          <section className="incident-page">
            <div className="page-intro">
              <h2>Incident Investigation Center</h2>
              <p>
                Review detected anomalies, inspect sensor evidence,
                and generate AI-assisted incident reports.
              </p>
            </div>

            <div className="incident-summary">
              <div className="panel incident-summary-card">
                <span>TOTAL ALERTS</span>
                <strong>{alerts.length}</strong>
              </div>

              <div className="panel incident-summary-card">
                <span>TRANSFORMERS FLAGGED</span>
                <strong>
                  {new Set(alerts.map((alert) => alert.transformer_id)).size}
                </strong>
              </div>

              <div className="panel incident-summary-card">
                <span>AI ANALYSIS STATUS</span>
                <strong>{analysis ? "Completed" : "Awaiting"}</strong>
              </div>
            </div>

            <section className="panel alerts-panel">
              <div className="panel-heading">
                <div>
                  <h3>Detected Incidents</h3>
                  <p>All anomalies flagged by the detection system</p>
                </div>
                <span className="alert-total">
                  {alerts.length} FLAGGED
                </span>
              </div>

              {alerts.length > 0 ? (
                <div className="alerts-list">
                  {alerts.map((alert, index) => (
                    <div className="alert-item" key={index}>
                      <div className="alert-icon">
                        <AlertTriangle size={18} />
                      </div>

                      <div className="alert-description">
                        <strong>{alert.transformer_id}</strong>
                        <span>
                          {alert.sensor_evidence?.length > 0
                            ? alert.sensor_evidence.join(" · ")
                            : "Unusual combination of sensor measurements"}
                        </span>
                      </div>

                      <div className="alert-score">
                        <span>ANOMALY SCORE</span>
                        <strong>{alert.anomaly_score}</strong>
                      </div>

                      <button
                        className="analyze-button"
                        onClick={() => analyzeIncident(index)}
                        disabled={analysisLoading}
                      >
                        {analysisLoading && selectedAlertIndex === index
                          ? "Analyzing..."
                          : "Analyze Incident"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-alerts">
                  <CheckCircle2 size={22} />
                  <span>No anomalies currently flagged.</span>
                </div>
              )}
            </section>

            {(analysisLoading || analysisError || analysis) && (
              <section className="panel ai-report-panel">
                <div className="panel-heading">
                  <div>
                    <h3>AI Incident Analysis</h3>
                    <p>
                      Evidence-based incident report generated by GridGuard AI
                    </p>
                  </div>

                  <span className="ai-badge">
                    <ShieldCheck size={15} />
                    GROQ AI
                  </span>
                </div>

                {analysisLoading && (
                  <div className="ai-loading">
                    <RefreshCw size={22} className="spinning" />
                    <span>Analyzing incident data...</span>
                  </div>
                )}

                {analysisError && (
                  <div className="ai-error">{analysisError}</div>
                )}

                {analysis && (
                  <>
                    <div className="ai-report-meta">
                      <span>
                        TRANSFORMER: <strong>{analysis.transformer_id}</strong>
                      </span>
                      <span>
                        MODEL: <strong>{analysis.model}</strong>
                      </span>
                    </div>

                    <div className="analysis-content">
                      {analysis.analysis}
                    </div>

                    <p className="ai-disclaimer">
                      AI-generated recommendations are advisory only.
                      All findings require human verification. This
                      demonstration uses synthetic sensor data and does
                      not control real infrastructure.
                    </p>
                  </>
                )}
              </section>
            )}
          </section>
        )}

{activePage === "analytics" && (
  <section className="analytics-page">
    <div className="page-intro">
      <h2>Sensor Analytics</h2>
      <p>
        Explore sensor behavior across all simulated transformer
        readings and identify unusual measurement patterns.
      </p>
    </div>

    <div className="analytics-grid">

      <div className="panel analytics-card">
        <h3>Temperature</h3>
        <p>Transformer temperature (°C)</p>
        <div className="analytics-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#263449" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Area type="monotone" dataKey="temperature" stroke="#f97316" fill="#f97316" fillOpacity={0.12} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel analytics-card">
        <h3>Voltage</h3>
        <p>Transformer voltage (V)</p>
        <div className="analytics-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#263449" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Area type="monotone" dataKey="voltage" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.12} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel analytics-card">
        <h3>Current</h3>
        <p>Electrical current (A)</p>
        <div className="analytics-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#263449" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Area type="monotone" dataKey="current" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.12} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel analytics-card">
        <h3>Load</h3>
        <p>Transformer load (%)</p>
        <div className="analytics-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#263449" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Area type="monotone" dataKey="load" stroke="#34d399" fill="#34d399" fillOpacity={0.12} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel analytics-card">
        <h3>Frequency</h3>
        <p>Grid frequency (Hz)</p>
        <div className="analytics-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#263449" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Area type="monotone" dataKey="frequency" stroke="#facc15" fill="#facc15" fillOpacity={0.12} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  </section>
)}



        <footer className="footer">
          <span>GRIDGUARD · SMART GRID MONITORING</span>
          <span>
            <Clock3 size={13} /> Synthetic data demonstration
          </span>
        </footer>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, detail, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-detail">{detail}</span>
    </div>
  );
}

export default App;
