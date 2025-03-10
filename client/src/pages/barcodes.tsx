import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
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
import { Loader2, Printer, QrCode, Plus, Trash2, RefreshCw } from "lucide-react";
import { useReactToPrint } from 'react-to-print';
import JsBarcode from 'jsbarcode';
import { useToast } from "@/hooks/use-toast";

const BARCODE_TYPES = [
  { value: "CODE128", label: "Code 128" },
  { value: "EAN13", label: "EAN-13" },
  { value: "UPC", label: "UPC" },
  { value: "CODE39", label: "Code 39" },
  { value: "QR", label: "QR Code" },
];

interface BarcodeItem {
  id: string;
  text: string;
  type: string;
  quantity: number;
}

export default function BarcodesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [barcodes, setBarcodes] = useState<BarcodeItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const barcodeRefs = useRef<{ [key: string]: (SVGSVGElement | null)[] }>({});

  useEffect(() => {
    // إضافة باركود افتراضي عند تحميل الصفحة إذا لم يكن هناك أي باركود
    if (barcodes.length === 0) {
      addBarcodeItem();
    }
  }, []);

  const addBarcodeItem = () => {
    const newBarcode: BarcodeItem = {
      id: crypto.randomUUID(),
      text: "",
      type: "CODE128",
      quantity: 1,
    };
    setBarcodes((prev) => [...prev, newBarcode]);
  };

  const updateBarcodeItem = (id: string, updates: Partial<BarcodeItem>) => {
    setBarcodes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeBarcodeItem = (id: string) => {
    setBarcodes((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllBarcodes = () => {
    setBarcodes([]);
    setTimeout(addBarcodeItem, 10);
  };

  const generateBarcodes = () => {
    setIsGenerating(true);
    try {
      // تأكد من وجود باركود واحد على الأقل بنص غير فارغ
      if (!barcodes.some((b) => b.text)) {
        throw new Error("يرجى إدخال نص للباركود أولاً");
      }

      // تنظيف مراجع الباركود وإعادة إنشائها
      setTimeout(() => {
        barcodes.forEach((barcode) => {
          if (barcode.text) {
            // إنشاء مصفوفة فارغة لكل باركود
            barcodeRefs.current[barcode.id] = [];

            // إنشاء الباركود لكل نسخة
            for (let i = 0; i < barcode.quantity; i++) {
              const element = document.getElementById(
                `barcode-${barcode.id}-${i}`
              ) as SVGSVGElement;
              if (element) {
                try {
                  if (barcode.type === "QR") {
                    // لاحقًا يمكن تنفيذ منطق QR code هنا
                    console.log("QR code generation not implemented yet");
                  } else {
                    JsBarcode(element, barcode.text, {
                      format: barcode.type,
                      displayValue: true,
                      lineColor: "#000",
                      width: 2,
                      height: 80,
                      margin: 10,
                    });
                  }
                  // حفظ المرجع
                  barcodeRefs.current[barcode.id][i] = element;
                } catch (innerError) {
                  console.error(
                    "خطأ في إنشاء باركود فردي:",
                    innerError
                  );
                }
              }
            }
          }
        });

        setIsGenerating(false);
        toast({
          title: "تم إنشاء الباركود",
          description: "تم إنشاء الباركود بنجاح",
        });
      }, 100);
    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الباركود",
        variant: "destructive",
      });
      console.error("خطأ في إنشاء الباركود:", error);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: () => {
      // عندما يكون الباركود غير موجود، قد نحتاج لإنشائه
      if (barcodes.some(b => b.text) && !document.getElementById('barcode-' + barcodes[0].id + '-0')?.innerHTML) {
        return new Promise((resolve) => {
          generateBarcodes();
          setTimeout(resolve, 800);
        });
      }
      return Promise.resolve();
    },
    removeAfterPrint: false,
    copyStyles: true,
    documentTitle: "الباركود المطبوع",
    pageStyle: `
      @page {
        size: auto;
        margin: 10mm;
      }
      @media print {
        html, body {
          height: 100%;
          margin: 0 !important;
          padding: 0 !important;
        }
        .print-container {
          break-inside: avoid;
          page-break-inside: avoid;
        }
      }
    `,
  });

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-none border-r border-border">
        <SidebarProvider>
          <Sidebar />
        </SidebarProvider>
      </div>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h2 className="text-3xl font-bold">إنشاء الباركود</h2>
            <p className="text-muted-foreground">
              إنشاء وطباعة الباركود للمنتجات والعناصر
            </p>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>إنشاء باركود جديد</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearAllBarcodes}>
                  <RefreshCw className="h-4 w-4 ml-2" />
                  مسح الكل
                </Button>
                <Button onClick={addBarcodeItem}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة باركود
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {barcodes.map((barcode) => (
                  <div key={barcode.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-card">
                    <div>
                      <label className="text-sm font-medium">نوع الباركود</label>
                      <Select
                        value={barcode.type}
                        onValueChange={(value) =>
                          updateBarcodeItem(barcode.id, { type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع الباركود" />
                        </SelectTrigger>
                        <SelectContent>
                          {BARCODE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">النص</label>
                      <Input
                        value={barcode.text}
                        onChange={(e) =>
                          updateBarcodeItem(barcode.id, {
                            text: e.target.value,
                          })
                        }
                        placeholder="أدخل النص أو الرقم"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">عدد النسخ</label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={barcode.quantity}
                        onChange={(e) =>
                          updateBarcodeItem(barcode.id, {
                            quantity: Number(e.target.value),
                          })
                        }
                        placeholder="عدد النسخ المطلوبة"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeBarcodeItem(barcode.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={generateBarcodes}
                  disabled={
                    barcodes.length === 0 ||
                    isGenerating ||
                    !barcodes.some((b) => b.text)
                  }
                >
                  {isGenerating && (
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  )}
                  <QrCode className="h-4 w-4 ml-2" />
                  إنشاء الباركود
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  disabled={
                    barcodes.length === 0 ||
                    isGenerating ||
                    !barcodes.some((b) => b.text)
                  }
                >
                  <Printer className="h-4 w-4 ml-2" />
                  طباعة
                </Button>
              </div>

              <div id="print-content" ref={printRef} className="mt-6 p-4 border rounded-lg print-container">
                <h3 className="text-lg font-bold mb-4 text-center print:block">الباركود المطبوع</h3>
                {barcodes.map((barcode) => (
                  barcode.text ? (
                    <div key={barcode.id} className="mb-6">
                      <div className="mb-2 font-medium">{barcode.text}</div>
                      <div className="print-grid grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Array.from({ length: barcode.quantity }).map((_, index) => (
                          <div key={index} className="print-item border p-4 rounded print:border-none text-center">
                            <svg
                              id={`barcode-${barcode.id}-${index}`}
                              className="w-full mx-auto"
                            ></svg>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

<style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container,
          .print-container * {
            visibility: visible;
            position: relative;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
          }
          .no-print {
            display: none !important;
          }
          }
        }

        .barcode-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .barcode-item {
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
      `}</style>