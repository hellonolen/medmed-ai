
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
        details: "USP 0.033% or 0.09%, Ascorbic Acid USP (Vit C). For topical application only, not for use in eyes.",
        price: "30g $45 / 60g $75"
      },
      {
        name: "Tretinoin Gel",
        type: "Gel (Anhydrous)",
        details: "USP 0.06% or 0.09%, Ascorbic Acid USP (Vit C). For topical application only, not for use in eyes.",
        price: "30g $45 / 60g $75"
      },
      {
        name: "Azelaic Acid",
        type: "Cream",
        details: "15%, for rosacea and acne. For topical application only, not for use in eyes.",
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
        details: "DMAE 3%, Estriol USP 0.3%, GHK-Cu 0.2%, Hyaluronic Acid USP 1.5%. For topical application only, not for use in eyes.",
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
        details: "Retinol 0.5%, Vitamin E, Hyaluronic Acid. For topical application only, not for use in eyes.",
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
  },
  {
    category: "Injectable Medications",
    products: [
      {
        name: "Insulin Glargine",
        type: "Injection",
        details: "100 units/mL, long-acting insulin\nRecommended Specialist: Endocrinology",
        price: "10mL vial $150-300"
      },
      {
        name: "Adalimumab",
        type: "Injection",
        details: "40mg/0.4mL, for rheumatoid arthritis, psoriasis, and other autoimmune conditions\nRecommended Specialist: Rheumatology",
        price: "2 pens $5,000-6,000"
      },
      {
        name: "Vitamin B12",
        type: "Injection",
        details: "1000mcg/mL, for B12 deficiency\nRecommended Specialist: Primary Care",
        price: "10mL vial $30-50"
      }
    ]
  },
  {
    category: "Injectable Gels",
    products: [
      {
        name: "Shear-Thinning Hydrogel",
        type: "Injectable Gel",
        details: "Advanced biomaterial that becomes less viscous under stress, allowing for easy injection. Forms stable network for drug delivery and tissue regeneration.\nRecommended Specialist: Orthopedics",
        price: "Per treatment $200-500"
      },
      {
        name: "Temperature-Responsive Gel",
        type: "Injectable Gel",
        details: "Smart stimuli-responsive hydrogel that solidifies at body temperature. Used for controlled drug delivery and tissue engineering.\nRecommended Specialist: Regenerative Medicine",
        price: "Per treatment $300-700"
      },
      {
        name: "Alginate Injectable System",
        type: "Injectable Gel",
        details: "Forms gel in situ at physiological conditions. Widely used in tissue engineering to support cell growth and tissue regeneration.\nRecommended Specialist: Orthopedics",
        price: "Per treatment $250-450"
      },
      {
        name: "Chitosan-Based Gel",
        type: "Injectable Gel",
        details: "Features reversible sol-gel transition behavior, ideal for minimally invasive procedures to fill complex defects.\nRecommended Specialist: Reconstructive Surgery",
        price: "Per treatment $350-600"
      },
      {
        name: "Cross-Linked CNS Delivery Gel",
        type: "Injectable Gel",
        details: "Designed for drug delivery to the central nervous system, offering treatment for neurological disorders.\nRecommended Specialist: Neurology",
        price: "Per treatment $500-1000"
      },
      {
        name: "Long-Acting Drug Delivery Gel",
        type: "Injectable Gel",
        details: "Engineered to dissolve over time, releasing medications gradually. Reduces frequency of injections for chronic conditions.\nRecommended Specialist: Pain Management",
        price: "Per treatment $400-800"
      }
    ]
  }
];
