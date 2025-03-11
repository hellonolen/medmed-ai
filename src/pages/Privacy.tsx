
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";

const Privacy = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="group gap-2 pl-1 pr-4">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span>{t("navigation.back_home", "Back to Home")}</span>
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">{t("privacy.title", "Privacy Policy")}</h1>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm p-8 border border-border mb-8">
          <div className="prose prose-blue max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              {t("privacy.last_updated", "Last Updated")}: September 1, 2023
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t("privacy.introduction.title", "Introduction")}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {t("privacy.introduction.text", "At MedMed.AI, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service. Please read this policy carefully. By accessing or using our service, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.")}
            </p>
            
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 mb-8">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-gray-600 text-sm">
                  {t("privacy.introduction.note", "We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice.")}
                </p>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t("privacy.information.title", "Information We Collect")}
            </h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    {t("privacy.information.personal.title", "Personal Information")}
                  </h3>
                  <p className="text-gray-600">
                    {t("privacy.information.personal.text", "We may collect personal information that you provide to us, such as your name, email address, and any other information you choose to provide.")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    {t("privacy.information.usage.title", "Usage Information")}
                  </h3>
                  <p className="text-gray-600">
                    {t("privacy.information.usage.text", "We may collect information about how you access and use our service, including your IP address, device information, browser type, and the pages you visit.")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    {t("privacy.information.health.title", "Health-Related Information")}
                  </h3>
                  <p className="text-gray-600">
                    {t("privacy.information.health.text", "When you use our health tools and features, we may collect information about your health interests, searches, and preferences to provide you with relevant content and recommendations.")}
                  </p>
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t("privacy.use.title", "How We Use Your Information")}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {t("privacy.use.text", "We use the information we collect to:")}
            </p>
            
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-8">
              <li>{t("privacy.use.item1", "Provide, maintain, and improve our services")}</li>
              <li>{t("privacy.use.item2", "Process and complete transactions")}</li>
              <li>{t("privacy.use.item3", "Send you technical notices, updates, security alerts, and support messages")}</li>
              <li>{t("privacy.use.item4", "Respond to your comments, questions, and requests")}</li>
              <li>{t("privacy.use.item5", "Personalize content and experiences")}</li>
              <li>{t("privacy.use.item6", "Monitor and analyze trends, usage, and activities in connection with our service")}</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t("privacy.sharing.title", "Sharing of Information")}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {t("privacy.sharing.text", "We may share the information we collect in various ways, including:")}
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-8">
              <h3 className="text-xl font-medium text-gray-800 mb-3">
                {t("privacy.sharing.vendors.title", "With Vendors and Service Providers")}
              </h3>
              <p className="text-gray-600 mb-4">
                {t("privacy.sharing.vendors.text", "We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.")}
              </p>
              
              <Separator className="my-4" />
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">
                {t("privacy.sharing.legal.title", "For Legal Reasons")}
              </h3>
              <p className="text-gray-600">
                {t("privacy.sharing.legal.text", "We may share information if we believe it is required by applicable law, regulation, operating license or agreement, legal process or governmental request, or where the disclosure is otherwise appropriate due to safety or similar concerns.")}
              </p>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t("privacy.contact.title", "Contact Us")}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {t("privacy.contact.text", "If you have any questions about this Privacy Policy, please contact us at:")}
            </p>
            
            <div className="bg-primary/5 p-6 rounded-lg border border-primary/10 mb-8">
              <p className="text-gray-800 font-medium">MedMed.AI</p>
              <p className="text-gray-600">privacy@medmed.ai</p>
              <p className="text-gray-600">123 Health Avenue, Medical District</p>
              <p className="text-gray-600">San Francisco, CA 94102</p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">© {currentYear} MedMed.AI. {t("app.footer.rights", "All rights reserved.")}</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
