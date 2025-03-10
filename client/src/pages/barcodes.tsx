import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Barcode, Printer } from "lucide-react";
import JsBarcode from "jsbarcode";
import { printBarcode } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox"; // Added import for Checkbox
import { useReactToPrint } from "react-to-print";


export default function Barcodes() {
  const { toast } = useToast();
  const [barcodeText, setBarcodeText] = useState("1234567890");
  const [barcodeWidth, setBarcodeWidth] = useState(2);
  const [barcodeHeight, setBarcodeHeight] = useState(100);
  const [barcodeFormat, setBarcodeFormat] = useState<string>("CODE128");
  const barcodeRef = useRef<SVGSVGElement>(null);
  const barcodeContainerRef = useRef<HTMLDivElement>(null);
  const multiplePrintRef = useRef<HTMLDivElement>(null); // Added ref for multiple print
  const [barcodeList, setBarcodeList] = useState<BarcodeItem[]>([]); // Added state for barcode list
  const [selectedBarcodes, setSelectedBarcodes] = useState<string[]>([]); // Added state for selected barcodes

  interface BarcodeItem {
    id: string;
    value: string;
    image: string;
  }


// أنماط الطباعة
  useEffect(() => {
    // إضافة أنماط الطباعة كعنصر style
    const printStyles = document.createElement('style');
    printStyles.innerHTML = `
      @media print {
        .barcode-item {
          page-break-inside: avoid;
          margin: 20mm 0;
          text-align: center;
        }
        
        .print-container {
          display: block !important;
        }
        
        @page {
          size: A4;
          margin: 10mm;
        }
      }
    `;
    document.head.appendChild(printStyles);
    
    // تنظيف عند إزالة المكون
    return () => {
      document.head.removeChild(printStyles);
    };
  }, []);

  // توليد الباركود عند تغيير أي من الخيارات
  useEffect(() => {
    renderBarcode();
  }, [barcodeText, barcodeWidth, barcodeHeight, barcodeFormat]);

  // وظيفة لتوليد الباركود
  const renderBarcode = () => {
    if (barcodeRef.current && barcodeText.trim() !== "") {
      try {
        JsBarcode(barcodeRef.current, barcodeText, {
          format: barcodeFormat,
          width: barcodeWidth,
          height: barcodeHeight,
          displayValue: true,
          fontSize: 18,
          margin: 10,
          background: "#ffffff",
          lineColor: "#000000",
        });
      } catch (error) {
        console.error("خطأ في توليد الباركود:", error);
        toast({
          title: "خطأ في توليد الباركود",
          description: "تأكد من صحة النص المدخل وتنسيق الباركود",
          variant: "destructive",
        });
      }
    }
  };

  // وظيفة للطباعة
  const handlePrint = async () => {
    if (!barcodeContainerRef.current) {
      toast({
        title: "خطأ في الطباعة",
        description: "لم يتم العثور على المحتوى للطباعة",
        variant: "destructive",
      });
      return;
    }

    try {
      await printBarcode(barcodeContainerRef.current);
      toast({
        title: "تمت العملية بنجاح",
        description: "تم إرسال الباركود للطباعة",
      });
    } catch (error) {
      toast({
        title: "خطأ في الطباعة",
        description: "حدث خطأ أثناء محاولة الطباعة",
        variant: "destructive",
      });
    }
  };

  // وظيفة لتنزيل الباركود كصورة
  const handleDownload = () => {
    if (!barcodeRef.current) return;

    try {
      // تحويل SVG إلى Data URL
      const svgData = new XMLSerializer().serializeToString(barcodeRef.current);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // إنشاء صورة من SVG
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        // تنزيل الصورة
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `barcode-${barcodeText}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();

        toast({
          title: "تمت العملية بنجاح",
          description: "تم تنزيل الباركود كصورة",
        });
      };

      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    } catch (error) {
      console.error("خطأ في تنزيل الباركود:", error);
      toast({
        title: "خطأ في التنزيل",
        description: "حدث خطأ أثناء محاولة تنزيل الباركود",
        variant: "destructive",
      });
    }
  };

  const addToList = () => {
    if (!barcodeRef.current || barcodeText.trim() === "") return;

    const svgData = new XMLSerializer().serializeToString(barcodeRef.current);
    const newItem: BarcodeItem = {
      id: Date.now().toString(),
      value: barcodeText,
      image: `data:image/svg+xml;base64,${btoa(svgData)}`
    };

    setBarcodeList(prev => [...prev, newItem]);
    setSelectedBarcodes(prev => [...prev, newItem.id]);
  };

  const handleMultiplePrint = useReactToPrint({
    content: () => multiplePrintRef.current,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        if (!multiplePrintRef.current || selectedBarcodes.length === 0) {
          toast({
            title: "خطأ في الطباعة",
            description: "لم يتم تحديد أي باركود للطباعة",
            variant: "destructive",
          });
          resolve(false);
          return;
        }

        // تهيئة الباركودات للطباعة
        setTimeout(() => {
          // إنشاء باركود لكل عنصر محدد
          selectedBarcodes.forEach(barcodeId => {
            const svg = document.getElementById(`printBarcode-${barcodeId}`);
            const item = barcodeList.find(item => item.id === barcodeId);
            
            if (item && svg instanceof SVGElement) {
              try {
                JsBarcode(svg, item.value, {
                  format: barcodeFormat,
                  width: barcodeWidth,
                  height: barcodeHeight,
                  displayValue: true,
                  font: "monospace",
                  fontSize: 12,
                  margin: 5,
                });
              } catch (error) {
                console.error(`خطأ في إنشاء الباركود: ${error}`);
              }
            }
          });
              }
            }); // End of forEach
          };
          resolve(true);
        }, 300); // زيادة التأخير لإعطاء وقت كافي لتهيئة العناصر
      });
    },
    onAfterPrint: () => {
      toast({
        title: "تمت الطباعة",
        description: `تمت طباعة ${selectedBarcodes.length} باركود بنجاح`,
      });
    },
    pageStyle: `
      @page {
        margin: 10mm;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .barcode-item {
          page-break-inside: avoid;
          margin-bottom: 10mm;
        }
        .print-container {
          display: block !important;
        }
      }
    `,
  });


  const removeFromList = (id: string) => {
    setBarcodeList(prev => prev.filter(item => item.id !== id));
    setSelectedBarcodes(prev => prev.filter(itemId => itemId !== id));
  };

  const toggleSelectBarcode = (id: string) => {
    setSelectedBarcodes(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">إنشاء وطباعة الباركود</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>خيارات الباركود</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barcodeText">نص الباركود</Label>
              <Input
                id="barcodeText"
                value={barcodeText}
                onChange={(e) => setBarcodeText(e.target.value)}
                placeholder="أدخل النص أو الرقم للباركود"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcodeFormat">تنسيق الباركود</Label>
              <select
                id="barcodeFormat"
                className="w-full p-2 border rounded-md"
                value={barcodeFormat}
                onChange={(e) => setBarcodeFormat(e.target.value)}
              >
                <option value="CODE128">CODE128 (الافتراضي)</option>
                <option value="EAN13">EAN-13</option>
                <option value="EAN8">EAN-8</option>
                <option value="UPC">UPC</option>
                <option value="CODE39">CODE39</option>
                <option value="ITF14">ITF-14</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="barcodeWidth">عرض الخط</Label>
                <Input
                  id="barcodeWidth"
                  type="number"
                  min="1"
                  max="10"
                  value={barcodeWidth}
                  onChange={(e) => setBarcodeWidth(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcodeHeight">ارتفاع الباركود</Label>
                <Input
                  id="barcodeHeight"
                  type="number"
                  min="50"
                  max="200"
                  value={barcodeHeight}
                  onChange={(e) => setBarcodeHeight(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex space-x-4 rtl:space-x-reverse">
              <Button
                onClick={handlePrint}
                className="flex-1"
              >
                <Printer className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                طباعة
              </Button>

              <Button
                onClick={handleDownload}
                variant="secondary"
                className="flex-1"
              >
                <Barcode className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                تنزيل
              </Button>
              <Button onClick={addToList} className="flex-1">
                إضافة إلى القائمة
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معاينة الباركود</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={barcodeContainerRef}
              className="flex justify-center items-center p-4 bg-white border rounded-md min-h-[200px]"
            >
              <svg ref={barcodeRef} className="w-full"></svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قسم الطباعة المتعددة */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>طباعة مجموعة باركودات</CardTitle>
        </CardHeader>
        <CardContent>
          {barcodeList.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              لم تتم إضافة أي باركود إلى القائمة بعد
            </p>
          ) : (
            <>
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-2">تحديد</th>
                      <th className="text-right p-2">قيمة الباركود</th>
                      <th className="text-right p-2">معاينة</th>
                      <th className="text-right p-2">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {barcodeList.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2">
                          <Checkbox
                            checked={selectedBarcodes.includes(item.id)}
                            onCheckedChange={() => toggleSelectBarcode(item.id)}
                          />
                        </td>
                        <td className="p-2">{item.value}</td>
                        <td className="p-2">
                          <img src={item.image} alt={item.value} className="h-12" />
                        </td>
                        <td className="p-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFromList(item.id)}
                          >
                            {/* <TrashIcon className="w-4 h-4" /> */}
                            حذف
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button
                onClick={handleMultiplePrint}
                disabled={selectedBarcodes.length === 0}
                className="w-full"
              >
                {/* <PrinterIcon className="w-5 h-5 ml-2" /> */}
                طباعة الباركودات المحددة ({selectedBarcodes.length})
              </Button>

              <div style={{ display: 'none' }}>
                <div ref={multiplePrintRef} className="print-container">
                  {selectedBarcodes.map((id) => {
                    const barcode = barcodeList.find((item) => item.id === id);
                    return barcode ? (
                      <div key={id} className="barcode-item my-8 text-center">
                        <div className="text-center mb-4">طباعة الباركود</div>
                        <div className="value mb-2">{barcode.value}</div>
                        <svg id={`printBarcode-${id}`} className="w-full h-auto"></svg>
                      </div>
                    ) : null;
                  })}
                </div>ssName="grid grid-cols-2 gap-8">
                    {selectedBarcodes.map((barcodeId) => {
                      const item = barcodeList.find(item => item.id === barcodeId);
                      return item ? (
                        <div key={item.id} className="barcode-item flex flex-col items-center p-4 border rounded">
                          <p className="mb-2 font-bold text-lg">{item.value}</p>
                          <svg className="w-full h-auto" id={`print-barcode-${item.id}`}></svg>
                          <p className="mt-2 text-sm text-muted-foreground">{item.description || ""}</p>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}