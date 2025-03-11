
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const Terms = () => {
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

        <div className="flex items-center gap-3 mb-6">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">{t("terms.title", "Terms of Service")}</h1>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-gray-600 mb-8">
            {t("terms.last_updated", "Last Updated")}: {t("terms.date", "May 15, 2023")}
          </p>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t("terms.agreement.title", "Agreement to Terms")}</h2>
            <p className="mb-4">
              {t("terms.agreement.p1", "By accessing or using MedMed.AI's services, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.")}
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t("terms.services.title", "Description of Services")}</h2>
            <p className="mb-4">
              {t("terms.services.p1", "MedMed.AI provides an online platform for users to search for medication information, find healthcare specialists, and check medical symptoms. Our platform is designed for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment.")}
            </p>
            <p>
              {t("terms.services.p2", "Information provided through our services is sourced from reputable medical databases and resources. However, we cannot guarantee the accuracy, completeness, or timeliness of the information.")}
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t("terms.disclaimer.title", "Medical Disclaimer")}</h2>
            <p className="mb-4">
              {t("terms.disclaimer.p1", "MedMed.AI's services are not intended to replace professional medical advice. Always consult with a qualified healthcare provider before making any decisions about your health or medication.")}
            </p>
            <p className="mb-4">
              {t("terms.disclaimer.p2", "We do not endorse or recommend any specific healthcare providers, treatments, procedures, opinions, or other information that may be mentioned on our platform.")}
            </p>
            <p>
              {t("terms.disclaimer.p3", "In case of a medical emergency, please contact your local emergency services immediately.")}
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t("terms.accounts.title", "User Accounts")}</h2>
            <p className="mb-4">
              {t("terms.accounts.p1", "When you create an account with us, you guarantee that the information you provide is accurate, complete, and current. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account.")}
            </p>
            <p className="mb-4">
              {t("terms.accounts.p2", "You are responsible for maintaining the confidentiality of your account and password and for restricting access to your account. You agree to accept responsibility for all activities that occur under your account.")}
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t("terms.limitations.title", "Limitations of Liability")}</h2>
            <p className="mb-4">
              {t("terms.limitations.p1", "In no event shall MedMed.AI, its officers, directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:")}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t("terms.limitations.li1", "Your access to or use of or inability to access or use the service.")}</li>
              <li>{t("terms.limitations.li2", "Any conduct or content of any third party on the service.")}</li>
              <li>{t("terms.limitations.li3", "Any content obtained from the service.")}</li>
              <li>{t("terms.limitations.li4", "Unauthorized access, use, or alteration of your transmissions or content.")}</li>
            </ul>
          </section>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">© {currentYear} MedMed.AI. {t("app.footer.rights", "All rights reserved.")}</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
