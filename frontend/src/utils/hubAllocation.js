import { DELIVERY_POINTS, findHubByDeliveryPoint } from './deliveryPoints';

// Hub locations and their coverage areas
export const HUBS = {
  TRICHY: {
    name: 'Trichy Hub',
    coverageAreas: ['Trichy', 'Thanjavur', 'Pudukkottai', 'Karur'],
  },
  SALEM: {
    name: 'Salem Hub',
    coverageAreas: ['Salem', 'Erode', 'Namakkal', 'Dharmapuri'],
  },
  NAMBIYUR: {
    name: 'Nambiyur Hub',
    coverageAreas: ['Nambiyur', 'Gobichettipalayam', 'Sathyamangalam', 'Bhavani'],
  },
};

export function determineHub(location) {
  // First check if location matches any delivery point
  const hubByDeliveryPoint = findHubByDeliveryPoint(location);
  if (hubByDeliveryPoint) {
    return hubByDeliveryPoint;
  }

  // Fallback to checking coverage areas
  for (const [hubKey, hub] of Object.entries(HUBS)) {
    if (hub.coverageAreas.some(area => 
      location.toLowerCase().includes(area.toLowerCase())
    )) {
      return hubKey;
    }
  }
  
  // Default to nearest hub based on basic distance calculation
  return 'TRICHY';
}