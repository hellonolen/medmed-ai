
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
      },
      {
        name: "Azelaic Acid",
        type: "Cream",
        details: "15%, for rosacea and acne",
        price: "30g $35"
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
      },
      {
        name: "Retinol Complex",
        type: "Serum",
        details: "Retinol 0.5%, Vitamin E, Hyaluronic Acid",
        price: "30ml $85"
      }
    ]
  },
  {
    category: "Respiratory Conditions",
    products: [
      {
        name: "Albuterol Inhaler",
        type: "Inhaler",
        details: "90mcg per actuation, 200 doses",
        price: "$25-45 with insurance"
      },
      {
        name: "Fluticasone Propionate",
        type: "Nasal Spray",
        details: "50mcg per spray, 120 sprays",
        price: "$30-50 with insurance"
      }
    ]
  },
  {
    category: "Gastrointestinal Conditions",
    products: [
      {
        name: "Omeprazole",
        type: "Capsule",
        details: "20mg, treats heartburn and GERD",
        price: "30 capsules $15-25"
      },
      {
        name: "Loperamide",
        type: "Tablet",
        details: "2mg, anti-diarrheal",
        price: "24 tablets $8-12"
      }
    ]
  },
  {
    category: "Pain Relief",
    products: [
      {
        name: "Ibuprofen",
        type: "Tablet",
        details: "200mg, anti-inflammatory",
        price: "100 tablets $8-12"
      },
      {
        name: "Acetaminophen",
        type: "Tablet",
        details: "500mg, pain reliever",
        price: "100 tablets $6-10"
      }
    ]
  },
  {
    category: "Allergy Relief",
    products: [
      {
        name: "Loratadine",
        type: "Tablet",
        details: "10mg, 24-hour non-drowsy relief",
        price: "30 tablets $12-18"
      },
      {
        name: "Diphenhydramine",
        type: "Capsule",
        details: "25mg, antihistamine and sleep aid",
        price: "50 capsules $8-12"
      }
    ]
  }
];
