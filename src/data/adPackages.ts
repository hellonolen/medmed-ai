
// Ad packages data with weekly pricing
export const adPackages = [
  {
    id: "standard",
    name: "Standard Ad Package",
    price: 5000, // Price per week in dollars
    description: "Your brand featured in our partners section",
    features: [
      "Standard position in partners section",
      "Up to 80 characters description",
      "Basic analytics dashboard",
      "Weekly performance report"
    ]
  },
  {
    id: "premium",
    name: "Premium Ad Package",
    price: 10000, // Price per week in dollars
    description: "Premium placement with enhanced visibility",
    features: [
      "Top position in partners section",
      "Up to 120 characters description",
      "Priority placement for maximum visibility",
      "Advanced analytics dashboard",
      "Daily performance metrics"
    ]
  }
];

// Maximum duration in weeks (13 weeks = 3 months)
export const MAX_DURATION_WEEKS = 13;
