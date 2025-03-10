
import React, { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Barcode from "react-barcode";
import QRCode from "react-qr-code";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// تعريف النمط للباركود المحفوظ
interface SavedBarcode {
  id: number;
  type: "barcode" | "qrcode";
  content: string;
  date: string;
  size: string;
}

const BarcodeGenerator = () => {
  const { toast } = useToast();
  const [type, setType] = useState<"barcode" | "qrcode">("barcode");
  const [content, setContent] = useState<string>("123456789012");
  const [quantity, setQuantity] = useState<number>(1);
  const [size, setSize] = useState<"small" | "medium" | "large">("medium");
  const [savedCodes, setSavedCodes] = useState<SavedBarcode[]>([]);
  
  // مراجع للطباعة
  const printRef = useRef<HTMLDivElement>(null);
  const printContentRef = useRef<HTMLDivElement>(null);

  // تحميل الباركودات المحفوظة عند بدء التطبيق
  useEffect(() => {
    const saved = localStorage.getItem("savedCodes");
    if (saved) {
      setSavedCodes(JSON.parse(saved));
    }
  }, []);

  // حفظ الباركودات عند تغييرها
  useEffect(() => {
    localStorage.setItem("savedCodes", JSON.stringify(savedCodes));
  }, [savedCodes]);

  // إعداد وظيفة الطباعة
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "باركود",
    onBeforeGetContent: () => {
      return new Promise<void>((resolve) => {
        console.log("التحضير للطباعة...");
        console.log("مرجع الطباعة موجود:", !!printRef.current);
        
        // تأكد من وجود المحتوى قبل الطباعة
        if (!printRef.current) {
          console.error("مرجع الطباعة غير موجود!");
        }
        
        // انتظر قليلاً قبل الطباعة
        setTimeout(() => {
          resolve();
        }, 500);
      });
    },
    onPrintError: (errorLocation, error) => {
      console.error(`خطأ في الطباعة (${errorLocation}):`, error);
      toast({
        title: "فشل في الطباعة",
        description: `حدث خطأ أثناء محاولة الطباعة: ${error.message || "خطأ غير معروف"}`,
        variant: "destructive",
      });
    },
    onAfterPrint: () => {
      toast({
        title: "تمت الطباعة بنجاح",
        description: "تم إرسال الباركود إلى الطابعة",
      });
    },
    removeAfterPrint: false,
  });

  // حفظ باركود جديد
  const saveBarcode = () => {
    if (!content) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال محتوى الباركود",
        variant: "destructive",
      });
      return;
    }

    const newCode = {
      id: Date.now(),
      type,
      content,
      date: new Date().toLocaleString("ar-IQ"),
      size,
    };

    setSavedCodes([...savedCodes, newCode]);
    toast({
      title: "تم الحفظ",
      description: "تم حفظ الباركود بنجاح",
    });
  };

  // حذف باركود
  const deleteCode = (id: number) => {
    setSavedCodes(savedCodes.filter((code) => code.id !== id));
    toast({
      title: "تم الحذف",
      description: "تم حذف الباركود بنجاح",
    });
  };

  // طباعة باركود محدد
  const printSelectedCode = (id: number) => {
    const selectedCode = savedCodes.find((code) => code.id === id);
    if (selectedCode) {
      // تعيين القيم للباركود المحدد
      setType(selectedCode.type as "barcode" | "qrcode");
      setContent(selectedCode.content);
      setSize(selectedCode.size as "small" | "medium" | "large");
      
      // انتظر حتى يتم تحديث الحالة ثم طباعة
      setTimeout(() => {
        console.log("جاري محاولة الطباعة للباركود:", selectedCode.content);
        console.log("مرجع الطباعة موجود:", !!printRef.current);
        if (printRef.current) {
          handlePrint();
        } else {
          toast({
            title: "خطأ في الطباعة",
            description: "لا يمكن العثور على محتوى للطباعة",
            variant: "destructive",
          });
        }
      }, 500);
    }
  };

  // تحديد عرض الباركود حسب الحجم
  const getBarcodeWidth = () => {
    switch (size) {
      case "small":
        return 1;
      case "medium":
        return 2;
      case "large":
        return 3;
      default:
        return 2;
    }
  };

  // تحديد حجم رمز QR حسب الحجم
  const getQRCodeSize = () => {
    switch (size) {
      case "small":
        return 100;
      case "medium":
        return 150;
      case "large":
        return 200;
      default:
        return 150;
    }
  };

  // عرض الباركود أو رمز QR
  const renderBarcode = () => {
    if (type === "barcode") {
      return (
        <Barcode
          value={content || "123456789012"}
          width={getBarcodeWidth()}
          height={getBarcodeWidth() * 40}
          fontSize={getBarcodeWidth() * 8}
          margin={10}
        />
      );
    } else {
      return (
        <div className="flex flex-col items-center">
          <QRCode
            value={content || "https://example.com"}
            size={getQRCodeSize()}
            level="M"
          />
          <div className="mt-2 text-center">{content}</div>
        </div>
      );
    }
  };

  // إنشاء مصفوفة من الباركودات للطباعة
  const getBarcodesForPrinting = () => {
    if (!content) {
      return <div>لا يوجد محتوى للطباعة</div>;
    }
    
    // إنشاء عدد من نسخ الباركود حسب العدد المطلوب
    return Array.from({ length: quantity }, (_, i) => (
      <div
        key={i}
        className="barcode-item print-item"
        style={{
          padding: '10px',
          margin: '5px 0',
          textAlign: 'center',
          breakInside: 'avoid',
          pageBreakInside: 'avoid'
        }}
      >
        {renderBarcode()}
      </div>
    ));
  };

  // تنفيذ طباعة الباركود الحالي
  const printCurrentBarcode = () => {
    if (!content) {
      toast({
        title: "تنبيه",
        description: "يرجى إدخال محتوى الباركود أولاً",
        variant: "destructive",
      });
      return;
    }
    
    console.log("جاري محاولة الطباعة للمحتوى:", content);
    console.log("مرجع الطباعة موجود:", !!printRef.current);
    
    if (printRef.current) {
      handlePrint();
    } else {
      toast({
        title: "خطأ في الطباعة",
        description: "لا يمكن العثور على محتوى للطباعة",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">نظام الباركود</h1>
      
      {/* منطقة الطباعة - مهمة جداً أن تكون موجودة دائماً وليست مخفية بـ display: none */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }} className="print-container">
        <div ref={printRef} style={{ width: '100%', padding: '20px' }}>
          <div className="flex flex-col items-center justify-center">
            {getBarcodesForPrinting()}
          </div>
        </div>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">إنشاء باركود</TabsTrigger>
          <TabsTrigger value="saved">الباركودات المحفوظة</TabsTrigger>
          <TabsTrigger value="print">صفحة الطباعة</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>إنشاء باركود جديد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="barcodeType">نوع الباركود</Label>
                    <Select
                      value={type}
                      onValueChange={(value) => setType(value as "barcode" | "qrcode")}
                    >
                      <SelectTrigger id="barcodeType">
                        <SelectValue placeholder="اختر نوع الباركود" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="barcode">باركود خطي</SelectItem>
                        <SelectItem value="qrcode">رمز QR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barcodeContent">محتوى الباركود</Label>
                    <Input
                      id="barcodeContent"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={
                        type === "barcode"
                          ? "أدخل رقم المنتج أو الباركود"
                          : "أدخل النص أو رابط URL"
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barcodeSize">حجم الباركود</Label>
                    <Select
                      value={size}
                      onValueChange={(value) => setSize(value as "small" | "medium" | "large")}
                    >
                      <SelectTrigger id="barcodeSize">
                        <SelectValue placeholder="اختر حجم الباركود" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">صغير</SelectItem>
                        <SelectItem value="medium">متوسط</SelectItem>
                        <SelectItem value="large">كبير</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">عدد النسخ للطباعة</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      max={100}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <Button onClick={saveBarcode}>حفظ الباركود</Button>
                    <Button 
                      variant="outline" 
                      onClick={printCurrentBarcode}
                    >
                      <span>طباعة</span>
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">معاينة الباركود</h3>
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    {renderBarcode()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>الباركودات المحفوظة</CardTitle>
            </CardHeader>
            <CardContent>
              {savedCodes.length === 0 ? (
                <div className="text-center py-4">
                  لا يوجد باركودات محفوظة
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>النوع</TableHead>
                      <TableHead>المحتوى</TableHead>
                      <TableHead>تاريخ الإنشاء</TableHead>
                      <TableHead>الحجم</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savedCodes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell>
                          {code.type === "barcode" ? "باركود خطي" : "رمز QR"}
                        </TableCell>
                        <TableCell>{code.content}</TableCell>
                        <TableCell>{code.date}</TableCell>
                        <TableCell>
                          {code.size === "small"
                            ? "صغير"
                            : code.size === "medium"
                            ? "متوسط"
                            : "كبير"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2 rtl:space-x-reverse">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => printSelectedCode(code.id)}
                            >
                              طباعة
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteCode(code.id)}
                            >
                              حذف
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="print">
          <Card>
            <CardHeader>
              <CardTitle>صفحة الطباعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-muted-foreground mb-2">
                  يمكنك طباعة الباركود الحالي عدة مرات على نفس الصفحة.
                </p>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Button 
                    onClick={printCurrentBarcode}
                  >
                    طباعة الباركود
                  </Button>
                </div>
              </div>

              <div className="border p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">معاينة الطباعة</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: Math.min(6, quantity) }).map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center justify-center p-2 border rounded"
                    >
                      {renderBarcode()}
                    </div>
                  ))}
                </div>
                {quantity > 6 && (
                  <p className="text-center mt-4 text-sm text-muted-foreground">
                    + {quantity - 6} باركود إضافي للطباعة
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BarcodeGenerator;
