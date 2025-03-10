interface SymptomMapping {
  symptom: string;
  specialists: string[];
  relatedConditions: string[];
}

interface MedicalCondition {
  category: string;
  conditions: string[];
  symptoms: string[];
  medications: string[];
  specialists: string[];
}

export const medicalConditions: MedicalCondition[] = [
  {
    category: "Skin Conditions",
    conditions: ["Eczema", "Psoriasis", "Hives", "Dermatitis", "Scabies", "Fungal Infections", "Acne", "Rosacea", "Itchy Skin (Pruritus)"],
    symptoms: ["Itching", "Redness", "Scaling", "Dryness", "Rash", "Blisters", "Skin rash", "Dry skin"],
    medications: ["Hydrocortisone", "Diphenhydramine", "Clotrimazole", "Moisturizers", "Tacrolimus", "Tretinoin"],
    specialists: ["Dermatology", "Allergy"]
  },
  {
    category: "Respiratory Conditions",
    conditions: ["Asthma", "Chronic Obstructive Pulmonary Disease", "COPD", "Allergic Rhinitis", "Sinusitis", "Bronchitis"],
    symptoms: ["Shortness of breath", "Wheezing", "Coughing", "Cough", "Nasal congestion", "Sneezing", "Difficulty breathing"],
    medications: ["Albuterol", "Fluticasone", "Antihistamines", "Decongestants", "Bronchodilators", "Inhalers"],
    specialists: ["Pulmonology", "ENT & Allergy"]
  },
  {
    category: "Gastrointestinal Conditions",
    conditions: ["Gastroesophageal Reflux Disease", "GERD", "Irritable Bowel Syndrome", "IBS", "Crohn's Disease", "Ulcerative Colitis", "Constipation", "Diarrhea"],
    symptoms: ["Abdominal pain", "Bloating", "Heartburn", "Diarrhea", "Constipation", "Nausea", "Stomach pain"],
    medications: ["Omeprazole", "Dicyclomine", "Laxatives", "Loperamide", "Antacids"],
    specialists: ["Gastroenterology"]
  },
  {
    category: "Neurological Conditions",
    conditions: ["Migraines", "Epilepsy", "Multiple Sclerosis", "Parkinson's Disease", "Neuropathy"],
    symptoms: ["Headache", "Headaches", "Seizures", "Tremors", "Numbness", "Tingling", "Dizziness", "Memory loss"],
    medications: ["Gabapentin", "Sumatriptan", "Pramipexole", "Anticonvulsants", "Triptans"],
    specialists: ["Neurology"]
  },
  {
    category: "Musculoskeletal Conditions",
    conditions: ["Osteoarthritis", "Rheumatoid Arthritis", "Fibromyalgia", "Gout", "Back Pain"],
    symptoms: ["Joint pain", "Stiffness", "Swelling", "Muscle aches", "Pain in joints", "Back pain", "Neck pain"],
    medications: ["Ibuprofen", "Corticosteroids", "DMARDs", "Colchicine", "NSAIDs", "Pain relievers"],
    specialists: ["Rheumatology", "Physical Therapy", "Orthopedics"]
  },
  {
    category: "Cardiovascular Conditions",
    conditions: ["Hypertension", "Coronary Artery Disease", "Arrhythmias", "Heart Failure", "High blood pressure"],
    symptoms: ["Chest pain", "Palpitations", "Shortness of breath", "Fatigue", "Irregular heartbeat"],
    medications: ["Metoprolol", "Lisinopril", "Warfarin", "Beta-blockers", "ACE inhibitors", "Anticoagulants"],
    specialists: ["Cardiology"]
  },
  {
    category: "Endocrine Conditions",
    conditions: ["Diabetes", "Type 1 Diabetes", "Type 2 Diabetes", "Hypothyroidism", "Hyperthyroidism", "Addison's Disease"],
    symptoms: ["Fatigue", "Weight changes", "Increased thirst", "Frequent urination", "Hunger", "Dry mouth"],
    medications: ["Insulin", "Metformin", "Levothyroxine", "Methimazole", "Antithyroid drugs"],
    specialists: ["Endocrinology"]
  },
  {
    category: "Psychiatric Conditions",
    conditions: ["Depression", "Anxiety", "Bipolar Disorder", "Schizophrenia", "PTSD"],
    symptoms: ["Mood swings", "Anxiety", "Hallucinations", "Sleep disturbances", "Sadness", "Worry", "Panic"],
    medications: ["Sertraline", "Risperidone", "Lithium", "SSRIs", "Antipsychotics", "Mood stabilizers"],
    specialists: ["Psychiatry", "Behavioral Health"]
  },
  {
    category: "Infectious Diseases",
    conditions: ["Influenza", "Pneumonia", "Tuberculosis", "HIV/AIDS", "Hepatitis"],
    symptoms: ["Fever", "Cough", "Fatigue", "Weight loss", "Chills", "Body aches", "Sore throat"],
    medications: ["Oseltamivir", "Amoxicillin", "Tenofovir", "Antivirals", "Antibiotics", "Antiretrovirals"],
    specialists: ["Infectious Disease"]
  },
  {
    category: "Oncological Conditions",
    conditions: ["Breast Cancer", "Lung Cancer", "Leukemia", "Lymphoma"],
    symptoms: ["Unexplained weight loss", "Lumps", "Fatigue", "Pain", "Night sweats"],
    medications: ["Doxorubicin", "Trastuzumab", "Chemotherapy", "Targeted therapies", "Immunotherapies"],
    specialists: ["Oncology", "Hematology"]
  },
  {
    category: "Urinary and Renal Conditions",
    conditions: ["Urinary Tract Infections", "UTI", "Kidney Stones", "Chronic Kidney Disease"],
    symptoms: ["Painful urination", "Flank pain", "Blood in urine", "Frequent urination", "Urgency"],
    medications: ["Ciprofloxacin", "Diuretics", "Pain relievers", "Antibiotics"],
    specialists: ["Urology", "Nephrology"]
  },
  {
    category: "Reproductive Health",
    conditions: ["Polycystic Ovary Syndrome", "PCOS", "Endometriosis", "Erectile Dysfunction", "Infertility"],
    symptoms: ["Irregular periods", "Pelvic pain", "Hormonal imbalances", "Painful intercourse"],
    medications: ["Oral contraceptives", "Clomiphene", "Sildenafil", "Hormonal therapies"],
    specialists: ["Gynecology"]
  },
  {
    category: "Allergic and Immune Conditions",
    conditions: ["Allergies", "Lupus", "Rheumatoid Arthritis", "Celiac Disease"],
    symptoms: ["Sneezing", "Rashes", "Joint pain", "Fatigue", "Itchy eyes", "Runny nose", "Hives"],
    medications: ["Antihistamines", "Corticosteroids", "Methotrexate", "Immunosuppressants"],
    specialists: ["Allergy", "Immunology", "Rheumatology"]
  },
  {
    category: "Eye and Ear Conditions",
    conditions: ["Conjunctivitis", "Glaucoma", "Otitis Media", "Tinnitus", "Pink eye"],
    symptoms: ["Red eyes", "Vision loss", "Ear pain", "Ringing in ears", "Itchy eye", "Watery eyes", "Hearing loss"],
    medications: ["Antibiotic eye drops", "Beta-blocker eye drops", "Antihistamines"],
    specialists: ["Ophthalmology", "ENT & Allergy"]
  },
  {
    category: "Pediatric Conditions",
    conditions: ["Asthma", "ADHD", "Chickenpox", "Ear Infections"],
    symptoms: ["Hyperactivity", "Wheezing", "Fever", "Ear pain", "Difficulty focusing", "Rash"],
    medications: ["Bronchodilators", "Antihistamines", "Acetaminophen", "Stimulants"],
    specialists: ["Pediatrics", "Adolescent Pediatrics"]
  },
  {
    category: "Injectable Gels",
    conditions: ["Tissue Engineering", "Drug Delivery Systems", "Wound Healing", "Joint Pain Management", "Aesthetic Medicine"],
    symptoms: ["Joint pain", "Tissue damage", "Chronic wounds", "Drug delivery needs", "Regenerative needs", "Facial wrinkles"],
    medications: ["Shear-Thinning Hydrogel", "Temperature-Responsive Gel", "Alginate Injectable System", "Chitosan-Based Gel", "Cross-Linked CNS Delivery Gel", "Long-Acting Drug Delivery Gel"],
    specialists: ["Regenerative Medicine", "Orthopedics", "Dermatology", "Plastic Surgery"]
  },
];

// Convert the comprehensive data to our symptom mapping format
export const symptomMappings: SymptomMapping[] = medicalConditions.flatMap(category => 
  category.symptoms.map(symptom => ({
    symptom: symptom.toLowerCase(),
    specialists: category.specialists,
    relatedConditions: [category.category]
  }))
);

// Add specific medication mappings
const acneRosaceaSymptoms = ["acne", "rosacea", "skin rash", "redness", "itchy eye", "red eye", "headache", "cough"];
const antiAgingSymptoms = ["aging skin", "wrinkles", "dry skin", "joint pain"];

// Filter for unique symptom entries (as some symptoms appear in multiple categories)
const uniqueSymptoms = new Map<string, SymptomMapping>();

symptomMappings.forEach(mapping => {
  const existingMapping = uniqueSymptoms.get(mapping.symptom);
  if (existingMapping) {
    // Merge specialists and conditions if this symptom already exists
    existingMapping.specialists = [...new Set([...existingMapping.specialists, ...mapping.specialists])];
    existingMapping.relatedConditions = [...new Set([...existingMapping.relatedConditions, ...mapping.relatedConditions])];
  } else {
    uniqueSymptoms.set(mapping.symptom, mapping);
  }
});

// Add specific medication categories for our existing medication data
acneRosaceaSymptoms.forEach(symptom => {
  const mapping = uniqueSymptoms.get(symptom);
  if (mapping) {
    mapping.relatedConditions.push("ACNE/ROSACEA");
  }
});

antiAgingSymptoms.forEach(symptom => {
  const mapping = uniqueSymptoms.get(symptom);
  if (mapping) {
    mapping.relatedConditions.push("Anti-Aging");
  }
});

// Add specific injectable gel mappings
const injectableGelSymptoms = ["joint pain", "tissue damage", "chronic wounds", "drug delivery needs", "regenerative needs", "facial wrinkles"];

injectableGelSymptoms.forEach(symptom => {
  const mapping = uniqueSymptoms.get(symptom);
  if (mapping) {
    mapping.relatedConditions.push("Injectable Gels");
  }
});

export const findMatchingSymptoms = (searchQuery: string) => {
  // If search query is empty, return empty array
  if (!searchQuery.trim()) return [];
  
  // Split the search query into words
  const searchWords = searchQuery.toLowerCase().split(/\s+/);
  
  // Try to match symptoms
  const directSymptomMatches = Array.from(uniqueSymptoms.values()).filter(mapping => 
    searchWords.some(word => 
      mapping.symptom.includes(word) ||
      word.includes(mapping.symptom)
    )
  );
  
  if (directSymptomMatches.length > 0) {
    return directSymptomMatches;
  }
  
  // If no direct symptom matches, try to match conditions
  const conditionMatches: SymptomMapping[] = [];
  
  medicalConditions.forEach(category => {
    const matchesCondition = category.conditions.some(condition => 
      searchWords.some(word => condition.toLowerCase().includes(word))
    );
    
    if (matchesCondition) {
      // Add all symptoms for this condition
      category.symptoms.forEach(symptom => {
        const mapping = uniqueSymptoms.get(symptom.toLowerCase());
        if (mapping) {
          conditionMatches.push(mapping);
        }
      });
    }
  });
  
  // Also check for medication matches
  const medicationMatches: SymptomMapping[] = [];
  
  medicalConditions.forEach(category => {
    const matchesMedication = category.medications.some(medication => 
      searchWords.some(word => medication.toLowerCase().includes(word))
    );
    
    if (matchesMedication) {
      // Add all symptoms for this condition
      category.symptoms.forEach(symptom => {
        const mapping = uniqueSymptoms.get(symptom.toLowerCase());
        if (mapping) {
          medicationMatches.push(mapping);
        }
      });
    }
  });
  
  return [...directSymptomMatches, ...conditionMatches, ...medicationMatches];
};
