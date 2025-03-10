
import React from 'react';
import { Sun, Moon, Type, ZoomIn, ZoomOut, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

export const AccessibilityPanel = () => {
  const { t, accessibility, updateAccessibility } = useLanguage();
  
  const textSizeMap = {
    'small': 0,
    'medium': 33,
    'large': 66,
    'x-large': 100
  };
  
  const currentTextSizeValue = textSizeMap[accessibility.textSize];
  
  const handleTextSizeChange = (value: number[]) => {
    const textSizes = ['small', 'medium', 'large', 'x-large'];
    const index = Math.round((value[0] / 100) * 3);
    updateAccessibility({ 
      textSize: textSizes[index] as 'small' | 'medium' | 'large' | 'x-large' 
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative"
          aria-label={t("accessibility.settings", "Accessibility Settings")}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">
            {t("accessibility.settings", "Accessibility Settings")}
          </h4>
          <Separator />
          
          <div className="flex flex-col gap-4">
            {/* High Contrast Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {accessibility.highContrast ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <Label htmlFor="high-contrast">
                  {t("accessibility.high_contrast", "High Contrast")}
                </Label>
              </div>
              <Switch
                id="high-contrast"
                checked={accessibility.highContrast}
                onCheckedChange={(checked) => updateAccessibility({ highContrast: checked })}
              />
            </div>
            
            {/* Text Size */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <Label>{t("accessibility.text_size", "Text Size")}</Label>
              </div>
              <div className="flex items-center gap-2">
                <ZoomOut className="h-3 w-3 text-muted-foreground" />
                <Slider
                  value={[currentTextSizeValue]}
                  max={100}
                  step={33}
                  onValueChange={handleTextSizeChange}
                  className="flex-1"
                />
                <ZoomIn className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>A</span>
                <span>AA</span>
                <span>AAA</span>
                <span>AAAA</span>
              </div>
            </div>
            
            {/* Screen Reader Optimized */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <Label htmlFor="screen-reader">
                  {t("accessibility.screen_reader", "Screen Reader Optimized")}
                </Label>
              </div>
              <Switch
                id="screen-reader"
                checked={accessibility.screenReaderOptimized}
                onCheckedChange={(checked) => updateAccessibility({ screenReaderOptimized: checked })}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
