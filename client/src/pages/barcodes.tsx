import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Barcode, Printer } from "lucide-react";
import JsBarcode from "jsbarcode";
import { printBarcode } from "@/lib/api";

export default function Barcodes() {
  const { toast } = useToast();
  const [barcodeText, setBarcodeText] = useState("1234567890");
  const [barcodeWidth, setBarcodeWidth] = useState(2);
  const [barcodeHeight, setBarcodeHeight] = useState(100);
  const [barcodeFormat, setBarcodeFormat] = useState<string>("CODE128");
  const barcodeRef = useRef<SVGSVGElement>(null);
  const barcodeContainerRef = useRef<HTMLDivElement>(null);

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
    </div>
  );
}