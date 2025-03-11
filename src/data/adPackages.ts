
// Ad packages data with weekly pricing
export const adPackages = [
  {
    id: "standard",
    name: "Standard Ad Package",
    price: 5000, // Price per week in dollars
    description: "Placement in the bottom row of the partner section",
    features: [
      "Bottom row placement in partners section",
      "Full description with same character limit",
      "Advanced analytics dashboard",
      "Complete performance metrics",
      "Partner login access"
    ]
  },
  {
    id: "premium",
    name: "Premium Ad Package",
    price: 10000, // Price per week in dollars
    description: "Placement in the top row of the partner section",
    features: [
      "Top row placement in partners section",
      "Full description with same character limit",
      "Advanced analytics dashboard",
      "Complete performance metrics",
      "Partner login access"
    ]
  }
];

// Maximum duration in weeks (13 weeks = 3 months)
export const MAX_DURATION_WEEKS = 13;
