export type VehicleStatus =
  | "CREATED"
  | "IN_TRANSIT"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED";

export type ControlAction = "START" | "PAUSE" | "RESUME" | "CANCEL";

export interface Vehicle {
  id: string;
  origin: string;
  destination: string;
  foobarQuantity: number;
  status: VehicleStatus;
  progress: number;
}
