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
import { apiRequest, queryClient } from "@/lib/queryClient";
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

const platformNames = {
  facebook: "فيسبوك",
  instagram: "انستغرام",
  twitter: "تويتر",
  linkedin: "لينكد إن",
  snapchat: "سناب شات",
  tiktok: "تيك توك",
};

export default function SocialAccounts() {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState<{[key: string]: boolean}>({});

  const { data: accounts = [] } = useQuery<SocialMediaAccount[]>({
    queryKey: ["/api/marketing/social-accounts"],
  });

  const connectPlatform = async (platform: string) => {
    setIsConnecting(prev => ({ ...prev, [platform]: true }));

    try {
      const authWindow = window.open(
        `/api/marketing/social-auth/${platform}`,
        'تسجيل الدخول',
        'width=600,height=700,scrollbars=yes'
      );

      if (!authWindow) {
        throw new Error("تم حظر النافذة المنبثقة");
      }

      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("انتهت مهلة الاتصال"));
        }, 120000); // 2 minute timeout

        const handleMessage = async (event: MessageEvent) => {
          if (event.data.type === 'social-auth-success' && event.data.platform === platform) {
            window.removeEventListener('message', handleMessage);
            clearTimeout(timeoutId);
            resolve(event.data);
          }
        };

        window.addEventListener('message', handleMessage);
      });

      await queryClient.invalidateQueries({
        queryKey: ["/api/marketing/social-accounts"],
      });

      toast({
        title: "تم بنجاح",
        description: `تم ربط حساب ${platformNames[platform as keyof typeof platformNames]} بنجاح`,
      });
    } catch (error) {
      console.error("Error connecting platform:", error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل في ربط الحساب",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(prev => ({ ...prev, [platform]: false }));
    }
  };

  const disconnectPlatform = async (accountId: number) => {
    try {
      await apiRequest("DELETE", `/api/marketing/social-accounts/${accountId}`);
      await queryClient.invalidateQueries({
        queryKey: ["/api/marketing/social-accounts"],
      });
      toast({
        title: "تم بنجاح",
        description: "تم إلغاء ربط الحساب",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إلغاء ربط الحساب",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>حسابات التواصل الاجتماعي</CardTitle>
        <CardDescription>
          قم بربط حسابات التواصل الاجتماعي لإدارة حملاتك التسويقية
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(platformNames).map(([platform, name]) => {
            const Icon = platformIcons[platform as keyof typeof platformIcons];
            const account = accounts.find(acc => acc.platform === platform);

            return (
              <div
                key={platform}
                className="flex flex-col items-center p-4 border rounded-lg space-y-4"
              >
                <Icon className="h-8 w-8" />
                <h3 className="font-medium">{name}</h3>

                {account ? (
                  <>
                    <Badge variant="secondary">{account.accountName}</Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => disconnectPlatform(account.id)}
                    >
                      إلغاء الربط
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => connectPlatform(platform)}
                    disabled={isConnecting[platform]}
                  >
                    {isConnecting[platform] ? "جاري الربط..." : "ربط الحساب"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}