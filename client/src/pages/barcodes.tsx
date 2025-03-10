
import { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Printer, DownloadCloud, BarcodeScan } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import JsBarcode from "jsbarcode";

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
}

export default function Barcodes() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [currentBarcode, setCurrentBarcode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [generatedBarcodes, setGeneratedBarcodes] = useState<string[]>([]);
  const printRef = useRef<HTMLDivElement>(null);
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // استدعاء API للحصول على المنتجات
    const fetchProducts = async () => {
      try {
        const data = await api.getProducts();
        if (Array.isArray(data)) {
          setProducts(data);
          setFilteredProducts(data);
        } else {
          console.error("بيانات المنتجات ليست مصفوفة:", data);
          // إذا لم تكن البيانات متاحة، استخدم بيانات تجريبية
          const demoProducts = [
            { id: 1, name: "منتج 1", sku: "SKU001", price: 100 },
            { id: 2, name: "منتج 2", sku: "SKU002", price: 150 },
            { id: 3, name: "منتج 3", sku: "SKU003", price: 200 },
          ];
          setProducts(demoProducts);
          setFilteredProducts(demoProducts);
        }
      } catch (error) {
        console.error("خطأ في جلب المنتجات:", error);
        // استخدام بيانات تجريبية في حالة الخطأ
        const demoProducts = [
          { id: 1, name: "منتج 1", sku: "SKU001", price: 100 },
          { id: 2, name: "منتج 2", sku: "SKU002", price: 150 },
          { id: 3, name: "منتج 3", sku: "SKU003", price: 200 },
        ];
        setProducts(demoProducts);
        setFilteredProducts(demoProducts);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // تطبيق البحث على المنتجات
    if (search.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [search, products]);

  const handleGenerateBarcode = () => {
    if (!currentBarcode) return;
    
    try {
      // إنشاء باركود جديد باستخدام JsBarcode
      if (barcodeCanvasRef.current) {
        JsBarcode(barcodeCanvasRef.current, currentBarcode, {
          format: "CODE128",
          width: 2,
          height: 100,
          displayValue: true,
          fontOptions: "bold",
          fontSize: 16,
          margin: 10
        });
        
        const newBarcodes = Array(quantity).fill(currentBarcode);
        setGeneratedBarcodes([...generatedBarcodes, ...newBarcodes]);
      }
    } catch (error) {
      console.error("خطأ في إنشاء الباركود:", error);
      alert("حدث خطأ في إنشاء الباركود. تأكد من إدخال قيمة صحيحة.");
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: () => {
      // ضمان أن كل الباركودات موجودة في العنصر قبل الطباعة
      if (generatedBarcodes.length === 0) {
        alert("لا توجد باركودات لطباعتها. قم بتوليد الباركودات أولاً.");
        return false;
      }
      return Promise.resolve();
    },
    onAfterPrint: () => {
      console.log("تمت الطباعة بنجاح!");
    },
    removeAfterPrint: false
  });

  const handleSelectProduct = (product: Product) => {
    setCurrentBarcode(product.sku);
    setSelectedProducts([...selectedProducts, product]);
  };

  const clearBarcodes = () => {
    setGeneratedBarcodes([]);
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <BarcodeScan className="h-6 w-6" />
            <h1 className="text-3xl font-bold">إدارة الباركود</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>توليد الباركود</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      رقم الباركود
                    </label>
                    <Input
                      type="text"
                      value={currentBarcode}
                      onChange={(e) => setCurrentBarcode(e.target.value)}
                      placeholder="أدخل رقم الباركود"
                      className="mb-4"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      عدد النسخ
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="mb-4"
                    />
                  </div>

                  <Button 
                    onClick={handleGenerateBarcode} 
                    className="w-full"
                  >
                    توليد الباركود
                  </Button>

                  <div className="mt-4 flex justify-center">
                    <canvas ref={barcodeCanvasRef} className="max-w-full"></canvas>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>المنتجات</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="text"
                  placeholder="بحث عن منتج..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mb-4"
                />

                <div className="h-64 overflow-y-auto border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          اسم المنتج
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SKU
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          إجراء
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                            {product.name}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-gray-500">
                            {product.sku}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-center text-sm">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSelectProduct(product)}
                            >
                              استخدام
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>الباركودات المولدة</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearBarcodes}>
                  مسح الكل
                </Button>
                <Button onClick={handlePrint} className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  طباعة
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                ref={printRef} 
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4"
              >
                {generatedBarcodes.map((barcode, index) => (
                  <div 
                    key={index} 
                    className="border rounded-md p-3 flex flex-col items-center justify-center"
                    style={{ minHeight: "150px" }}
                  >
                    <div className="canvas-container">
                      <canvas className="barcode-canvas" data-value={barcode}></canvas>
                    </div>
                    <div className="mt-2 text-sm text-center">{barcode}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* اسكريبت لتطبيق الباركود على كل العناصر بعد التحديث */}
      <script type="text/javascript" dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            const applyBarcodes = () => {
              document.querySelectorAll('.barcode-canvas').forEach(canvas => {
                const value = canvas.getAttribute('data-value');
                if (value) {
                  JsBarcode(canvas, value, {
                    format: "CODE128",
                    width: 2,
                    height: 100,
                    displayValue: true,
                    fontOptions: "bold",
                    fontSize: 14,
                    margin: 10
                  });
                }
              });
            };
            
            // تطبيق الباركود عند تحميل الصفحة
            applyBarcodes();
            
            // تطبيق الباركود عند تحديث DOM
            const observer = new MutationObserver(applyBarcodes);
            observer.observe(document.body, { childList: true, subtree: true });
          });
        `
      }} />
    </div>
  );
}
