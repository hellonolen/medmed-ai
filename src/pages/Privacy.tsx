
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
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

        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">{t("privacy.title", "Privacy Policy")}</h1>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-gray-600 mb-8">
            {t("privacy.last_updated", "Last Updated")}: {t("privacy.date", "May 15, 2023")}
          </p>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t("privacy.intro.title", "Introduction")}</h2>
            <p className="mb-4">
              {t("privacy.intro.p1", "MedMed.AI respects your privacy and is committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.")}
            </p>
            <p>
              {t("privacy.intro.p2", "This privacy policy applies to the personal data we process when you use our services, including accessing our websites, using our mobile applications, and other digital platforms.")}
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t("privacy.data.title", "Data We Collect")}</h2>
            <p className="mb-4">
              {t("privacy.data.p1", "We collect several types of information from and about users of our Services, including:")}
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>{t("privacy.data.li1", "Information you provide to us, such as your name, email address, and other contact information.")}</li>
              <li>{t("privacy.data.li2", "Health information you choose to share when using our medication and symptom checker tools.")}</li>
              <li>{t("privacy.data.li3", "Information about your interactions with our Services, such as your search history and preferences.")}</li>
              <li>{t("privacy.data.li4", "Technical information, such as your IP address, browser type, and device information.")}</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t("privacy.use.title", "How We Use Your Data")}</h2>
            <p className="mb-4">
              {t("privacy.use.p1", "We use the information we collect to:")}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t("privacy.use.li1", "Provide, operate, and maintain our Services.")}</li>
              <li>{t("privacy.use.li2", "Improve and personalize your experience with our Services.")}</li>
              <li>{t("privacy.use.li3", "Develop new products, services, features, and functionality.")}</li>
              <li>{t("privacy.use.li4", "Communicate with you about our Services, including sending you notifications and updates.")}</li>
              <li>{t("privacy.use.li5", "Ensure the security and integrity of our Services.")}</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t("privacy.sharing.title", "Sharing Your Information")}</h2>
            <p className="mb-4">
              {t("privacy.sharing.p1", "We may share your information with:")}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t("privacy.sharing.li1", "Service providers who perform services on our behalf.")}</li>
              <li>{t("privacy.sharing.li2", "Business partners with whom we jointly offer products or services.")}</li>
              <li>{t("privacy.sharing.li3", "Legal authorities when required by law or to protect our rights.")}</li>
            </ul>
            <p className="mt-4">
              {t("privacy.sharing.p2", "We will never sell your personal health information to third parties for marketing purposes.")}
            </p>
          </section>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">© {currentYear} MedMed.AI. {t("app.footer.rights", "All rights reserved.")}</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
