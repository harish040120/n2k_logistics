// Delivery points mapped to their respective hubs
export const DELIVERY_POINTS = {
  NAMBIYUR: [
    'Saravanampatti',
    'Mettupalayam',
    'Annur',
    'Karamadai',
    'Thudiyalur',
    'Kovilpalayam'
  ],
  SALEM: [
    'Hasthampatti',
    'Suramangalam',
    'Ammapet',
    'Shevapet',
    'Fairlands',
    'Kondalampatti'
  ],
  TRICHY: [
    'Srirangam',
    'Thiruverumbur',
    'Thillai Nagar',
    'Woraiyur',
    'K.K. Nagar',
    'Ariyamangalam'
  ]
};

// Function to find hub for a given delivery point
export function findHubByDeliveryPoint(address) {
  const normalizedAddress = address.toLowerCase().trim();
  
  for (const [hub, points] of Object.entries(DELIVERY_POINTS)) {
    if (points.some(point => 
      normalizedAddress.includes(point.toLowerCase())
    )) {
      return hub;
    }
  }
  return null;
}