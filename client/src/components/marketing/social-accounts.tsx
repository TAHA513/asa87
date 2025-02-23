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
  },
  instagram: {
    label: "انستغرام",
    authUrl: "https://www.instagram.com/accounts/login",
  },
  twitter: {
    label: "تويتر",
    authUrl: "https://twitter.com/login",
  },
  linkedin: {
    label: "لينكد إن",
    authUrl: "https://www.linkedin.com/login",
  },
  snapchat: {
    label: "سناب شات",
    authUrl: "https://accounts.snapchat.com/accounts/login",
  },
  tiktok: {
    label: "تيك توك",
    authUrl: "https://www.tiktok.com/login",
  },
};

export default function SocialAccounts() {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState<{[key: string]: boolean}>({});

  const { data: accounts = [] } = useQuery<SocialMediaAccount[]>({
    queryKey: ["/api/marketing/social-accounts"],
  });

  const connectPlatform = async (platform: string) => {
    const config = platformConfig[platform as keyof typeof platformConfig];
    if (!config) return;

    // فتح صفحة تسجيل الدخول الرسمية في نافذة جديدة
    window.open(config.authUrl, '_blank', 'width=600,height=700,scrollbars=yes');
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(platformConfig).map(([platform, config]) => {
            const Icon = platformIcons[platform as keyof typeof platformIcons];

            return (
              <div
                key={platform}
                className="flex flex-col items-center p-4 border rounded-lg space-y-4"
              >
                <Icon className="h-8 w-8" />
                <h3 className="font-medium">{config.label}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => connectPlatform(platform)}
                >
                  تسجيل الدخول
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}