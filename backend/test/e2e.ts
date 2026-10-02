const BASE_URL = "http://localhost:3000";

const response = await fetch(`${BASE_URL}/api/vehicles`);
const vehicles = await response.json();

console.log("GET /api/vehicles");
console.log("Status:", response.status);
console.log("Vehicle:", vehicles[0].id);
console.log("Initial status:", vehicles[0].status);

if (response.status !== 200) {
  throw new Error("Failed to fetch vehicles");
}

if (vehicles[0].status !== "CREATED") {
  throw new Error(`Expected CREATED, got ${vehicles[0].status}`);
}

const controlResponse = await fetch(
  `${BASE_URL}/api/vehicles/${vehicles[0].id}/control`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "START",
    }),
  },
);

const updatedVehicle = await controlResponse.json();

console.log("\nPOST /api/vehicles/:id/control");
console.log("Action: START");
console.log("Status:", controlResponse.status);
console.log("Updated status:", updatedVehicle.status);

if (controlResponse.status !== 200) {
  throw new Error("START command failed");
}

if (updatedVehicle.status !== "IN_TRANSIT") {
  throw new Error(`Expected IN_TRANSIT, got ${updatedVehicle.status}`);
}

console.log("\nE2E TEST PASSED");
