import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import { vehicles } from "./store.js";
import { ControlAction, VehicleStatus } from "./types.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

const validActions: ControlAction[] = ["START", "PAUSE", "RESUME", "CANCEL"];

const validTransitions: Record<
  VehicleStatus,
  Partial<Record<ControlAction, VehicleStatus>>
> = {
  CREATED: {
    START: "IN_TRANSIT",
    CANCEL: "CANCELLED",
  },

  IN_TRANSIT: {
    PAUSE: "PAUSED",
    CANCEL: "CANCELLED",
  },

  PAUSED: {
    RESUME: "IN_TRANSIT",
    CANCEL: "CANCELLED",
  },

  COMPLETED: {},

  CANCELLED: {},
};

app.get("/api/vehicles", (_req: Request, res: Response) => {
  return res.status(200).json(vehicles);
});

app.post("/api/vehicles/:id/control", (req: Request, res: Response) => {
  const { id } = req.params;
  const { action } = req.body as { action?: string };

  const vehicle = vehicles.find((vehicle) => vehicle.id === id);

  if (!vehicle) {
    return res.status(404).json({
      message: "Vehicle not found",
    });
  }

  if (!action || !validActions.includes(action as ControlAction)) {
    return res.status(400).json({
      message: "Invalid control action",
    });
  }

  const controlAction = action as ControlAction;

  const nextStatus = validTransitions[vehicle.status][controlAction];

  if (!nextStatus) {
    return res.status(400).json({
      message: `Cannot perform ${controlAction} when vehicle is ${vehicle.status}`,
    });
  }

  vehicle.status = nextStatus;

  return res.status(200).json(vehicle);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
