import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

interface StoreSettings {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  taxNumber: string;
  logo: string;
  description: string;
}

export function StoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>({
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
    taxNumber: "",
    logo: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/store-settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Error fetching store settings:", error);
      }
    }

    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiRequest('PUT', '/api/store-settings', settings);
      toast.success("تم حفظ إعدادات المتجر بنجاح");
    } catch (error) {
      console.error("Error saving store settings:", error);
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>معلومات المتجر الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المتجر</Label>
                <Input
                  id="name"
                  name="name"
                  value={settings.name}
                  onChange={handleChange}
                  placeholder="أدخل اسم المتجر"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">رقم الهاتف</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={settings.phoneNumber}
                  onChange={handleChange}
                  placeholder="أدخل رقم الهاتف"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={settings.email}
                  onChange={handleChange}
                  placeholder="example@store.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                <Input
                  id="taxNumber"
                  name="taxNumber"
                  value={settings.taxNumber}
                  onChange={handleChange}
                  placeholder="أدخل الرقم الضريبي"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">العنوان</Label>
              <Textarea
                id="address"
                name="address"
                value={settings.address}
                onChange={handleChange}
                placeholder="أدخل عنوان المتجر"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">وصف المتجر</Label>
              <Textarea
                id="description"
                name="description"
                value={settings.description}
                onChange={handleChange}
                placeholder="أدخل وصفاً للمتجر"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">شعار المتجر (رابط URL)</Label>
              <Input
                id="logo"
                name="logo"
                value={settings.logo}
                onChange={handleChange}
                placeholder="أدخل رابط شعار المتجر"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </div>
      </div>
    </form>
  );
}