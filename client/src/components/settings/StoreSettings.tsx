
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Grid, Upload, Info } from "lucide-react";
import { useTheme } from "../../contexts/theme-provider";

export function StoreSettings() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [formData, setFormData] = useState({
    storeName: "",
    storeAddress: "",
    storePhone: "",
    storeEmail: "",
    taxNumber: "",
    logoUrl: "",
    receiptNotes: "",
    enableLogo: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      enableLogo: checked,
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchStoreSettings = async () => {
    try {
      const response = await fetch('/api/store-settings');
      if (response.ok) {
        const data = await response.json();
        setFormData({
          storeName: data.storeName || "",
          storeAddress: data.storeAddress || "",
          storePhone: data.storePhone || "",
          storeEmail: data.storeEmail || "",
          taxNumber: data.taxNumber || "",
          logoUrl: data.logoUrl || "",
          receiptNotes: data.receiptNotes || "",
          enableLogo: data.enableLogo,
        });
        
        if (data.logoUrl) {
          setLogoPreview(data.logoUrl);
        }
      }
    } catch (error) {
      console.error("Error fetching store settings:", error);
      toast.error("فشل في جلب إعدادات المتجر");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create form data for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value as string);
      });
      
      // Add logo if changed
      if (logo) {
        formDataToSend.append('logo', logo);
      }

      const response = await fetch('/api/store-settings', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success("تم حفظ إعدادات المتجر بنجاح");
        fetchStoreSettings();
      } else {
        toast.error("فشل في حفظ إعدادات المتجر");
      }
    } catch (error) {
      console.error("Error saving store settings:", error);
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-xl">إعدادات المتجر</CardTitle>
          <CardDescription>
            قم بإدارة بيانات المتجر التي تظهر في الفواتير والتقارير
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="storeName">اسم المتجر</Label>
                <Input
                  id="storeName"
                  name="storeName"
                  placeholder="اسم المتجر الذي سيظهر في الفواتير"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="storeAddress">عنوان المتجر</Label>
                <Input
                  id="storeAddress"
                  name="storeAddress"
                  placeholder="العنوان"
                  value={formData.storeAddress}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="storePhone">رقم الهاتف</Label>
                <Input
                  id="storePhone"
                  name="storePhone"
                  type="tel"
                  placeholder="رقم هاتف المتجر"
                  value={formData.storePhone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="storeEmail">البريد الإلكتروني</Label>
                <Input
                  id="storeEmail"
                  name="storeEmail"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.storeEmail}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                <Input
                  id="taxNumber"
                  name="taxNumber"
                  placeholder="الرقم الضريبي (إن وجد)"
                  value={formData.taxNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <Label htmlFor="logoUpload">شعار المتجر</Label>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="enableLogo" 
                      checked={formData.enableLogo}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="enableLogo" className="mr-2">إظهار الشعار في الفواتير</Label>
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                  {logoPreview ? (
                    <div className="mb-4 relative">
                      <img 
                        src={logoPreview} 
                        alt="شعار المتجر" 
                        className="max-h-36 max-w-full border rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-0 left-0 w-8 h-8 p-0 rounded-full"
                        onClick={() => {
                          setLogo(null);
                          setLogoPreview("");
                          setFormData(prev => ({ ...prev, logoUrl: "" }));
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <div className="border border-dashed border-border rounded-md p-8 flex flex-col items-center justify-center mb-4">
                      <Grid className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        اسحب وأفلت الشعار هنا أو اضغط للاختيار
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-center">
                    <Label
                      htmlFor="logoUpload"
                      className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>اختيار شعار</span>
                    </Label>
                    <Input
                      id="logoUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="receiptNotes">ملاحظات الفاتورة</Label>
                <Textarea
                  id="receiptNotes"
                  name="receiptNotes"
                  placeholder="ملاحظات تظهر أسفل الفاتورة"
                  rows={3}
                  value={formData.receiptNotes}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="bg-muted/50 p-4 rounded-md flex gap-3 items-start">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              ستظهر هذه المعلومات في جميع الفواتير والتقارير المطبوعة. تأكد من صحة البيانات قبل الحفظ.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
