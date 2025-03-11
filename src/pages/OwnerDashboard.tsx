
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { Download } from "lucide-react";
import { AIKeySetup } from "@/components/AIKeySetup";

const mockSearchHistory = [
  { user: "user123", query: "Aspirin side effects", date: "2023-09-15" },
  { user: "healthpro", query: "Lisinopril dosage", date: "2023-09-14" },
  { user: "patient2", query: "Allergy medication", date: "2023-09-13" },
  { user: "doctor1", query: "Insulin brands", date: "2023-09-12" },
  { user: "user456", query: "Headache treatment", date: "2023-09-11" },
];

const mockUserData = [
  { 
    name: "John Doe", 
    email: "john.doe@example.com", 
    phone: "+1 555-123-4567", 
    signupDate: "2023-05-20" 
  },
  { 
    name: "Jane Smith", 
    email: "jane.smith@example.com", 
    phone: "+1 555-987-6543", 
    signupDate: "2023-06-15" 
  },
  { 
    name: "Robert Johnson", 
    email: "robert.j@example.com", 
    phone: "+1 555-456-7890", 
    signupDate: "2023-07-02" 
  },
  { 
    name: "Emily Davis", 
    email: "emily.davis@example.com", 
    phone: "+1 555-789-0123", 
    signupDate: "2023-08-10" 
  },
];

const mockSponsorData = [
  { 
    company: "PharmaCorp", 
    contactPerson: "Michael Williams", 
    email: "m.williams@pharmacorp.com", 
    package: "Premium" 
  },
  { 
    company: "MediTech Solutions", 
    contactPerson: "Sarah Johnson", 
    email: "sarah.j@meditech.com", 
    package: "Standard" 
  },
  { 
    company: "HealthPlus", 
    contactPerson: "David Brown", 
    email: "david.brown@healthplus.com", 
    package: "Basic" 
  },
];

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isOwner } = useAdmin();
  const { t } = useLanguage();
  const [searchHistory, setSearchHistory] = useState(mockSearchHistory);
  const [userData, setUserData] = useState(mockUserData);
  const [sponsorData, setSponsorData] = useState(mockSponsorData);

  useEffect(() => {
    if (!isAdmin && !isOwner) {
      navigate("/");
    }
  }, [isAdmin, isOwner, navigate]);

  const handleExportCSV = (dataType: string) => {
    let data: any[] = [];
    let headers: string[] = [];
    let filename = "";

    switch (dataType) {
      case "searchHistory":
        data = searchHistory;
        headers = ["User", "Search Query", "Date"];
        filename = "search-history.csv";
        break;
      case "userData":
        data = userData;
        headers = ["Name", "Email", "Phone", "Signup Date"];
        filename = "user-data.csv";
        break;
      case "sponsorData":
        data = sponsorData;
        headers = ["Company", "Contact Person", "Email", "Package"];
        filename = "sponsor-data.csv";
        break;
      default:
        console.error("Unknown data type for export");
        return;
    }

    const csvContent = [
      headers.join(","),
      ...data.map(item => {
        if (dataType === "searchHistory") {
          return `${item.user || "Anonymous"},${item.query},${item.date}`;
        } else if (dataType === "userData") {
          return `${item.name},${item.email},${item.phone},${item.signupDate}`;
        } else if (dataType === "sponsorData") {
          return `${item.company},${item.contactPerson},${item.email},${item.package}`;
        }
        return "";
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAdmin && !isOwner) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-10">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            {isOwner 
              ? t("owner.dashboard.owner_title", "Owner Dashboard") 
              : t("owner.dashboard.title", "Admin Dashboard")}
          </h1>
          <div className="flex items-center gap-3">
            <AIKeySetup />
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              {t("owner.dashboard.export_all", "Export All Data")}
            </Button>
          </div>
        </div>
        <p className="text-gray-600 mt-2">
          {isOwner
            ? t("owner.dashboard.owner_welcome", "Welcome to your owner dashboard. Here you can manage and monitor all aspects of the MedMed.AI platform, including admin assignments.")
            : t("owner.dashboard.welcome", "Welcome to your dashboard. Here you can manage and monitor all aspects of the MedMed.AI platform.")}
        </p>
      </header>

      <main>
        <Card className="mb-8">
          <CardContent className="p-6">
            <DashboardTabs 
              handleExportCSV={handleExportCSV}
              searchHistory={searchHistory}
              userData={userData}
              sponsorData={sponsorData}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OwnerDashboard;
