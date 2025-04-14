// Vehicle types and their specifications
export const VEHICLES = {
  BIKE: {
    maxWeight: 20, // kg
    maxQuantity: 5,
    name: 'Delivery Bike'
  },
  MINI_VAN: {
    maxWeight: 500, // kg
    maxQuantity: 50,
    name: 'Mini Van'
  },
  TRUCK: {
    maxWeight: 2000, // kg
    maxQuantity: 200,
    name: 'Delivery Truck'
  },
  HEAVY_TRUCK: {
    maxWeight: 10000, // kg
    maxQuantity: 1000,
    name: 'Heavy Duty Truck'
  }
};

export function determineVehicle(weight, quantity) {
  if (weight <= VEHICLES.BIKE.maxWeight && quantity <= VEHICLES.BIKE.maxQuantity) {
    return VEHICLES.BIKE;
  } else if (weight <= VEHICLES.MINI_VAN.maxWeight && quantity <= VEHICLES.MINI_VAN.maxQuantity) {
    return VEHICLES.MINI_VAN;
  } else if (weight <= VEHICLES.TRUCK.maxWeight && quantity <= VEHICLES.TRUCK.maxQuantity) {
    return VEHICLES.TRUCK;
  } else {
    return VEHICLES.HEAVY_TRUCK;
  }
}