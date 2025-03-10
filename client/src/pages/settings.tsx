
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import ChangePasswordForm from "@/components/settings/change-password";
import ThemeSettings from "@/components/settings/theme-settings";
import ApiKeysForm from "@/components/settings/api-keys-form";
import { Settings as SettingsIcon, Bell, Printer, Paint, Lock, Share, Globe, Keyboard } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Settings() {
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [invoicePrefix, setInvoicePrefix] = useState("INV-");
  const [invoiceFooter, setInvoiceFooter] = useState("شكراً للتعامل معنا");
  const [language, setLanguage] = useState("ar");

  const handleSaveNotifications = () => {
    toast({
      title: "تم الحفظ",
      description: "تم حفظ إعدادات الإشعارات بنجاح",
    });
  };

  const handleSavePrinting = () => {
    toast({
      title: "تم الحفظ",
      description: "تم حفظ إعدادات الطباعة بنجاح",
    });
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <SettingsIcon className="h-6 w-6" />
            <h1 className="text-3xl font-bold">الإعدادات</h1>
          </div>

          <Tabs defaultValue="appearance" className="max-w-3xl">
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Paint className="h-4 w-4" />
                <span>المظهر</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>الإشعارات</span>
              </TabsTrigger>
              <TabsTrigger value="printing" className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                <span>الطباعة</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>الحساب</span>
              </TabsTrigger>
              <TabsTrigger value="api" className="flex items-center gap-2">
                <Share className="h-4 w-4" />
                <span>مفاتيح API</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات المظهر</CardTitle>
                  <CardDescription>
                    قم بتخصيص مظهر التطبيق حسب تفضيلاتك
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ThemeSettings />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إعدادات اللغة</CardTitle>
                  <CardDescription>
                    قم باختيار لغة واجهة المستخدم
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="language">اللغة</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="اختر اللغة" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">الإنجليزية</SelectItem>
                        <SelectItem value="ku">الكردية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="mt-4">حفظ إعدادات اللغة</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات الإشعارات</CardTitle>
                  <CardDescription>
                    تحكم في كيفية ظهور الإشعارات والتنبيهات
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">تفعيل الإشعارات</Label>
                      <p className="text-sm text-muted-foreground">
                        عرض إشعارات للتنبيهات الهامة مثل المخزون المنخفض
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sounds">تفعيل الأصوات</Label>
                      <p className="text-sm text-muted-foreground">
                        تشغيل صوت عند وصول إشعار جديد
                      </p>
                    </div>
                    <Switch
                      id="sounds"
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                    />
                  </div>

                  <Button onClick={handleSaveNotifications} className="mt-4">
                    حفظ إعدادات الإشعارات
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>تنبيهات المخزون</CardTitle>
                  <CardDescription>
                    تحكم في إعدادات تنبيهات المخزون
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="low-stock">تنبيه المخزون المنخفض</Label>
                      <p className="text-sm text-muted-foreground">
                        إظهار تنبيه عندما ينخفض المخزون عن الحد المحدد
                      </p>
                    </div>
                    <Switch
                      id="low-stock"
                      checked={true}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="expiry">تنبيه اقتراب انتهاء الصلاحية</Label>
                      <p className="text-sm text-muted-foreground">
                        إظهار تنبيه عندما تقترب منتجات من تاريخ انتهاء الصلاحية
                      </p>
                    </div>
                    <Switch
                      id="expiry"
                      checked={true}
                    />
                  </div>

                  <Button className="mt-4">
                    حفظ إعدادات التنبيهات
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="printing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات الطباعة</CardTitle>
                  <CardDescription>
                    تخصيص طريقة طباعة الفواتير والباركود
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoice-prefix">بادئة رقم الفاتورة</Label>
                      <Input
                        id="invoice-prefix"
                        value={invoicePrefix}
                        onChange={(e) => setInvoicePrefix(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invoice-footer">تذييل الفاتورة</Label>
                      <Input
                        id="invoice-footer"
                        value={invoiceFooter}
                        onChange={(e) => setInvoiceFooter(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="print-size">حجم الطباعة</Label>
                      <Select defaultValue="80mm">
                        <SelectTrigger id="print-size">
                          <SelectValue placeholder="اختر حجم الطباعة" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="80mm">80 مم</SelectItem>
                          <SelectItem value="58mm">58 مم</SelectItem>
                          <SelectItem value="a4">A4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-print">طباعة تلقائية للفواتير</Label>
                        <p className="text-sm text-muted-foreground">
                          طباعة الفاتورة تلقائياً بعد البيع
                        </p>
                      </div>
                      <Switch
                        id="auto-print"
                        checked={true}
                      />
                    </div>

                    <Button onClick={handleSavePrinting} className="mt-4">
                      حفظ إعدادات الطباعة
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إعدادات الباركود</CardTitle>
                  <CardDescription>
                    تخصيص طريقة طباعة وعرض الباركود
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="barcode-type">نوع الباركود</Label>
                      <Select defaultValue="code128">
                        <SelectTrigger id="barcode-type">
                          <SelectValue placeholder="اختر نوع الباركود" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="code128">Code 128</SelectItem>
                          <SelectItem value="ean13">EAN-13</SelectItem>
                          <SelectItem value="code39">Code 39</SelectItem>
                          <SelectItem value="qrcode">QR Code</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="show-text">إظهار النص مع الباركود</Label>
                        <p className="text-sm text-muted-foreground">
                          إظهار قيمة الباركود كنص أسفل الباركود
                        </p>
                      </div>
                      <Switch
                        id="show-text"
                        checked={true}
                      />
                    </div>

                    <Button className="mt-4">
                      حفظ إعدادات الباركود
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>تغيير كلمة المرور</CardTitle>
                  <CardDescription>
                    قم بتغيير كلمة المرور الخاصة بك
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChangePasswordForm />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الجلسات النشطة</CardTitle>
                  <CardDescription>
                    إدارة الجلسات المسجلة لحسابك
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <p className="font-medium">هذا الجهاز</p>
                        <p className="text-sm text-muted-foreground">آخر تسجيل دخول: اليوم 9:05 AM</p>
                      </div>
                      <Button variant="outline">تسجيل الخروج</Button>
                    </div>
                    <Button variant="destructive">تسجيل الخروج من جميع الأجهزة</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>مفاتيح API للمنصات الاجتماعية</CardTitle>
                  <CardDescription>
                    قم بإضافة مفاتيح API الخاصة بكل منصة تواصل اجتماعي لتتمكن من الربط والتحكم في الحملات الإعلانية
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ApiKeysForm />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
