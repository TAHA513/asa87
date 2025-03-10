import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useReactToPrint } from "react-to-print";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import Barcode from "react-barcode";
import QRCode from "react-qr-code";

const BarcodeGenerator = () => {
  const { toast } = useToast();
  const [type, setType] = useState<"barcode" | "qrcode">("barcode");
  const [content, setContent] = useState<string>("123456789012");
  const [quantity, setQuantity] = useState<number>(1);
  const [size, setSize] = useState<"small" | "medium" | "large">("medium");
  const [savedCodes, setSavedCodes] = useState<Array<{
    id: number;
    type: "barcode" | "qrcode";
    content: string;
    date: string;
    size: string;
  }>>([]);
  const printRef = useRef<HTMLDivElement>(null);
  const barcodeGridRef = useRef<HTMLDivElement>(null);

  // Load saved codes from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("savedCodes");
    if (saved) {
      setSavedCodes(JSON.parse(saved));
    }
  }, []);

  // Save codes to localStorage when they change
  useEffect(() => {
    localStorage.setItem("savedCodes", JSON.stringify(savedCodes));
  }, [savedCodes]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "Print Barcodes",
    onAfterPrint: () => {
      toast({
        title: "تمت الطباعة بنجاح",
        description: "تم إرسال الباركود إلى الطابعة",
      });
    },
  });

  const saveBarcode = () => {
    if (!content) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال محتوى الباركود",
        variant: "destructive",
      });
      return;
    }

    const newCode = {
      id: Date.now(),
      type,
      content,
      date: new Date().toLocaleDateString("ar-EG"),
      size,
    };
    setSavedCodes([...savedCodes, newCode]);
    toast({
      title: "تم الحفظ",
      description: "تم حفظ الباركود بنجاح",
    });
  };

  const deleteCode = (id: number) => {
    setSavedCodes(savedCodes.filter((code) => code.id !== id));
    toast({
      title: "تم الحذف",
      description: "تم حذف الباركود بنجاح",
    });
  };

  const printSelectedCode = (id: number) => {
    const selectedCode = savedCodes.find((code) => code.id === id);
    if (selectedCode) {
      setType(selectedCode.type);
      setContent(selectedCode.content);
      setSize(selectedCode.size as "small" | "medium" | "large");
      setTimeout(() => {
        handlePrint();
      }, 100);
    }
  };

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

  const getBarcodesForPrinting = () => {
    const barcodes = [];
    for (let i = 0; i < quantity; i++) {
      barcodes.push(
        <div
          key={i}
          className="p-4 flex flex-col items-center border border-dashed border-gray-300 m-2"
        >
          {type === "barcode" ? (
            <Barcode
              value={content || "123456789012"}
              width={getBarcodeWidth()}
              height={getBarcodeWidth() * 40}
              fontSize={getBarcodeWidth() * 8}
              margin={10}
            />
          ) : (
            <div className="flex flex-col items-center">
              <QRCode
                value={content || "https://example.com"}
                size={getQRCodeSize()}
                level="M"
              />
              <div className="mt-2 text-center">{content}</div>
            </div>
          )}
        </div>
      );
    }
    return barcodes;
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">نظام الباركود</h1>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">إنشاء باركود</TabsTrigger>
          <TabsTrigger value="saved">الباركودات المحفوظة</TabsTrigger>
          <TabsTrigger value="print">صفحة الطباعة</TabsTrigger>
        </TabsList>

        {/* إنشاء باركود جديد */}
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>إنشاء باركود جديد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">نوع الباركود</Label>
                    <Select
                      value={type}
                      onValueChange={(value) => setType(value as "barcode" | "qrcode")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الباركود" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="barcode">باركود خطي</SelectItem>
                        <SelectItem value="qrcode">QR كود</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">محتوى الباركود</Label>
                    <Input
                      id="content"
                      placeholder={
                        type === "barcode"
                          ? "أدخل الأرقام أو النص (123456789012)"
                          : "أدخل النص أو الرابط"
                      }
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">حجم الباركود</Label>
                    <Select
                      value={size}
                      onValueChange={(value) => setSize(value as "small" | "medium" | "large")}
                    >
                      <SelectTrigger>
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
                    <Button variant="outline" onClick={handlePrint}>
                      طباعة
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-center p-4 border rounded-md">
                  <div className="text-center">
                    <div className="mb-4">معاينة</div>
                    {type === "barcode" ? (
                      <Barcode
                        value={content || "123456789012"}
                        width={getBarcodeWidth()}
                        height={getBarcodeWidth() * 40}
                        fontSize={getBarcodeWidth() * 8}
                        margin={10}
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <QRCode
                          value={content || "https://example.com"}
                          size={getQRCodeSize()}
                          level="M"
                        />
                        <div className="mt-2 text-center">{content}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* الباركودات المحفوظة */}
        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>الباركودات المحفوظة</CardTitle>
            </CardHeader>
            <CardContent>
              {savedCodes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد باركودات محفوظة
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
                          {code.type === "barcode" ? "باركود خطي" : "QR كود"}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {code.content}
                        </TableCell>
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

        {/* صفحة الطباعة */}
        <TabsContent value="print">
          <Card>
            <CardHeader>
              <CardTitle>صفحة الطباعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button onClick={handlePrint}>طباعة الباركود</Button>
              </div>

              <div className="border rounded-md p-4">
                <div
                  ref={printRef}
                  className="print-container"
                  style={{
                    width: "100%",
                    minHeight: "200px",
                  }}
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-center justify-items-center">
                    {getBarcodesForPrinting()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container,
          .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default BarcodeGenerator;