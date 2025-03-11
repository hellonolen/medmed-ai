
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

        <div className="flex items-center gap-3 mb-8">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">{t("terms.title", "Terms of Service")}</h1>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm p-8 border border-border mb-8">
          <div className="prose prose-blue max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              {t("terms.last_updated", "Last Updated")}: September 1, 2023
            </p>
            
            <div className="bg-primary/5 p-6 rounded-lg border border-primary/10 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-gray-700">
                  {t("terms.agreement_notice", "By accessing or using MedMed.AI, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.")}
                </p>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t("terms.use_license.title", "Use License")}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {t("terms.use_license.text", "Permission is granted to temporarily access the materials on MedMed.AI's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:")}
            </p>
            
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-8">
              <li>{t("terms.use_license.item1", "Modify or copy the materials")}</li>
              <li>{t("terms.use_license.item2", "Use the materials for any commercial purpose, or for any public display")}</li>
              <li>{t("terms.use_license.item3", "Attempt to decompile or reverse engineer any software contained on MedMed.AI's website")}</li>
              <li>{t("terms.use_license.item4", "Remove any copyright or other proprietary notations from the materials")}</li>
              <li>{t("terms.use_license.item5", "Transfer the materials to another person or 'mirror' the materials on any other server")}</li>
            </ul>
            
            <p className="text-gray-600 mb-8">
              {t("terms.use_license.termination", "This license shall automatically terminate if you violate any of these restrictions and may be terminated by MedMed.AI at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.")}
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t("terms.disclaimer.title", "Disclaimer")}
            </h2>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-8">
              <p className="text-gray-800 font-medium mb-4">
                {t("terms.disclaimer.medical_advice", "Not Medical Advice")}
              </p>
              <p className="text-gray-600 mb-4">
                {t("terms.disclaimer.medical_advice_text", "The content on MedMed.AI is provided for general information purposes only and does not constitute medical advice. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified healthcare provider with any questions you may have regarding a medical condition.")}
              </p>
              
              <Separator className="my-6" />
              
              <p className="text-gray-800 font-medium mb-4">
                {t("terms.disclaimer.accuracy", "Accuracy of Information")}
              </p>
              <p className="text-gray-600">
                {t("terms.disclaimer.accuracy_text", "MedMed.AI makes no representations or warranties about the accuracy, completeness, or suitability of the information contained on this website. Any reliance you place on such information is strictly at your own risk.")}
              </p>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t("terms.limitation.title", "Limitations")}
            </h2>
            
            <p className="text-gray-600 mb-8">
              {t("terms.limitation.text", "In no event shall MedMed.AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on MedMed.AI's website, even if MedMed.AI or a MedMed.AI authorized representative has been notified orally or in writing of the possibility of such damage.")}
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t("terms.revisions.title", "Revisions and Errata")}
            </h2>
            
            <div className="flex items-start gap-4 mb-8">
              <div className="bg-primary/10 p-2 rounded-full mt-1">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <p className="text-gray-600">
                {t("terms.revisions.text", "The materials appearing on MedMed.AI's website could include technical, typographical, or photographic errors. MedMed.AI does not warrant that any of the materials on its website are accurate, complete or current. MedMed.AI may make changes to the materials contained on its website at any time without notice. MedMed.AI does not, however, make any commitment to update the materials.")}
              </p>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t("terms.governing_law.title", "Governing Law")}
            </h2>
            
            <p className="text-gray-600 mb-8">
              {t("terms.governing_law.text", "Any claim relating to MedMed.AI's website shall be governed by the laws of the United States and the State of California without regard to its conflict of law provisions.")}
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t("terms.contact.title", "Contact Us")}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {t("terms.contact.text", "If you have any questions about these Terms of Service, please contact us at:")}
            </p>
            
            <div className="bg-primary/5 p-6 rounded-lg border border-primary/10 mb-8">
              <p className="text-gray-800 font-medium">MedMed.AI</p>
              <p className="text-gray-600">terms@medmed.ai</p>
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

export default Terms;
