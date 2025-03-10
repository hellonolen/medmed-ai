
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Check, Languages } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "default" | "minimal";
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = "default" }) => {
  const { language, setLanguage, t, supportedLanguages } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1 h-8 px-2">
          <Languages className="h-4 w-4" />
          {variant === "default" && (
            <span className="ml-1 hidden md:inline-block">{supportedLanguages[language]}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {Object.entries(supportedLanguages).map(([code, name]) => (
          <DropdownMenuItem 
            key={code}
            onClick={() => setLanguage(code as any)}
            className="flex items-center justify-between"
          >
            <span>{name}</span>
            {language === code && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
