import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
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
import { Loader2, Printer, QrCode } from "lucide-react";
import { useReactToPrint } from 'react-to-print';
import JsBarcode from 'jsbarcode';

const BARCODE_TYPES = [
  { value: "CODE128", label: "Code 128" },
  { value: "EAN13", label: "EAN-13" },
  { value: "UPC", label: "UPC" },
  { value: "CODE39", label: "Code 39" },
];

export default function BarcodesPage() {
  const { user } = useAuth();
  const [barcodeText, setBarcodeText] = useState("");
  const [barcodeType, setBarcodeType] = useState("CODE128");
  const [isGenerating, setIsGenerating] = useState(false);
  const barcodeRef = useRef<SVGSVGElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const generateBarcode = () => {
    if (!barcodeRef.current || !barcodeText) return;
    
    setIsGenerating(true);
    try {
      JsBarcode(barcodeRef.current, barcodeText, {
        format: barcodeType,
        width: 2,
        height: 100,
        displayValue: true,
        font: "monospace",
        fontSize: 16,
        margin: 10,
      });
    } catch (error) {
      console.error("خطأ في إنشاء الباركود:", error);
    }
    setIsGenerating(false);
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h2 className="text-3xl font-bold">إنشاء الباركود</h2>
            <p className="text-muted-foreground">
              إنشاء وطباعة الباركود للمنتجات والعناصر
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>إنشاء باركود جديد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">نوع الباركود</label>
                  <Select
                    value={barcodeType}
                    onValueChange={setBarcodeType}
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">النص</label>
                  <Input
                    value={barcodeText}
                    onChange={(e) => setBarcodeText(e.target.value)}
                    placeholder="أدخل النص أو الرقم"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={generateBarcode} disabled={!barcodeText || isGenerating}>
                  {isGenerating && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                  <QrCode className="h-4 w-4 ml-2" />
                  إنشاء الباركود
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="h-4 w-4 ml-2" />
                  طباعة
                </Button>
              </div>

              <div ref={printRef} className="mt-6 p-4 border rounded-lg">
                <svg ref={barcodeRef} className="w-full"></svg>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
