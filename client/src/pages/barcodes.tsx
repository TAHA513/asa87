import React, { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast"; // Corrected import statement
import Sidebar from "@/components/sidebar";
import JsBarcode from "jsbarcode";
import { Printer, Plus } from "lucide-react";

export default function BarcodesPage() {
  const [bulkBarcodes, setBulkBarcodes] = useState("");
  const [generatedBarcodes, setGeneratedBarcodes] = useState<string[]>([]);
  const [singleBarcode, setSingleBarcode] = useState("");
  const [selectedSymbology, setSelectedSymbology] = useState("CODE128");
  const [scale, setScale] = useState(3);
  const [showText, setShowText] = useState(true);
  const [lineColor, setLineColor] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [marginLeft, setMarginLeft] = useState(10);
  const [marginRight, setMarginRight] = useState(10);
  const [paddingValue, setPaddingValue] = useState(10);
  const [isPrinting, setIsPrinting] = useState(false);

  const printRef = useRef(null);
  const printRef2 = useRef(null);

  const { handlePrint } = useReactToPrint({
    content: () => printRef2.current,
    onBeforePrint: () => setIsPrinting(true),
    onAfterPrint: () => {
      setIsPrinting(false);
    },
    removeAfterPrint: false,
    copyStyles: true,
    documentTitle: "الباركود المطبوع",
    pageStyle: `
      @page {
        size: auto;
        margin: 0mm;
      }
      @media print {
        html, body {
          height: 100%;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden;
        }
        .barcode {
          break-inside: avoid;
          padding: ${paddingValue}px;
        }
      }
    `,
  });

  useEffect(() => {
    generateCanvas();
  }, [generatedBarcodes, selectedSymbology, scale, showText, lineColor, background, marginLeft, marginRight, paddingValue]);

  const generateCanvas = () => {
    const canvases = document.querySelectorAll("canvas.barcode");
    canvases.forEach((canvas, index) => {
      try {
        const code = generatedBarcodes[index];
        JsBarcode(canvas, code, {
          format: selectedSymbology,
          width: Number(scale),
          height: 80,
          displayValue: showText,
          lineColor: lineColor,
          margin: 0,
          background: background,
          marginLeft: Number(marginLeft),
          marginRight: Number(marginRight),
        });
      } catch (error) {
        console.error("Error generating barcode:", error);
      }
    });
  };

  const generateQRCode = () => {
    console.log("QR code generation not implemented yet");
    toast({
      title: "لم يتم تنفيذ إنشاء كود QR بعد",
      description: "سيتم إضافة هذه الميزة قريبًا",
    });
  };

  const generateBarcode = () => {
    try {
      if (!singleBarcode) {
        toast({
          title: "خطأ",
          description: "الرجاء إدخال قيمة للباركود",
          variant: "destructive",
        });
        return;
      }

      // إضافة الباركود المفرد إلى القائمة
      setGeneratedBarcodes([...generatedBarcodes, singleBarcode]);
      toast({
        title: "تم إنشاء الباركود بنجاح",
        description: `تم إنشاء الباركود: ${singleBarcode}`,
      });
    } catch (error) {
      console.error("خطأ في إنشاء باركود فردي:", error);
      toast({
        title: "خطأ في إنشاء الباركود",
        description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
        variant: "destructive",
      });
    }
  };

  const generateBulkBarcodes = () => {
    try {
      if (!bulkBarcodes) {
        toast({
          title: "خطأ",
          description: "الرجاء إدخال قيم للباركود",
          variant: "destructive",
        });
        return;
      }

      // تقسيم النص إلى أسطر
      const codes = bulkBarcodes
        .split("\n")
        .map((code) => code.trim())
        .filter((code) => code.length > 0);

      if (codes.length === 0) {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على أكواد صالحة",
          variant: "destructive",
        });
        return;
      }

      setGeneratedBarcodes([...generatedBarcodes, ...codes]);
      toast({
        title: "تم إنشاء الباركود بنجاح",
        description: `تم إنشاء ${codes.length} باركود`,
      });
    } catch (error) {
      console.error("خطأ في إنشاء باركودات متعددة:", error);
      toast({
        title: "خطأ في إنشاء الباركودات",
        description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-1 h-screen overflow-hidden">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto p-6 bg-background">
        <h1 className="text-3xl font-bold mb-6">إنشاء الباركود</h1>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6">
          <div>
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="single">باركود مفرد</TabsTrigger>
                <TabsTrigger value="bulk">باركود متعدد</TabsTrigger>
                <TabsTrigger value="qr">QR كود</TabsTrigger>
              </TabsList>
              <TabsContent value="single">
                <Card>
                  <CardHeader>
                    <CardTitle>إنشاء باركود مفرد</CardTitle>
                    <CardDescription>
                      قم بإدخال القيمة لإنشاء باركود واحد
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="singleBarcode">قيمة الباركود</Label>
                        <Input
                          id="singleBarcode"
                          placeholder="أدخل قيمة الباركود"
                          value={singleBarcode}
                          onChange={(e) => setSingleBarcode(e.target.value)}
                        />
                      </div>
                      <Button onClick={generateBarcode} className="w-full">
                        <Plus className="w-4 h-4 ml-2" />
                        إنشاء الباركود
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="bulk">
                <Card>
                  <CardHeader>
                    <CardTitle>إنشاء باركود متعدد</CardTitle>
                    <CardDescription>
                      أدخل كل باركود في سطر منفصل
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="bulkBarcodes">قيم الباركود</Label>
                        <textarea
                          id="bulkBarcodes"
                          className="min-h-[120px] rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder="أدخل كل قيمة باركود في سطر منفصل"
                          value={bulkBarcodes}
                          onChange={(e) => setBulkBarcodes(e.target.value)}
                        />
                      </div>
                      <Button onClick={generateBulkBarcodes} className="w-full">
                        <Plus className="w-4 h-4 ml-2" />
                        إنشاء الباركودات
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="qr">
                <Card>
                  <CardHeader>
                    <CardTitle>إنشاء QR كود</CardTitle>
                    <CardDescription>
                      قم بإدخال النص أو الرابط لإنشاء QR كود
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="qrContent">محتوى QR كود</Label>
                        <Input
                          id="qrContent"
                          placeholder="أدخل النص أو الرابط"
                        />
                      </div>
                      <Button onClick={generateQRCode} className="w-full">
                        <Plus className="w-4 h-4 ml-2" />
                        إنشاء QR كود
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>إعدادات الباركود</CardTitle>
                <CardDescription>
                  قم بتخصيص مظهر الباركود
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="symbology">نوع الباركود</Label>
                    <select
                      id="symbology"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={selectedSymbology}
                      onChange={(e) => setSelectedSymbology(e.target.value)}
                    >
                      <option value="CODE128">CODE128 (الافتراضي)</option>
                      <option value="CODE39">CODE39</option>
                      <option value="EAN13">EAN-13</option>
                      <option value="EAN8">EAN-8</option>
                      <option value="UPC">UPC</option>
                      <option value="ITF14">ITF-14</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="scale">حجم الباركود</Label>
                    <Input
                      id="scale"
                      type="number"
                      min="1"
                      max="10"
                      value={scale}
                      onChange={(e) => setScale(Number(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>إظهار النص</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="showText"
                        checked={showText}
                        onChange={(e) => setShowText(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="showText" className="text-sm cursor-pointer">
                        عرض القيمة تحت الباركود
                      </Label>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lineColor">لون الخطوط</Label>
                    <div className="flex gap-2">
                      <Input
                        id="lineColor"
                        type="color"
                        value={lineColor}
                        onChange={(e) => setLineColor(e.target.value)}
                        className="w-12 h-9 p-1"
                      />
                      <Input
                        type="text"
                        value={lineColor}
                        onChange={(e) => setLineColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="background">لون الخلفية</Label>
                    <div className="flex gap-2">
                      <Input
                        id="background"
                        type="color"
                        value={background}
                        onChange={(e) => setBackground(e.target.value)}
                        className="w-12 h-9 p-1"
                      />
                      <Input
                        type="text"
                        value={background}
                        onChange={(e) => setBackground(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="marginLeft">الهامش الأيسر</Label>
                      <Input
                        id="marginLeft"
                        type="number"
                        min="0"
                        max="50"
                        value={marginLeft}
                        onChange={(e) => setMarginLeft(Number(e.target.value))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="marginRight">الهامش الأيمن</Label>
                      <Input
                        id="marginRight"
                        type="number"
                        min="0"
                        max="50"
                        value={marginRight}
                        onChange={(e) => setMarginRight(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="padding">التباعد بين الباركودات</Label>
                    <Input
                      id="padding"
                      type="number"
                      min="0"
                      max="50"
                      value={paddingValue}
                      onChange={(e) => setPaddingValue(Number(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>الباركودات المنشأة</CardTitle>
                    <CardDescription>
                      {generatedBarcodes.length === 0
                        ? "لم يتم إنشاء أي باركود بعد"
                        : `تم إنشاء ${generatedBarcodes.length} باركود`}
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Printer className="h-4 w-4 ml-2" />
                        طباعة
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>طباعة الباركود</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <div>
                          <h3 className="font-semibold mb-2">معاينة الطباعة</h3>
                          <div
                            ref={printRef2}
                            className="p-4 border rounded-lg bg-white max-h-[60vh] overflow-y-auto"
                          >
                            <div className="grid grid-cols-2 gap-4 print:grid-cols-2">
                              {generatedBarcodes.map((code, index) => (
                                <div
                                  key={index}
                                  className="barcode-wrapper border rounded p-2 flex flex-col items-center justify-center"
                                  style={{ padding: `${paddingValue}px` }}
                                >
                                  <canvas className="barcode" data-value={code}></canvas>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button onClick={handlePrint}>
                            <Printer className="h-4 w-4 ml-2" />
                            طباعة الباركود
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {generatedBarcodes.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground flex flex-col items-center">
                    <Printer className="h-16 w-16 text-muted-foreground/20 mb-4" />
                    <p>لم يتم إنشاء أي باركود بعد</p>
                    <p className="text-sm">قم بإنشاء باركود باستخدام النموذج على اليمين</p>
                  </div>
                ) : (
                  <div
                    ref={printRef}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-4"
                  >
                    {generatedBarcodes.map((code, index) => (
                      <div
                        key={index}
                        className="barcode-wrapper border rounded p-2 flex flex-col items-center justify-center"
                        style={{ padding: `${paddingValue}px` }}
                      >
                        <canvas className="barcode" data-value={code}></canvas>
                        <div className="flex justify-between w-full mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newBarcodes = [...generatedBarcodes];
                              newBarcodes.splice(index, 1);
                              setGeneratedBarcodes(newBarcodes);
                            }}
                          >
                            حذف
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}