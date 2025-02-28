import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SocialMediaAccount } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  SiFacebook,
  SiInstagram,
  SiX,
  SiLinkedin,
  SiSnapchat,
  SiTiktok,
} from "react-icons/si";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const platformIcons = {
  facebook: SiFacebook,
  instagram: SiInstagram,
  twitter: SiX,
  linkedin: SiLinkedin,
  snapchat: SiSnapchat,
  tiktok: SiTiktok,
};

const platformConfig = {
  facebook: {
    label: "فيسبوك",
    authUrl: "https://www.facebook.com/login",
    color: "#1877F2",
    hoverColor: "#1559b7",
    textColor: "white",
    pixelIdFormat: /^\d{15,16}$/
  },
  instagram: {
    label: "انستغرام",
    authUrl: "https://www.instagram.com/accounts/login",
    color: "linear-gradient(45deg, #833AB4, #C13584, #E1306C, #FD1D1D)",
    hoverColor: "linear-gradient(45deg, #6d2e94, #a02d6e, #bc285a, #d41919)",
    textColor: "white",
    pixelIdFormat: /^[0-9]+$/
  },
  twitter: {
    label: "تويتر",
    authUrl: "https://twitter.com/login",
    color: "#1DA1F2",
    hoverColor: "#1884c7",
    textColor: "white",
    pixelIdFormat: /^[a-zA-Z0-9]{10,}$/
  },
  linkedin: {
    label: "لينكد إن",
    authUrl: "https://www.linkedin.com/login",
    color: "#0A66C2",
    hoverColor: "#084d94",
    textColor: "white",
    pixelIdFormat: /^[0-9]+$/
  },
  snapchat: {
    label: "سناب شات",
    authUrl: "https://accounts.snapchat.com/accounts/login",
    color: "#FFFC00",
    hoverColor: "#e6e300",
    textColor: "black",
    pixelIdFormat: /^[a-zA-Z0-9-]{8,}$/
  },
  tiktok: {
    label: "تيك توك",
    authUrl: "https://www.tiktok.com/login",
    color: "linear-gradient(90deg, #00f2ea, #ff0050)",
    hoverColor: "linear-gradient(90deg, #00d6cf, #e6004a)",
    textColor: "white",
    pixelIdFormat: /^[A-Z0-9]{20,}$/
  },
};

export default function SocialAccounts() {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState<{[key: string]: boolean}>({});
  const [selectedMethod, setSelectedMethod] = useState<{[key: string]: "api" | "pixel"}>({});
  const [pixelConfig, setPixelConfig] = useState<{[key: string]: { id: string, config: any }}>({});
  const [pixelErrors, setPixelErrors] = useState<{[key: string]: string}>({});

  const { data: accounts = [] } = useQuery<SocialMediaAccount[]>({
    queryKey: ["/api/marketing/social-accounts"],
  });

  const handleMethodChange = (platform: string, method: "api" | "pixel") => {
    setSelectedMethod(prev => ({
      ...prev,
      [platform]: method
    }));
    // Reset errors when changing method
    setPixelErrors(prev => ({ ...prev, [platform]: "" }));
  };

  const validatePixelId = (platform: string, pixelId: string): boolean => {
    const config = platformConfig[platform as keyof typeof platformConfig];
    if (!config) return false;

    if (!pixelId) {
      setPixelErrors(prev => ({ ...prev, [platform]: "معرف البيكسل مطلوب" }));
      return false;
    }

    if (!config.pixelIdFormat.test(pixelId)) {
      setPixelErrors(prev => ({ ...prev, [platform]: "تنسيق معرف البيكسل غير صحيح" }));
      return false;
    }

    setPixelErrors(prev => ({ ...prev, [platform]: "" }));
    return true;
  };

  const handlePixelConfigChange = (platform: string, field: string, value: string) => {
    setPixelConfig(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
    // Validate on change
    if (field === "id") {
      validatePixelId(platform, value);
    }
  };

  const connectPlatform = async (platform: string) => {
    const config = platformConfig[platform as keyof typeof platformConfig];
    if (!config) return;

    const method = selectedMethod[platform] || "api";
    setIsConnecting(prev => ({ ...prev, [platform]: true }));

    try {
      if (method === "pixel") {
        const pixelId = pixelConfig[platform]?.id;

        // Validate pixel ID before submission
        if (!validatePixelId(platform, pixelId)) {
          setIsConnecting(prev => ({ ...prev, [platform]: false }));
          return;
        }

        const response = await fetch("/api/settings/api-keys", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            platform,
            trackingMethod: "pixel",
            pixelId: pixelConfig[platform]?.id,
            pixelConfiguration: pixelConfig[platform]?.config,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "فشل في ربط البيكسل");
        }

        toast({
          title: "تم الربط بنجاح",
          description: `تم ربط ${config.label} باستخدام البيكسل بنجاح`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/marketing/social-accounts"] });
      } else {
        // API Authentication
        const popup = window.open(
          config.authUrl,
          'تسجيل الدخول',
          'popup=true,menubar=no,toolbar=no,location=no,status=no,width=600,height=700'
        );

        if (popup) {
          const left = (window.screen.width - 600) / 2;
          const top = (window.screen.height - 700) / 2;
          popup.moveTo(left, top);
        }
      }
    } catch (error) {
      console.error("Error connecting platform:", error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل في ربط المنصة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(prev => ({ ...prev, [platform]: false }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>حسابات التواصل الاجتماعي</CardTitle>
        <CardDescription>
          قم بتسجيل الدخول إلى حساباتك على منصات التواصل الاجتماعي
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(platformConfig).map(([platform, config]) => {
            const Icon = platformIcons[platform as keyof typeof platformIcons];
            const method = selectedMethod[platform] || "api";
            const error = pixelErrors[platform];

            return (
              <div
                key={platform}
                className="flex flex-col space-y-4 p-4 border rounded-lg"
                style={{
                  background: config.color,
                  transition: "all 0.3s ease"
                }}
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-8 w-8" style={{ color: config.textColor }} />
                  <h3 className="font-medium" style={{ color: config.textColor }}>
                    {config.label}
                  </h3>
                </div>

                <div className="space-y-4 bg-white bg-opacity-10 p-4 rounded-lg">
                  <div>
                    <Label style={{ color: config.textColor }}>طريقة التتبع</Label>
                    <Select
                      value={method}
                      onValueChange={(value: "api" | "pixel") => handleMethodChange(platform, value)}
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="اختر طريقة التتبع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="pixel">Pixel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {method === "pixel" && (
                    <div className="space-y-2">
                      <Label style={{ color: config.textColor }}>معرف البيكسل</Label>
                      <Input
                        placeholder="أدخل معرف البيكسل"
                        value={pixelConfig[platform]?.id || ""}
                        onChange={(e) => handlePixelConfigChange(platform, "id", e.target.value)}
                        className={`bg-white bg-opacity-20 ${error ? 'border-red-500' : ''}`}
                      />
                      {error && (
                        <p className="text-sm text-red-500 mt-1">{error}</p>
                      )}
                    </div>
                  )}

                  <Button
                    className="w-full hover:opacity-90 transition-opacity"
                    style={{
                      background: "transparent",
                      border: `2px solid ${config.textColor}`,
                      color: config.textColor
                    }}
                    onClick={() => connectPlatform(platform)}
                    disabled={isConnecting[platform] || (method === "pixel" && !!error)}
                  >
                    {isConnecting[platform] ? "جاري الربط..." : (method === "api" ? "تسجيل الدخول" : "ربط البيكسل")}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}