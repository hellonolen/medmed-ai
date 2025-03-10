
import { Link } from "react-router-dom";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Home, Heart, Activity, BookOpen, Users, ArrowLeft, Settings } from "lucide-react";
import { MedicationReminder } from "@/components/MedicationReminder";
import { HealthTracker } from "@/components/HealthTracker";
import { EducationHub } from "@/components/EducationHub";
import { AIChatbot } from "@/components/AIChatbot";
import { useToast } from "@/components/ui/use-toast";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";

const HealthHub = () => {
  const [activeTab, setActiveTab] = useState("reminders");
  const { toast } = useToast();

  const showComingSoonToast = (feature: string) => {
    toast({
      title: "Coming Soon",
      description: `The ${feature} feature is currently under development.`,
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-primary">Personal Health Hub</h1>
          </div>
          <div className="flex items-center gap-2">
            <AccessibilityPanel />
            <Button variant="ghost" size="icon" onClick={() => showComingSoonToast("Settings")}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <div className="sticky top-8 bg-card/80 backdrop-blur-sm rounded-lg border shadow-sm p-4">
              <nav className="space-y-2">
                <Button 
                  variant={activeTab === "reminders" ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("reminders")}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Medication Reminders
                </Button>
                <Button 
                  variant={activeTab === "tracker" ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("tracker")}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Health Tracker
                </Button>
                <Button 
                  variant={activeTab === "education" ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("education")}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Education Hub
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => showComingSoonToast("Community")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Community
                </Button>
                <div className="pt-4 mt-4 border-t">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/">
                      <Home className="mr-2 h-4 w-4" />
                      Back to Home
                    </Link>
                  </Button>
                </div>
              </nav>
            </div>
          </aside>
          
          <main className="lg:col-span-3 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full mb-6 hidden">
                <TabsTrigger value="reminders">Medication Reminders</TabsTrigger>
                <TabsTrigger value="tracker">Health Tracker</TabsTrigger>
                <TabsTrigger value="education">Education Hub</TabsTrigger>
              </TabsList>
              
              <TabsContent value="reminders" className="mt-0">
                <div className="space-y-6">
                  <MedicationReminder />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card/50 border rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <span className="bg-primary/10 p-2 rounded-full mr-3">
                          <Heart className="h-5 w-5 text-primary" />
                        </span>
                        Medication Adherence
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Taking your medications as prescribed is crucial for managing your condition effectively.
                      </p>
                      <Button variant="outline" onClick={() => showComingSoonToast("Adherence Tools")}>
                        View Adherence Tools
                      </Button>
                    </div>
                    
                    <div className="bg-card/50 border rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <span className="bg-primary/10 p-2 rounded-full mr-3">
                          <Activity className="h-5 w-5 text-primary" />
                        </span>
                        Prescription Refills
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Set up automatic refill reminders to ensure you never run out of important medications.
                      </p>
                      <Button variant="outline" onClick={() => showComingSoonToast("Refill Management")}>
                        Manage Refills
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="tracker" className="mt-0">
                <div className="space-y-6">
                  <HealthTracker />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card/50 border rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <span className="bg-primary/10 p-2 rounded-full mr-3">
                          <Activity className="h-5 w-5 text-primary" />
                        </span>
                        Connect Devices
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Connect your wearable devices and health apps to automatically sync your health data.
                      </p>
                      <Button variant="outline" onClick={() => showComingSoonToast("Device Connection")}>
                        Connect Devices
                      </Button>
                    </div>
                    
                    <div className="bg-card/50 border rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <span className="bg-primary/10 p-2 rounded-full mr-3">
                          <Activity className="h-5 w-5 text-primary" />
                        </span>
                        Health Goals
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Set personalized health goals and track your progress towards achieving them.
                      </p>
                      <Button variant="outline" onClick={() => showComingSoonToast("Health Goals")}>
                        Set Goals
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="education" className="mt-0">
                <EducationHub />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
      
      {/* Add AI Chatbot */}
      <AIChatbot />
    </div>
  );
};

export default HealthHub;
