export interface Medication {
  category: string;
  products: Array<{
    name: string;
    type: string;
    details: string;
    price: string;
    dosage?: string;
    benefits?: string[];
    region?: string; // Region where the medication is available
  }>;
}

export const medications: Medication[] = [
  {
    category: "ACNE/ROSACEA",
    products: [
      {
        name: "Tretinoin Cream",
        type: "Cream",
        details: "USP 0.033% or 0.09%, Ascorbic Acid USP (Vit C). WARNING: For topical application only, NOT FOR USE IN OR NEAR EYES.",
        price: "30g $45 / 60g $75",
        region: "global"
      },
      {
        name: "Tretinoin Gel",
        type: "Gel (Anhydrous)",
        details: "USP 0.06% or 0.09%, Ascorbic Acid USP (Vit C). WARNING: For topical application only, NOT FOR USE IN OR NEAR EYES.",
        price: "30g $45 / 60g $75",
        region: "global"
      },
      {
        name: "Azelaic Acid",
        type: "Cream",
        details: "15%, for rosacea and acne. WARNING: For topical application only, NOT FOR USE IN OR NEAR EYES.",
        price: "30g $35",
        region: "global"
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
        ],
        region: "global"
      },
      {
        name: "Retinol Complex",
        type: "Serum",
        details: "Retinol 0.5%, Vitamin E, Hyaluronic Acid. For topical application only, not for use in eyes.",
        price: "30ml $85",
        region: "global"
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
        price: "$25-45 with insurance",
        region: "north-america"
      },
      {
        name: "Fluticasone Propionate",
        type: "Nasal Spray",
        details: "50mcg per spray, 120 sprays",
        price: "$30-50 with insurance",
        region: "global"
      },
      {
        name: "Budesonide Formoterol",
        type: "Inhaler",
        details: "Combined corticosteroid and long-acting beta agonist for asthma and COPD",
        price: "€35-60 in Europe",
        region: "europe"
      },
      {
        name: "Montelukast",
        type: "Tablet",
        details: "Leukotriene receptor antagonist for asthma and allergies",
        price: "$20-40 with insurance",
        region: "global"
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
        price: "30 capsules $15-25",
        region: "global"
      },
      {
        name: "Loperamide",
        type: "Tablet",
        details: "2mg, anti-diarrheal",
        price: "24 tablets $8-12",
        region: "global"
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
        price: "100 tablets $8-12",
        region: "global"
      },
      {
        name: "Acetaminophen",
        type: "Tablet",
        details: "500mg, pain reliever",
        price: "100 tablets $6-10",
        region: "global"
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
        price: "30 tablets $12-18",
        region: "global"
      },
      {
        name: "Diphenhydramine",
        type: "Capsule",
        details: "25mg, antihistamine and sleep aid",
        price: "50 capsules $8-12",
        region: "global"
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
        price: "10mL vial $150-300",
        region: "global"
      },
      {
        name: "Adalimumab",
        type: "Injection",
        details: "40mg/0.4mL, for rheumatoid arthritis, psoriasis, and other autoimmune conditions\nRecommended Specialist: Rheumatology",
        price: "2 pens $5,000-6,000",
        region: "global"
      },
      {
        name: "Vitamin B12",
        type: "Injection",
        details: "1000mcg/mL, for B12 deficiency\nRecommended Specialist: Primary Care",
        price: "10mL vial $30-50",
        region: "global"
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
        price: "Per treatment $200-500",
        region: "global"
      },
      {
        name: "Temperature-Responsive Gel",
        type: "Injectable Gel",
        details: "Smart stimuli-responsive hydrogel that solidifies at body temperature. Used for controlled drug delivery and tissue engineering.\nRecommended Specialist: Regenerative Medicine",
        price: "Per treatment $300-700",
        region: "north-america"
      },
      {
        name: "Alginate Injectable System",
        type: "Injectable Gel",
        details: "Forms gel in situ at physiological conditions. Widely used in tissue engineering to support cell growth and tissue regeneration.\nRecommended Specialist: Orthopedics",
        price: "Per treatment $250-450",
        region: "europe"
      },
      {
        name: "Chitosan-Based Gel",
        type: "Injectable Gel",
        details: "Features reversible sol-gel transition behavior, ideal for minimally invasive procedures to fill complex defects.\nRecommended Specialist: Reconstructive Surgery",
        price: "Per treatment $350-600",
        region: "asia"
      },
      {
        name: "Cross-Linked CNS Delivery Gel",
        type: "Injectable Gel",
        details: "Designed for drug delivery to the central nervous system, offering treatment for neurological disorders.\nRecommended Specialist: Neurology",
        price: "Per treatment $500-1000",
        region: "north-america"
      },
      {
        name: "Long-Acting Drug Delivery Gel",
        type: "Injectable Gel",
        details: "Engineered to dissolve over time, releasing medications gradually. Reduces frequency of injections for chronic conditions.\nRecommended Specialist: Pain Management",
        price: "Per treatment $400-800",
        region: "global"
      }
    ]
  },
  {
    category: "Antiviral Injections",
    products: [
      {
        name: "Baloxavir Marboxil",
        type: "Injection",
        details: "Advanced antiviral medication for Influenza treatment.\nRecommended Specialist: Infectious Disease",
        price: "Per treatment $150-300",
        benefits: ["Effective against Influenza"],
        region: "global"
      },
      {
        name: "Cabenuva",
        type: "Injectable Medication",
        details: "Long-acting HIV treatment.\nRecommended Specialist: Infectious Disease",
        price: "Monthly treatment $3000-4000",
        benefits: [
          "Controls HIV Symptoms",
          "Monthly/bi-monthly dosing available",
          "Improves treatment adherence",
          "Maintains viral suppression"
        ],
        region: "global"
      },
      {
        name: "Antiretroviral Therapy (ART)",
        type: "Injection",
        details: "Combination of tenofovir, emtricitabine, dolutegravir for HIV/AIDS treatment.\nRecommended Specialist: Infectious Disease",
        price: "Monthly treatment $2000-3000",
        region: "global"
      }
    ]
  },
  {
    category: "Peptide Therapies",
    products: [
      {
        name: "BPC-157",
        type: "Injectable Peptide",
        details: "Body protection compound for tissue healing and gut health.\nRecommended Specialist: Regenerative Medicine",
        price: "Per treatment $150-300",
        region: "global"
      },
      {
        name: "TB-500",
        type: "Injectable Peptide",
        details: "Promotes healing and recovery.\nRecommended Specialist: Sports Medicine",
        price: "Per treatment $200-400",
        region: "global"
      },
      {
        name: "PT-141",
        type: "Injectable Peptide",
        details: "For sexual health and function.\nRecommended Specialist: Endocrinology",
        price: "Per treatment $100-200",
        region: "global"
      }
    ]
  },
  {
    category: "Wellness Injections",
    products: [
      {
        name: "Glutathione",
        type: "Injection",
        details: "Powerful antioxidant for skin health and detoxification.\nRecommended Specialist: Functional Medicine",
        price: "Per treatment $75-150",
        region: "global"
      },
      {
        name: "Vitamin B12",
        type: "Injection",
        details: "Energy boost and nervous system support.\nRecommended Specialist: Primary Care",
        price: "Per treatment $30-60",
        region: "global"
      },
      {
        name: "NAD+",
        type: "Injection",
        details: "Cellular energy and anti-aging.\nRecommended Specialist: Anti-Aging Medicine",
        price: "Per treatment $200-500",
        region: "global"
      }
    ]
  },
  {
    category: "International Specialty Medications",
    products: [
      {
        name: "Candesartan",
        type: "Tablet",
        details: "Angiotensin II receptor blocker widely used in European countries for hypertension.",
        price: "€20-40 per month",
        region: "europe"
      },
      {
        name: "Artemisinin Combination Therapy",
        type: "Tablet",
        details: "Primary antimalarial treatment used throughout Africa. Contains artemether and lumefantrine.",
        price: "$5-15 per treatment course",
        region: "africa"
      },
      {
        name: "Clobazam",
        type: "Tablet",
        details: "Benzodiazepine used for epilepsy treatment, particularly in European countries.",
        price: "€25-50 per month",
        region: "europe"
      },
      {
        name: "Lianhua Qingwen Capsules",
        type: "Capsule",
        details: "Traditional Chinese medicine used for treating influenza and respiratory infections.",
        price: "¥30-60 per package",
        region: "asia"
      },
      {
        name: "Daflon",
        type: "Tablet",
        details: "Flavonoid medication widely used in Europe for venous insufficiency.",
        price: "€15-30 per month",
        region: "europe"
      },
      {
        name: "Andrographis Paniculata",
        type: "Tablet",
        details: "Herbal medication used in Southeast Asia for respiratory infections and fever.",
        price: "$10-20 per package",
        region: "asia"
      },
      {
        name: "Moxifloxacin",
        type: "Tablet",
        details: "Antibiotic widely used in Australia and Oceania for respiratory tract infections.",
        price: "AUD $30-50 per course",
        region: "australia"
      },
      {
        name: "Benzathine Penicillin",
        type: "Injection",
        details: "Long-acting penicillin commonly used in South America for streptococcal infections and rheumatic fever prevention.",
        price: "$5-15 per injection",
        region: "south-america"
      },
      {
        name: "Ivermectin",
        type: "Tablet",
        details: "Antiparasitic medication widely used in Africa and South America for various parasitic infections.",
        price: "$1-5 per treatment",
        region: "africa"
      },
      {
        name: "Manuka Honey Medical Grade",
        type: "Topical",
        details: "Antimicrobial honey used in Australia and New Zealand for wound treatment.",
        price: "NZD $30-60 per container",
        region: "australia"
      }
    ]
  }
];
