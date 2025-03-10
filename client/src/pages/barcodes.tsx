
import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Printer, Plus, QrCode, Barcode } from "lucide-react";
import { useReactToPrint } from 'react-to-print';
import JsBarcode from 'jsbarcode';

export default function Barcodes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [barcodeText, setBarcodeText] = useState("");
  const [barcodeFormat, setBarcodeFormat] = useState("CODE128");
  const [barcodeWidth, setBarcodeWidth] = useState(2);
  const [barcodeHeight, setBarcodeHeight] = useState(100);
  const [isPrinting, setIsPrinting] = useState(false);
  const [savedBarcodes, setSavedBarcodes] = useState([]);
  
  const printRef = useRef(null);
  const barcodeRef = useRef(null);
  
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        if (barcodeRef.current && barcodeText) {
          try {
            JsBarcode(barcodeRef.current, barcodeText, {
              format: barcodeFormat,
              width: barcodeWidth,
              height: barcodeHeight,
              displayValue: true,
              font: "monospace",
              fontSize: 14,
              margin: 10,
            });
          } catch (error) {
            toast({
              title: "خطأ",
              description: "لا يمكن إنشاء الباركود، تأكد من النص المدخل",
              variant: "destructive",
            });
          }
        }
        setIsPrinting(true);
        resolve();
      });
    },
    onAfterPrint: () => {
      setIsPrinting(false);
    },
    pageStyle: `
      @page {
        size: 80mm 30mm;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .barcode-print {
          width: 100%;
          text-align: center;
        }
      }
    `,
  });
  
  const generateBarcode = () => {
    if (!barcodeText) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال نص للباركود",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (barcodeRef.current) {
        JsBarcode(barcodeRef.current, barcodeText, {
          format: barcodeFormat,
          width: barcodeWidth,
          height: barcodeHeight,
          displayValue: true,
          font: "monospace",
          fontSize: 14,
          margin: 10,
        });
        
        // إضافة الباركود إلى المحفوظات
        setSavedBarcodes([
          ...savedBarcodes,
          {
            id: Date.now(),
            text: barcodeText,
            format: barcodeFormat,
          }
        ]);
        
        toast({
          title: "تم",
          description: "تم إنشاء الباركود بنجاح",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "لا يمكن إنشاء الباركود، تأكد من النص المدخل",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">إنشاء وطباعة الباركود</h1>
      </div>
      
      <Tabs defaultValue="create" className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">إنشاء باركود</TabsTrigger>
          <TabsTrigger value="saved">الباركودات المحفوظة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>إعدادات الباركود</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode-text">نص الباركود</Label>
                  <Input
                    id="barcode-text"
                    placeholder="أدخل نص الباركود"
                    value={barcodeText}
                    onChange={(e) => setBarcodeText(e.target.value)}
                    dir="ltr"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="barcode-format">نوع الباركود</Label>
                  <Select
                    value={barcodeFormat}
                    onValueChange={setBarcodeFormat}
                  >
                    <SelectTrigger id="barcode-format">
                      <SelectValue placeholder="اختر نوع الباركود" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CODE128">CODE128</SelectItem>
                      <SelectItem value="CODE39">CODE39</SelectItem>
                      <SelectItem value="EAN13">EAN13</SelectItem>
                      <SelectItem value="EAN8">EAN8</SelectItem>
                      <SelectItem value="UPC">UPC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="barcode-width">العرض</Label>
                    <Input
                      id="barcode-width"
                      type="number"
                      min="1"
                      max="5"
                      step="0.5"
                      value={barcodeWidth}
                      onChange={(e) => setBarcodeWidth(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode-height">الارتفاع</Label>
                    <Input
                      id="barcode-height"
                      type="number"
                      min="50"
                      max="200"
                      step="10"
                      value={barcodeHeight}
                      onChange={(e) => setBarcodeHeight(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <Button className="w-full" onClick={generateBarcode}>
                  <Plus className="ml-2 h-4 w-4" />
                  إنشاء الباركود
                </Button>
                
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={handlePrint}
                  disabled={!barcodeText}
                >
                  <Printer className="ml-2 h-4 w-4" />
                  طباعة الباركود
                </Button>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>معاينة الباركود</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center">
                  {barcodeText ? (
                    <svg ref={barcodeRef} className="w-full"></svg>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Barcode className="h-16 w-16 mb-2" />
                      <p>أدخل نص الباركود للمعاينة</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الباركودات المحفوظة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedBarcodes.length > 0 ? (
                  savedBarcodes.map((barcode) => (
                    <div
                      key={barcode.id}
                      className="border rounded-md p-4 flex flex-col items-center"
                    >
                      <div className="text-sm font-medium mb-2">
                        {barcode.text}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {barcode.format}
                      </div>
                      <div className="mb-2 w-full">
                        <svg
                          id={`barcode-${barcode.id}`}
                          className="w-full"
                          ref={(el) => {
                            if (el) {
                              try {
                                JsBarcode(el, barcode.text, {
                                  format: barcode.format,
                                  width: 2,
                                  height: 50,
                                  displayValue: true,
                                  font: "monospace",
                                  fontSize: 12,
                                  margin: 5,
                                });
                              } catch (e) {
                                console.error("Error rendering barcode:", e);
                              }
                            }
                          }}
                        ></svg>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setBarcodeText(barcode.text);
                          setBarcodeFormat(barcode.format);
                          setTimeout(() => {
                            const tabsList = document.querySelector('[role="tablist"]');
                            if (tabsList) {
                              const createTab = tabsList.querySelector('[value="create"]');
                              if (createTab) {
                                (createTab as HTMLButtonElement).click();
                              }
                            }
                          }, 100);
                        }}
                      >
                        <QrCode className="h-4 w-4 ml-2" />
                        تحرير وطباعة
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center text-muted-foreground py-8">
                    لا توجد باركودات محفوظة حالياً
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* منطقة الطباعة */}
      <div className="hidden">
        <div ref={printRef} className="barcode-print p-4">
          {barcodeText && (
            <>
              <div className="text-center mb-2">
                <div className="font-bold">{barcodeText}</div>
              </div>
              <svg ref={barcodeRef} className="w-full"></svg>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
