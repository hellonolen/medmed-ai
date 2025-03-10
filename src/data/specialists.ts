
export interface SpecialistInfo {
  name: string;
  description: string;
  locations?: string[]; // Cities or regions where the specialist practices
}

export const specialistsInfo: Record<string, SpecialistInfo> = {
  "Primary Care": {
    name: "Primary Care",
    description: "General healthcare providers who diagnose and treat a wide range of health conditions and provide preventive care.",
    locations: ["New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ", "Philadelphia, PA", "San Antonio, TX", "San Diego, CA"]
  },
  "Adolescent Pediatrics": {
    name: "Adolescent Pediatrics",
    description: "Specialists focusing on the health and development of adolescents, addressing physical, emotional, and social needs specific to this age group.",
    locations: ["Boston, MA", "San Francisco, CA", "Seattle, WA", "Denver, CO", "Atlanta, GA", "Miami, FL"]
  },
  "Anorectal Care/Colorectal Surgery": {
    name: "Anorectal Care/Colorectal Surgery",
    description: "Specialists who diagnose and treat disorders of the colon, rectum, and anus through surgical and non-surgical methods.",
    locations: ["Cleveland, OH", "Baltimore, MD", "Rochester, MN", "Nashville, TN", "New York, NY", "Houston, TX"]
  },
  "Audiology": {
    name: "Audiology",
    description: "Healthcare professionals who diagnose and treat hearing and balance disorders.",
    locations: ["Portland, OR", "Austin, TX", "Minneapolis, MN", "Raleigh, NC", "San Diego, CA", "Chicago, IL"]
  },
  "Behavioral Health": {
    name: "Behavioral Health",
    description: "Specialists who evaluate and treat mental health conditions, emotional disorders, and substance use disorders.",
    locations: ["Boston, MA", "Seattle, WA", "San Francisco, CA", "New York, NY", "Los Angeles, CA", "Chicago, IL", "Washington, DC"]
  },
  "Cardiology": {
    name: "Cardiology",
    description: "Medical specialists focusing on disorders of the heart and blood vessels, including diagnosis and treatment of heart disease.",
    locations: ["Cleveland, OH", "Boston, MA", "Houston, TX", "Rochester, MN", "New York, NY", "Los Angeles, CA", "Chicago, IL", "Philadelphia, PA"]
  },
  "Dermatology": {
    name: "Dermatology",
    description: "Medical specialists who diagnose and treat conditions related to the skin, hair, and nails.",
    locations: ["Miami, FL", "Los Angeles, CA", "New York, NY", "San Francisco, CA", "Chicago, IL", "Houston, TX", "Atlanta, GA", "Dallas, TX"]
  },
  "ENT & Allergy": {
    name: "ENT & Allergy",
    description: "Specialists who treat diseases of the ear, nose, throat, and related allergies.",
    locations: ["Denver, CO", "Dallas, TX", "Atlanta, GA", "Boston, MA", "Philadelphia, PA", "San Diego, CA", "Chicago, IL"]
  },
  "Endocrinology": {
    name: "Endocrinology",
    description: "Medical specialists who diagnose and treat hormone-related disorders and diseases of the endocrine glands.",
    locations: ["Boston, MA", "San Francisco, CA", "Chicago, IL", "Houston, TX", "New York, NY", "Rochester, MN", "Seattle, WA"]
  },
  "Gastroenterology": {
    name: "Gastroenterology",
    description: "Specialists who diagnose and treat disorders of the digestive system, including the esophagus, stomach, intestines, liver, and pancreas.",
    locations: ["Philadelphia, PA", "Boston, MA", "New York, NY", "Chicago, IL", "Houston, TX", "Los Angeles, CA", "Rochester, MN"]
  },
  "Gynecology": {
    name: "Gynecology",
    description: "Medical specialists focused on women's reproductive health, including the diagnosis and treatment of disorders of the female reproductive system.",
    locations: ["Atlanta, GA", "New York, NY", "Chicago, IL", "Los Angeles, CA", "Boston, MA", "San Francisco, CA", "Washington, DC"]
  },
  "Hematology": {
    name: "Hematology",
    description: "Specialists who diagnose and treat diseases of the blood and blood-forming tissues.",
    locations: ["Boston, MA", "Houston, TX", "New York, NY", "Chicago, IL", "Rochester, MN", "Seattle, WA"]
  },
  "Infectious Disease": {
    name: "Infectious Disease",
    description: "Medical specialists who diagnose and treat infections caused by bacteria, viruses, fungi, or parasites.",
    locations: ["Atlanta, GA", "Boston, MA", "San Francisco, CA", "Seattle, WA", "New York, NY", "Baltimore, MD"]
  },
  "Nephrology": {
    name: "Nephrology",
    description: "Specialists who diagnose and treat kidney diseases and disorders.",
    locations: ["Nashville, TN", "Chicago, IL", "New York, NY", "Rochester, MN", "Philadelphia, PA", "Houston, TX"]
  },
  "Neurology": {
    name: "Neurology",
    description: "Medical specialists focusing on disorders of the nervous system, including the brain, spinal cord, and nerves.",
    locations: ["Boston, MA", "Baltimore, MD", "Rochester, MN", "San Francisco, CA", "New York, NY", "Philadelphia, PA", "Chicago, IL"]
  },
  "Ophthalmology": {
    name: "Ophthalmology",
    description: "Medical specialists who diagnose and treat eye disorders and diseases.",
    locations: ["Miami, FL", "Boston, MA", "Philadelphia, PA", "Baltimore, MD", "Los Angeles, CA", "New York, NY", "San Francisco, CA"]
  },
  "Physical Therapy": {
    name: "Physical Therapy",
    description: "Healthcare professionals who help patients improve movement and manage pain after injuries or illnesses.",
    locations: ["Chicago, IL", "New York, NY", "Los Angeles, CA", "Boston, MA", "Seattle, WA", "Atlanta, GA", "Denver, CO", "Phoenix, AZ"]
  },
  "Podiatry": {
    name: "Podiatry",
    description: "Specialists who diagnose and treat conditions affecting the foot, ankle, and lower leg.",
    locations: ["New York, NY", "Chicago, IL", "Los Angeles, CA", "Houston, TX", "Phoenix, AZ", "Philadelphia, PA"]
  },
  "Pulmonology": {
    name: "Pulmonology",
    description: "Medical specialists focusing on the respiratory system, including the lungs and airways.",
    locations: ["Denver, CO", "Boston, MA", "Rochester, MN", "Cleveland, OH", "New York, NY", "Chicago, IL", "San Francisco, CA"]
  },
  "Rheumatology": {
    name: "Rheumatology",
    description: "Specialists who diagnose and treat arthritis, autoimmune diseases, and other disorders of the joints, muscles, and bones.",
    locations: ["Boston, MA", "Philadelphia, PA", "Chicago, IL", "New York, NY", "Rochester, MN", "Nashville, TN"]
  },
  "Weight Management": {
    name: "Weight Management",
    description: "Healthcare professionals who help patients achieve and maintain a healthy weight through diet, exercise, and lifestyle changes.",
    locations: ["Los Angeles, CA", "New York, NY", "Chicago, IL", "Atlanta, GA", "Houston, TX", "Denver, CO", "Miami, FL"]
  },
  "Oncology": {
    name: "Oncology",
    description: "Medical specialists who diagnose and treat cancer and manage the related symptoms.",
    locations: ["Houston, TX", "Boston, MA", "New York, NY", "Baltimore, MD", "Rochester, MN", "Seattle, WA", "San Francisco, CA"]
  },
  "Psychiatry": {
    name: "Psychiatry",
    description: "Medical doctors who diagnose and treat mental, emotional, and behavioral disorders.",
    locations: ["New York, NY", "Boston, MA", "Los Angeles, CA", "San Francisco, CA", "Chicago, IL", "Seattle, WA", "Washington, DC"]
  },
  "Orthopedics": {
    name: "Orthopedics",
    description: "Specialists who diagnose and treat disorders and injuries of the bones, joints, ligaments, tendons, and muscles.",
    locations: ["New York, NY", "Chicago, IL", "Boston, MA", "Los Angeles, CA", "Nashville, TN", "Denver, CO", "Cleveland, OH"]
  },
  "Urology": {
    name: "Urology",
    description: "Medical specialists who diagnose and treat disorders of the urinary tract and the male reproductive system.",
    locations: ["New York, NY", "Chicago, IL", "Houston, TX", "Philadelphia, PA", "Baltimore, MD", "Los Angeles, CA"]
  },
  "Immunology": {
    name: "Immunology",
    description: "Specialists who diagnose and treat immune system disorders including allergies and immunodeficiencies.",
    locations: ["Boston, MA", "New York, NY", "Baltimore, MD", "San Francisco, CA", "Rochester, MN", "Chicago, IL"]
  },
  "Pediatrics": {
    name: "Pediatrics",
    description: "Medical specialists who provide healthcare to infants, children, and adolescents.",
    locations: ["Boston, MA", "Philadelphia, PA", "New York, NY", "Chicago, IL", "Los Angeles, CA", "Houston, TX", "Seattle, WA", "Atlanta, GA"]
  }
};
