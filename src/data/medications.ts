
export interface Medication {
  category: string;
  products: Array<{
    name: string;
    type: string;
    details: string;
    price: string;
    dosage?: string;
    benefits?: string[];
  }>;
}

export const medications: Medication[] = [
  {
    category: "ACNE/ROSACEA",
    products: [
      {
        name: "Tretinoin Cream",
        type: "Cream",
        details: "USP 0.033% or 0.09%, Ascorbic Acid USP (Vit C)",
        price: "30g $45 / 60g $75"
      },
      {
        name: "Tretinoin Gel",
        type: "Gel (Anhydrous)",
        details: "USP 0.06% or 0.09%, Ascorbic Acid USP (Vit C)",
        price: "30g $45 / 60g $75"
      }
    ]
  },
  {
    category: "Anti-Aging",
    products: [
      {
        name: "Peptide Cream",
        type: "Cream",
        details: "DMAE 3%, Estriol USP 0.3%, GHK-Cu 0.2%, Hyaluronic Acid USP 1.5%",
        price: "30g $135",
        benefits: [
          "Improves skin moisture",
          "Decreases wrinkle depth",
          "Mitigates forehead lines",
          "Improves lip shape and fullness"
        ]
      }
    ]
  }
];
