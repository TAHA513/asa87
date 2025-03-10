import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useReactToPrint } from "react-to-print";
import JsBarcode from "jsbarcode";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Barcodes() {
  const [barcode, setBarcode] = useState("");
  const [barcodeSize, setBarcodeSize] = useState("medium");
  const [quantity, setQuantity] = useState(1);
  const [label, setLabel] = useState("");
  const [barcodeType, setBarcodeType] = useState("CODE128");

  const printRef = useRef(null);
  const barcodeRef = useRef(null);

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products").then((res) => res.data),
  });

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const generateBarcode = () => {
    if (!barcode) return;

    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, barcode, {
          format: barcodeType,
          width: barcodeSize === "small" ? 1 : barcodeSize === "medium" ? 2 : 3,
          height: barcodeSize === "small" ? 30 : barcodeSize === "medium" ? 50 : 70,
          displayValue: true,
          text: label || barcode,
          font: "monospace",
          fontSize: 14,
          margin: 10
        });
      } catch (err) {
        console.error("خطأ في إنشاء الباركود:", err);
        alert("خطأ في إنشاء الباركود، تأكد من صحة القيمة المدخلة والنوع المختار.");
      }
    }
  };

  const handleProductSelect = (productId) => {
    if (!productId) return;

    const selectedProduct = products.find(p => p.id.toString() === productId);
    if (selectedProduct) {
      setBarcode(selectedProduct.barcode || "");
      setLabel(selectedProduct.name || "");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center px-4 border-b bg-white">
          <h1 className="text-lg font-semibold">إنشاء وطباعة الباركود</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="create">
            <TabsList className="mb-4">
              <TabsTrigger value="create">إنشاء باركود</TabsTrigger>
              <TabsTrigger value="print">طباعة باركود</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>إنشاء باركود جديد</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="barcode_type">نوع الباركود</Label>
                    <Select value={barcodeType} onValueChange={setBarcodeType}>
                      <SelectTrigger>
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

                  <div className="space-y-2">
                    <Label htmlFor="barcode">قيمة الباركود</Label>
                    <Input
                      id="barcode"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="أدخل قيمة الباركود"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="label">النص</Label>
                    <Input
                      id="label"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="أدخل النص الذي سيظهر تحت الباركود (اختياري)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">الحجم</Label>
                    <Select value={barcodeSize} onValueChange={setBarcodeSize}>
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

                  <Button onClick={generateBarcode} className="w-full">
                    إنشاء الباركود
                  </Button>
                </CardContent>
                <CardFooter className="flex flex-col items-center">
                  <div className="mb-4 p-4 border rounded-md" id="barcode-preview">
                    <svg ref={barcodeRef}></svg>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="print">
              <Card>
                <CardHeader>
                  <CardTitle>طباعة الباركود</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {products && products.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="product">المنتج</Label>
                        <Select onValueChange={handleProductSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر منتج" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quantity">الكمية</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="barcode_size">حجم الباركود</Label>
                        <Select value={barcodeSize} onValueChange={setBarcodeSize}>
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

                      <Button onClick={handlePrint} className="w-full">
                        طباعة الباركود
                      </Button>
                    </>
                  ) : (
                    <p>لا توجد منتجات متاحة. يرجى إضافة منتجات أولاً.</p>
                  )}
                </CardContent>
              </Card>

              {/* مكون الطباعة (مخفي) */}
              <div className="hidden">
                <div ref={printRef} className="p-4">
                  {Array.from({ length: quantity }).map((_, index) => (
                    <div key={index} className="m-2 p-2 border rounded-md text-center">
                      <p>{label}</p>
                      <svg className="mx-auto my-2" ref={(el) => {
                        if (el && barcode) {
                          try {
                            JsBarcode(el, barcode, {
                              format: barcodeType,
                              width: barcodeSize === "small" ? 1 : barcodeSize === "medium" ? 2 : 3,
                              height: barcodeSize === "small" ? 30 : barcodeSize === "medium" ? 50 : 70,
                              displayValue: true,
                              text: label || barcode,
                              font: "monospace",
                              fontSize: 14,
                              margin: 10
                            });
                          } catch (err) {
                            console.error("خطأ في إنشاء الباركود للطباعة:", err);
                          }
                        }
                      }}></svg>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}