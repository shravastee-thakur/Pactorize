import { useEffect, useState } from "react";
import "./App.css";

type VehicleStatus =
  | "CREATED"
  | "IN_TRANSIT"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED";

type ControlAction = "START" | "PAUSE" | "RESUME" | "CANCEL";

interface Vehicle {
  id: string;
  origin: string;
  destination: string;
  foobarQuantity: number;
  status: VehicleStatus;
  progress: number;
}
const API_URL = "http://localhost:3000";

const App = () => {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [controlLoading, setControlLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicle = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/vehicles`);
      if (!response.ok) {
        throw new Error("Failed to fetch vehicles");
      }
      const data: Vehicle[] = await response.json();
      setVehicle(data[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchVehicle();
  }, []);

  const handleControl = async (action: ControlAction) => {
    if (!vehicle) return;
    try {
      setControlLoading(true);
      setError(null);
      const response = await fetch(
        `${API_URL}/api/vehicles/${vehicle.id}/control`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        },
      );
      const data: Vehicle & { message?: string } = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "Control action failed");
      }
      setVehicle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setControlLoading(false);
    }
  };
  const renderControls = () => {
    if (!vehicle) return null;
    switch (vehicle.status) {
      case "CREATED":
        return (
          <>
            <button
              onClick={() => handleControl("START")}
              disabled={controlLoading}
            >
              Start Transport
            </button>
            <button
              className="danger"
              onClick={() => handleControl("CANCEL")}
              disabled={controlLoading}
            >
              Cancel
            </button>
          </>
        );
      case "IN_TRANSIT":
        return (
          <>
            <button
              onClick={() => handleControl("PAUSE")}
              disabled={controlLoading}
            >
              Pause
            </button>
            <button
              className="danger"
              onClick={() => handleControl("CANCEL")}
              disabled={controlLoading}
            >
              Cancel
            </button>
          </>
        );
      case "PAUSED":
        return (
          <>
            <button
              onClick={() => handleControl("RESUME")}
              disabled={controlLoading}
            >
              Resume
            </button>
            <button
              className="danger"
              onClick={() => handleControl("CANCEL")}
              disabled={controlLoading}
            >
              Cancel
            </button>
          </>
        );
      case "COMPLETED":
        return <p className="terminal-message">Transport completed.</p>;
      case "CANCELLED":
        return <p className="terminal-message">Transport cancelled.</p>;
    }
  };
  if (loading) {
    return <div className="page">Loading vehicle...</div>;
  }
  if (!vehicle) {
    return <div className="page">No vehicles available.</div>;
  }
  return (
    <main className="page">
      <div className="dashboard">
        <header>
          <p className="eyebrow">OPERATOR CONTROL</p>
          <h1>Interstellar Transportation</h1>
          <p className="subtitle">
            Monitor and control transportation between Star A and Star B.
          </p>
        </header>
        {error && <div className="error">{error}</div>}
        <section className="vehicle-card">
          <div className="vehicle-header">
            <div>
              <p className="label">Vehicle</p> <h2>{vehicle.id}</h2>
            </div>
            <span className={`status status-${vehicle.status.toLowerCase()}`}>
              {vehicle.status.replace("_", " ")}
            </span>
          </div>
          <div className="route">
            <div>
              <span className="label">Origin</span>
              <strong>{vehicle.origin}</strong>
            </div>
            <span className="arrow">→</span>
            <div>
              <span className="label">Destination</span>
              <strong>{vehicle.destination}</strong>
            </div>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Foobar Cargo</span>
              <strong>{vehicle.foobarQuantity} units</strong>
            </div>
            <div className="info-item">
              <span className="label">Progress</span>
              <strong>{vehicle.progress}%</strong>
            </div>
          </div>
          <div className="progress-section">
            <div className="progress-track">
              <div
                className="progress-bar"
                style={{ width: `${vehicle.progress}%` }}
              />
            </div>
          </div>
          <div className="controls">
            <span className="label">Controls</span>
            <div className="button-group"> {renderControls()} </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default App;
