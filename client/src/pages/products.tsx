import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Barcode } from "@/components/ui/barcode";
import { useForm } from "react-hook-form";
import { useReactToPrint } from 'react-to-print';
import { Printer, QrCode } from "lucide-react";

export default function Products() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [barcode, setBarcode] = useState("");
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">المنتجات</h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 ml-2" />
            طباعة الباركود
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>إضافة منتج جديد</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>إضافة منتج جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 p-4">
                <div className="space-y-2">
                  <Label>اسم المنتج</Label>
                  <Input placeholder="ادخل اسم المنتج" />
                </div>
                <div className="space-y-2">
                  <Label>الباركود</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="ادخل الباركود" 
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                    />
                    <Button 
                      variant="outline"
                      onClick={() => setBarcode(Math.floor(Math.random() * 1000000000000).toString())}
                    >
                      <QrCode className="h-4 w-4 ml-2" />
                      توليد
                    </Button>
                  </div>
                  {barcode && (
                    <div className="mt-4 flex justify-center" ref={printRef}>
                      <Barcode value={barcode} />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>نوع المنتج</Label>
                  <Input placeholder="قطعة" />
                </div>
                <div className="space-y-2">
                  <Label>الكمية</Label>
                  <Input type="number" defaultValue="0" />
                </div>
                <div className="space-y-2">
                  <Label>الحد الأدنى</Label>
                  <Input type="number" defaultValue="0" />
                </div>
                <div className="space-y-2">
                  <Label>تاريخ الإنتاج</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>تاريخ الانتهاء</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>سعر التكلفة</Label>
                  <Input type="number" defaultValue="0" />
                </div>
                <div className="space-y-2">
                  <Label>سعر البيع</Label>
                  <Input type="number" defaultValue="0" />
                </div>
                <Button type="submit" className="w-full">
                  إضافة المنتج
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المنتجات</CardTitle>
        </CardHeader>
        <CardContent>
          <p>لا توجد منتجات حالياً</p>
        </CardContent>
      </Card>
    </div>
  );
}