
export interface SpecialistInfo {
  name: string;
  description: string;
  locations?: string[]; // Cities or regions where the specialist practices
  topTreatmentLocations?: {
    city: string;
    country: string;
    reason?: string;
  }[];
}

export const specialistsInfo: Record<string, SpecialistInfo> = {
  "Primary Care": {
    name: "Primary Care",
    description: "General healthcare providers who diagnose and treat a wide range of health conditions and provide preventive care.",
    locations: ["New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ", "Philadelphia, PA", "San Antonio, TX", "San Diego, CA"],
    topTreatmentLocations: [
      { city: "Boston", country: "USA", reason: "Home to several top-ranked hospitals with comprehensive care" },
      { city: "London", country: "UK", reason: "World-class NHS facilities with universal healthcare access" }
    ]
  },
  "Adolescent Pediatrics": {
    name: "Adolescent Pediatrics",
    description: "Specialists focusing on the health and development of adolescents, addressing physical, emotional, and social needs specific to this age group.",
    locations: ["Boston, MA", "San Francisco, CA", "Seattle, WA", "Denver, CO", "Atlanta, GA", "Miami, FL"],
    topTreatmentLocations: [
      { city: "Boston", country: "USA", reason: "Leading children's hospitals with specialized adolescent programs" },
      { city: "Toronto", country: "Canada", reason: "Excellent adolescent mental health services" }
    ]
  },
  "Anorectal Care/Colorectal Surgery": {
    name: "Anorectal Care/Colorectal Surgery",
    description: "Specialists who diagnose and treat disorders of the colon, rectum, and anus through surgical and non-surgical methods.",
    locations: ["Cleveland, OH", "Baltimore, MD", "Rochester, MN", "Nashville, TN", "New York, NY", "Houston, TX"],
    topTreatmentLocations: [
      { city: "Rochester", country: "USA", reason: "Mayo Clinic's world-renowned colorectal surgery department" },
      { city: "London", country: "UK", reason: "Leading research in minimally invasive colorectal procedures" }
    ]
  },
  "Audiology": {
    name: "Audiology",
    description: "Healthcare professionals who diagnose and treat hearing and balance disorders.",
    locations: ["Portland, OR", "Austin, TX", "Minneapolis, MN", "Raleigh, NC", "San Diego, CA", "Chicago, IL"],
    topTreatmentLocations: [
      { city: "Rochester", country: "USA", reason: "Mayo Clinic's comprehensive hearing restoration programs" },
      { city: "Melbourne", country: "Australia", reason: "Pioneering cochlear implant technology and research" }
    ]
  },
  "Behavioral Health": {
    name: "Behavioral Health",
    description: "Specialists who evaluate and treat mental health conditions, emotional disorders, and substance use disorders.",
    locations: ["Boston, MA", "Seattle, WA", "San Francisco, CA", "New York, NY", "Los Angeles, CA", "Chicago, IL", "Washington, DC"],
    topTreatmentLocations: [
      { city: "Zurich", country: "Switzerland", reason: "Progressive approaches to mental health treatment" },
      { city: "Boston", country: "USA", reason: "World-class psychiatric hospitals and research institutions" },
      { city: "Melbourne", country: "Australia", reason: "Innovative mental health support systems" }
    ]
  },
  "Cardiology": {
    name: "Cardiology",
    description: "Medical specialists focusing on disorders of the heart and blood vessels, including diagnosis and treatment of heart disease.",
    locations: ["Cleveland, OH", "Boston, MA", "Houston, TX", "Rochester, MN", "New York, NY", "Los Angeles, CA", "Chicago, IL", "Philadelphia, PA"],
    topTreatmentLocations: [
      { city: "Cleveland", country: "USA", reason: "Cleveland Clinic's top-ranked heart program" },
      { city: "London", country: "UK", reason: "Advanced cardiac surgery techniques" },
      { city: "Berlin", country: "Germany", reason: "Leading heart transplant and artificial heart technology" }
    ]
  },
  "Dermatology": {
    name: "Dermatology",
    description: "Medical specialists who diagnose and treat conditions related to the skin, hair, and nails.",
    locations: ["Miami, FL", "Los Angeles, CA", "New York, NY", "San Francisco, CA", "Chicago, IL", "Houston, TX", "Atlanta, GA", "Dallas, TX"],
    topTreatmentLocations: [
      { city: "Zurich", country: "Switzerland", reason: "Advanced treatments for skin disorders" },
      { city: "New York", country: "USA", reason: "Cutting-edge cosmetic dermatology" },
      { city: "Tokyo", country: "Japan", reason: "Innovative skincare technologies" }
    ]
  },
  "ENT & Allergy": {
    name: "ENT & Allergy",
    description: "Specialists who treat diseases of the ear, nose, throat, and related allergies.",
    locations: ["Denver, CO", "Dallas, TX", "Atlanta, GA", "Boston, MA", "Philadelphia, PA", "San Diego, CA", "Chicago, IL"],
    topTreatmentLocations: [
      { city: "Singapore", country: "Singapore", reason: "Advanced ENT procedures and allergy research" },
      { city: "Boston", country: "USA", reason: "Specialized centers for complex ENT conditions" }
    ]
  },
  "Endocrinology": {
    name: "Endocrinology",
    description: "Medical specialists who diagnose and treat hormone-related disorders and diseases of the endocrine glands.",
    locations: ["Boston, MA", "San Francisco, CA", "Chicago, IL", "Houston, TX", "New York, NY", "Rochester, MN", "Seattle, WA"],
    topTreatmentLocations: [
      { city: "Rochester", country: "USA", reason: "Mayo Clinic's comprehensive endocrine treatment programs" },
      { city: "Stockholm", country: "Sweden", reason: "Innovative diabetes management and research" }
    ]
  },
  "Gastroenterology": {
    name: "Gastroenterology",
    description: "Specialists who diagnose and treat disorders of the digestive system, including the esophagus, stomach, intestines, liver, and pancreas.",
    locations: ["Philadelphia, PA", "Boston, MA", "New York, NY", "Chicago, IL", "Houston, TX", "Los Angeles, CA", "Rochester, MN"],
    topTreatmentLocations: [
      { city: "Baltimore", country: "USA", reason: "Johns Hopkins' pioneering liver and GI disorder treatments" },
      { city: "Tokyo", country: "Japan", reason: "Advanced endoscopic techniques and early cancer detection" }
    ]
  },
  "Gynecology": {
    name: "Gynecology",
    description: "Medical specialists focused on women's reproductive health, including the diagnosis and treatment of disorders of the female reproductive system.",
    locations: ["Atlanta, GA", "New York, NY", "Chicago, IL", "Los Angeles, CA", "Boston, MA", "San Francisco, CA", "Washington, DC"],
    topTreatmentLocations: [
      { city: "Stockholm", country: "Sweden", reason: "Excellent reproductive health services and research" },
      { city: "New York", country: "USA", reason: "Advanced treatments for complex gynecological conditions" }
    ]
  },
  "Hematology": {
    name: "Hematology",
    description: "Specialists who diagnose and treat diseases of the blood and blood-forming tissues.",
    locations: ["Boston, MA", "Houston, TX", "New York, NY", "Chicago, IL", "Rochester, MN", "Seattle, WA"],
    topTreatmentLocations: [
      { city: "Houston", country: "USA", reason: "MD Anderson's world-class leukemia and lymphoma treatment" },
      { city: "Seattle", country: "USA", reason: "Pioneering bone marrow transplant techniques" },
      { city: "Basel", country: "Switzerland", reason: "Innovative blood disorder treatments" }
    ]
  },
  "Infectious Disease": {
    name: "Infectious Disease",
    description: "Medical specialists who diagnose and treat infections caused by bacteria, viruses, fungi, or parasites.",
    locations: ["Atlanta, GA", "Boston, MA", "San Francisco, CA", "Seattle, WA", "New York, NY", "Baltimore, MD"],
    topTreatmentLocations: [
      { city: "Atlanta", country: "USA", reason: "CDC headquarters and advanced infection protocols" },
      { city: "Geneva", country: "Switzerland", reason: "WHO-affiliated research and treatment centers" },
      { city: "London", country: "UK", reason: "Leading research in antimicrobial resistance" }
    ]
  },
  "Nephrology": {
    name: "Nephrology",
    description: "Specialists who diagnose and treat kidney diseases and disorders.",
    locations: ["Nashville, TN", "Chicago, IL", "New York, NY", "Rochester, MN", "Philadelphia, PA", "Houston, TX"],
    topTreatmentLocations: [
      { city: "Baltimore", country: "USA", reason: "Johns Hopkins' advanced kidney transplant program" },
      { city: "Vienna", country: "Austria", reason: "Pioneering dialysis technology and research" }
    ]
  },
  "Neurology": {
    name: "Neurology",
    description: "Medical specialists focusing on disorders of the nervous system, including the brain, spinal cord, and nerves.",
    locations: ["Boston, MA", "Baltimore, MD", "Rochester, MN", "San Francisco, CA", "New York, NY", "Philadelphia, PA", "Chicago, IL"],
    topTreatmentLocations: [
      { city: "Boston", country: "USA", reason: "World-leading neuroscience research and treatment" },
      { city: "Zurich", country: "Switzerland", reason: "Innovative neurological rehabilitation programs" },
      { city: "London", country: "UK", reason: "Advanced treatments for complex neurological disorders" }
    ]
  },
  "Ophthalmology": {
    name: "Ophthalmology",
    description: "Medical specialists who diagnose and treat eye disorders and diseases.",
    locations: ["Miami, FL", "Boston, MA", "Philadelphia, PA", "Baltimore, MD", "Los Angeles, CA", "New York, NY", "San Francisco, CA"],
    topTreatmentLocations: [
      { city: "Singapore", country: "Singapore", reason: "Advanced surgical techniques for eye conditions" },
      { city: "Philadelphia", country: "USA", reason: "Pioneering retinal treatment research" }
    ]
  },
  "Physical Therapy": {
    name: "Physical Therapy",
    description: "Healthcare professionals who help patients improve movement and manage pain after injuries or illnesses.",
    locations: ["Chicago, IL", "New York, NY", "Los Angeles, CA", "Boston, MA", "Seattle, WA", "Atlanta, GA", "Denver, CO", "Phoenix, AZ"],
    topTreatmentLocations: [
      { city: "Zurich", country: "Switzerland", reason: "Comprehensive rehabilitation centers" },
      { city: "Melbourne", country: "Australia", reason: "Sports medicine and recovery innovation" }
    ]
  },
  "Podiatry": {
    name: "Podiatry",
    description: "Specialists who diagnose and treat conditions affecting the foot, ankle, and lower leg.",
    locations: ["New York, NY", "Chicago, IL", "Los Angeles, CA", "Houston, TX", "Phoenix, AZ", "Philadelphia, PA"],
    topTreatmentLocations: [
      { city: "Vienna", country: "Austria", reason: "Advanced foot surgery techniques" },
      { city: "Houston", country: "USA", reason: "Specialized diabetic foot care" }
    ]
  },
  "Pulmonology": {
    name: "Pulmonology",
    description: "Medical specialists focusing on the respiratory system, including the lungs and airways.",
    locations: ["Denver, CO", "Boston, MA", "Rochester, MN", "Cleveland, OH", "New York, NY", "Chicago, IL", "San Francisco, CA"],
    topTreatmentLocations: [
      { city: "Denver", country: "USA", reason: "Specialized high-altitude and respiratory research" },
      { city: "London", country: "UK", reason: "Advanced treatments for complex respiratory conditions" },
      { city: "Toronto", country: "Canada", reason: "Leading lung transplant programs" }
    ]
  },
  "Rheumatology": {
    name: "Rheumatology",
    description: "Specialists who diagnose and treat arthritis, autoimmune diseases, and other disorders of the joints, muscles, and bones.",
    locations: ["Boston, MA", "Philadelphia, PA", "Chicago, IL", "New York, NY", "Rochester, MN", "Nashville, TN"],
    topTreatmentLocations: [
      { city: "Rochester", country: "USA", reason: "Mayo Clinic's comprehensive rheumatology program" },
      { city: "Leiden", country: "Netherlands", reason: "Pioneering research in autoimmune disorders" }
    ]
  },
  "Weight Management": {
    name: "Weight Management",
    description: "Healthcare professionals who help patients achieve and maintain a healthy weight through diet, exercise, and lifestyle changes.",
    locations: ["Los Angeles, CA", "New York, NY", "Chicago, IL", "Atlanta, GA", "Houston, TX", "Denver, CO", "Miami, FL"],
    topTreatmentLocations: [
      { city: "Durham", country: "USA", reason: "Duke's comprehensive obesity treatment program" },
      { city: "Stockholm", country: "Sweden", reason: "Holistic approach to weight management" }
    ]
  },
  "Oncology": {
    name: "Oncology",
    description: "Medical specialists who diagnose and treat cancer and manage the related symptoms.",
    locations: ["Houston, TX", "Boston, MA", "New York, NY", "Baltimore, MD", "Rochester, MN", "Seattle, WA", "San Francisco, CA"],
    topTreatmentLocations: [
      { city: "Houston", country: "USA", reason: "MD Anderson Cancer Center's world-leading treatments" },
      { city: "Boston", country: "USA", reason: "Dana-Farber's innovative cancer research" },
      { city: "Toronto", country: "Canada", reason: "Princess Margaret Cancer Centre's comprehensive care" },
      { city: "Heidelberg", country: "Germany", reason: "Pioneering cancer radiation therapy" }
    ]
  },
  "Psychiatry": {
    name: "Psychiatry",
    description: "Medical doctors who diagnose and treat mental, emotional, and behavioral disorders.",
    locations: ["New York, NY", "Boston, MA", "Los Angeles, CA", "San Francisco, CA", "Chicago, IL", "Seattle, WA", "Washington, DC"],
    topTreatmentLocations: [
      { city: "Zurich", country: "Switzerland", reason: "Innovative psychiatric treatment approaches" },
      { city: "Boston", country: "USA", reason: "McLean Hospital's specialized mental health programs" },
      { city: "Melbourne", country: "Australia", reason: "Leading research in depression and anxiety treatment" }
    ]
  },
  "Orthopedics": {
    name: "Orthopedics",
    description: "Specialists who diagnose and treat disorders and injuries of the bones, joints, ligaments, tendons, and muscles.",
    locations: ["New York, NY", "Chicago, IL", "Boston, MA", "Los Angeles, CA", "Nashville, TN", "Denver, CO", "Cleveland, OH"],
    topTreatmentLocations: [
      { city: "Rochester", country: "USA", reason: "Mayo Clinic's comprehensive orthopedic program" },
      { city: "Vail", country: "USA", reason: "World-renowned sports medicine and joint repair" },
      { city: "Bern", country: "Switzerland", reason: "Pioneering orthopedic surgical techniques" }
    ]
  },
  "Urology": {
    name: "Urology",
    description: "Medical specialists who diagnose and treat disorders of the urinary tract and the male reproductive system.",
    locations: ["New York, NY", "Chicago, IL", "Houston, TX", "Philadelphia, PA", "Baltimore, MD", "Los Angeles, CA"],
    topTreatmentLocations: [
      { city: "Nashville", country: "USA", reason: "Advanced prostate cancer treatment" },
      { city: "Paris", country: "France", reason: "Innovative minimally invasive urological procedures" }
    ]
  },
  "Immunology": {
    name: "Immunology",
    description: "Specialists who diagnose and treat immune system disorders including allergies and immunodeficiencies.",
    locations: ["Boston, MA", "New York, NY", "Baltimore, MD", "San Francisco, CA", "Rochester, MN", "Chicago, IL"],
    topTreatmentLocations: [
      { city: "Boston", country: "USA", reason: "Pioneering immunotherapy research" },
      { city: "Basel", country: "Switzerland", reason: "Specialized autoimmune disorder treatments" },
      { city: "Tokyo", country: "Japan", reason: "Advanced allergy diagnosis and treatment" }
    ]
  },
  "Pediatrics": {
    name: "Pediatrics",
    description: "Medical specialists who provide healthcare to infants, children, and adolescents.",
    locations: ["Boston, MA", "Philadelphia, PA", "New York, NY", "Chicago, IL", "Los Angeles, CA", "Houston, TX", "Seattle, WA", "Atlanta, GA"],
    topTreatmentLocations: [
      { city: "Boston", country: "USA", reason: "Boston Children's Hospital's comprehensive pediatric care" },
      { city: "Philadelphia", country: "USA", reason: "CHOP's specialized pediatric treatments" },
      { city: "Toronto", country: "Canada", reason: "SickKids' innovative children's healthcare" }
    ]
  }
};
