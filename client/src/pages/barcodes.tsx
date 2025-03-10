import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Barcode, Printer, Download, Trash2, Plus, CheckCircle, Save } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReactToPrint } from "react-to-print";
import JsBarcode from "jsbarcode";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface BarcodeItem {
  id: string;
  value: string;
  format: string;
  width: number;
  height: number;
  label: string;
  createdAt: Date; // Added createdAt property
}

export default function Barcodes() {
  const { toast } = useToast();
  const [barcodeText, setBarcodeText] = useState("1234567890");
  const [barcodeLabel, setBarcodeLabel] = useState("");
  const [barcodeWidth, setBarcodeWidth] = useState(2);
  const [barcodeHeight, setBarcodeHeight] = useState(100);
  const [barcodeFormat, setBarcodeFormat] = useState<string>("CODE128");
  const barcodeRef = useRef<SVGSVGElement>(null);
  const barcodeContainerRef = useRef<HTMLDivElement>(null);
  const multiplePrintRef = useRef<HTMLDivElement>(null);
  const [barcodeList, setBarcodeList] = useState<BarcodeItem[]>([]);
  const [selectedBarcodes, setSelectedBarcodes] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState("create");
  const [searchValue, setSearchValue] = useState("");
  const [filterFormat, setFilterFormat] = useState<string>("");

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
      toast({
        title: "خطأ في التنزيل",
        description: "حدث خطأ أثناء محاولة تنزيل الصورة",
        variant: "destructive",
      });
    }
  };

  // إضافة باركود إلى القائمة
  const addToList = () => {
    if (barcodeText.trim() === "") {
      toast({
        title: "خطأ في الإضافة",
        description: "يجب إدخال قيمة للباركود",
        variant: "destructive",
      });
      return;
    }

    const newBarcode: BarcodeItem = {
      id: Date.now().toString(),
      value: barcodeText,
      format: barcodeFormat,
      width: barcodeWidth,
      height: barcodeHeight,
      label: barcodeLabel || barcodeText,
      createdAt: new Date() // Added createdAt timestamp
    };

    setBarcodeList(prev => [...prev, newBarcode]);
    setSelectedBarcodes(prev => [...prev, newBarcode.id]);

    toast({
      title: "تمت الإضافة",
      description: "تم إضافة الباركود إلى القائمة",
    });

    // تغيير التبويب إلى قائمة الباركودات
    setCurrentTab("list");
  };

  // حذف باركود من القائمة
  const removeFromList = (id: string) => {
    setBarcodeList(prev => prev.filter(item => item.id !== id));
    setSelectedBarcodes(prev => prev.filter(itemId => itemId !== id));

    toast({
      title: "تم الحذف",
      description: "تم حذف الباركود من القائمة",
    });
  };

  // تحديد/إلغاء تحديد باركود
  const toggleSelectBarcode = (id: string) => {
    setSelectedBarcodes(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  // تحديد كل الباركودات
  const selectAllBarcodes = () => {
    if (selectedBarcodes.length === filteredBarcodes.length) {
      setSelectedBarcodes([]);
    } else {
      setSelectedBarcodes(filteredBarcodes.map(item => item.id));
    }
  };

  // طباعة الباركودات المحددة
  const handlePrintSelected = useReactToPrint({
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
          const barcodeElements = multiplePrintRef.current?.querySelectorAll('svg');
          if (barcodeElements) {
            barcodeElements.forEach((svg, index) => {
              // الحصول على الباركود المناسب من القائمة المحددة
              const selectedBarcodeId = selectedBarcodes[index];
              const item = barcodeList.find(item => item.id === selectedBarcodeId);

              if (item && svg instanceof SVGElement) {
                try {
                  JsBarcode(svg, item.value, {
                    format: item.format,
                    width: item.width,
                    height: item.height,
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
          resolve(true);
        }, 500);
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

  // طباعة باركود واحد
  const handlePrintSingle = useReactToPrint({
    content: () => barcodeContainerRef.current,
    onAfterPrint: () => {
      toast({
        title: "تمت الطباعة",
        description: "تمت طباعة الباركود بنجاح",
      });
    },
  });

  // حفظ الباركودات في localStorage
  const saveBarcodesToLocalStorage = () => {
    try {
      localStorage.setItem('savedBarcodes', JSON.stringify(barcodeList));
      toast({
        title: "تم الحفظ",
        description: "تم حفظ قائمة الباركودات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء محاولة حفظ الباركودات",
        variant: "destructive",
      });
    }
  };

  // استرجاع الباركودات من localStorage
  useEffect(() => {
    try {
      const savedBarcodes = localStorage.getItem('savedBarcodes');
      if (savedBarcodes) {
        setBarcodeList(JSON.parse(savedBarcodes));
      }
    } catch (error) {
      console.error("خطأ في استرجاع الباركودات المحفوظة:", error);
    }
  }, []);

  // تصفية الباركودات حسب البحث والفلتر
  const filteredBarcodes = barcodeList.filter(barcode => {
    const matchesSearch = searchValue === '' || 
      barcode.value.toLowerCase().includes(searchValue.toLowerCase()) || 
      (barcode.label && barcode.label.toLowerCase().includes(searchValue.toLowerCase()));

    const matchesFormat = filterFormat === '' || barcode.format === filterFormat;

    return matchesSearch && matchesFormat;
  });

  // عرض معاينة الباركودات في الجدول
  useEffect(() => {
    const previewBarcodes = document.querySelectorAll('.preview-barcode');
    if (previewBarcodes.length > 0) {
      previewBarcodes.forEach(svg => {
        if (svg instanceof SVGElement) {
          const value = svg.getAttribute('data-barcode-value');
          const format = svg.getAttribute('data-barcode-format');
          if (value && format) {
            try {
              JsBarcode(svg, value, {
                format: format,
                width: 1.5,
                height: 40,
                displayValue: false,
                margin: 0,
              });
            } catch (error) {
              console.error("خطأ في معاينة الباركود:", error);
            }
          }
        }
      });
    }
  }, [filteredBarcodes]);


  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Barcode className="ml-2 rtl:mr-2" />
        إنشاء وطباعة الباركودات
      </h1>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="text-lg">إنشاء باركود</TabsTrigger>
          <TabsTrigger value="list" className="text-lg">قائمة الباركودات <span className="bg-primary text-white rounded-full px-2 py-0.5 text-xs ml-2">{barcodeList.length}</span></TabsTrigger>
        </TabsList>

        {/* تبويب إنشاء باركود جديد */}
        <TabsContent value="create">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <span className="flex items-center">
                      <Barcode className="ml-2 rtl:mr-2" size={18} />
                      خيارات الباركود
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="barcodeText">قيمة الباركود</Label>
                    <Input
                      id="barcodeText"
                      value={barcodeText}
                      onChange={(e) => setBarcodeText(e.target.value)}
                      placeholder="أدخل النص أو الرقم للباركود"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barcodeLabel">وصف الباركود (اختياري)</Label>
                    <Input
                      id="barcodeLabel"
                      value={barcodeLabel}
                      onChange={(e) => setBarcodeLabel(e.target.value)}
                      placeholder="وصف يظهر مع الباركود"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barcodeFormat">نوع الباركود</Label>
                    <Select value={barcodeFormat} onValueChange={setBarcodeFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الباركود" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CODE128">CODE128 (الافتراضي)</SelectItem>
                        <SelectItem value="EAN13">EAN-13</SelectItem>
                        <SelectItem value="EAN8">EAN-8</SelectItem>
                        <SelectItem value="UPC">UPC</SelectItem>
                        <SelectItem value="CODE39">CODE39</SelectItem>
                        <SelectItem value="ITF14">ITF-14</SelectItem>
                      </SelectContent>
                    </Select>
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
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <Button onClick={handlePrintSingle} variant="outline" className="flex-1">
                    <Printer className="ml-2 rtl:mr-2" size={16} />
                    طباعة
                  </Button>
                  <Button onClick={handleDownload} variant="outline" className="flex-1">
                    <Download className="ml-2 rtl:mr-2" size={16} />
                    تنزيل
                  </Button>
                  <Button onClick={addToList} className="flex-1">
                    <Plus className="ml-2 rtl:mr-2" size={16} />
                    إضافة للقائمة
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>معاينة الباركود</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    ref={barcodeContainerRef}
                    className="flex flex-col justify-center items-center bg-white border rounded-md p-6 min-h-[300px]"
                  >
                    <svg ref={barcodeRef} className="w-full mb-4"></svg>
                    {barcodeLabel && <div className="text-center font-semibold mt-4">{barcodeLabel}</div>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* تبويب قائمة الباركودات */}
        <TabsContent value="list">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>قائمة الباركودات المحفوظة</CardTitle>
              <div className="flex space-x-2 rtl:space-x-reverse">
                {barcodeList.length > 0 && (
                  <>
                    <Button onClick={handlePrintSelected} disabled={selectedBarcodes.length === 0} variant="outline">
                      <Printer className="ml-2 rtl:mr-2" size={16} />
                      طباعة المحدد ({selectedBarcodes.length})
                    </Button>
                    <Button onClick={saveBarcodesToLocalStorage} variant="outline">
                      <Save className="ml-2 rtl:mr-2" size={16} />
                      حفظ القائمة
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {barcodeList.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Barcode className="mx-auto mb-4 text-muted-foreground" size={40} />
                  <p>لم تتم إضافة أي باركود للقائمة بعد</p>
                  <Button onClick={() => setCurrentTab('create')} variant="outline" className="mt-4">
                    <Plus className="ml-2 rtl:mr-2" size={16} />
                    إنشاء باركود جديد
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Input 
                        placeholder="بحث عن باركود..." 
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                      />
                    </div>
                    <div className="w-full md:w-64">
                      <Select value={filterFormat} onValueChange={setFilterFormat}>
                        <SelectTrigger>
                          <SelectValue placeholder="فلترة حسب النوع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">كل الأنواع</SelectItem>
                          <SelectItem value="CODE128">CODE128</SelectItem>
                          <SelectItem value="EAN13">EAN-13</SelectItem>
                          <SelectItem value="EAN8">EAN-8</SelectItem>
                          <SelectItem value="UPC">UPC</SelectItem>
                          <SelectItem value="CODE39">CODE39</SelectItem>
                          <SelectItem value="ITF14">ITF-14</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox 
                              checked={selectedBarcodes.length === filteredBarcodes.length && filteredBarcodes.length > 0} 
                              onCheckedChange={selectAllBarcodes} 
                            />
                          </TableHead>
                          <TableHead>قيمة الباركود</TableHead>
                          <TableHead>الوصف</TableHead>
                          <TableHead>النوع</TableHead>
                          <TableHead>الأبعاد</TableHead>
                          <TableHead>معاينة</TableHead>
                          <TableHead>تاريخ الإنشاء</TableHead>
                          <TableHead>إجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBarcodes.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                              لا توجد نتائج مطابقة لعملية البحث
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredBarcodes.map((barcode) => (
                            <TableRow key={barcode.id}>
                              <TableCell>
                                <Checkbox 
                                  checked={selectedBarcodes.includes(barcode.id)} 
                                  onCheckedChange={() => toggleSelectBarcode(barcode.id)} 
                                />
                              </TableCell>
                              <TableCell className="font-mono">{barcode.value}</TableCell>
                              <TableCell>{barcode.label || '-'}</TableCell>
                              <TableCell>{barcode.format}</TableCell>
                              <TableCell>
                                {barcode.width} × {barcode.height}
                              </TableCell>
                              <TableCell>
                                <div className="w-[100px] h-[50px] overflow-hidden flex items-center justify-center">
                                  <svg className="preview-barcode" data-barcode-value={barcode.value} data-barcode-format={barcode.format}></svg>
                                </div>
                              </TableCell>
                              <TableCell>
                                {barcode.createdAt.toLocaleDateString('ar-AE')}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => removeFromList(barcode.id)}>
                                  <Trash2 className="text-destructive" size={16} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* رؤية الطباعة للباركودات المحددة */}
          <div className="hidden">
            <div ref={multiplePrintRef} className="p-4 grid grid-cols-2 gap-4 print-container">
              {selectedBarcodes.map((barcodeId) => {
                const item = barcodeList.find((item) => item.id === barcodeId);
                return item ? (
                  <div key={item.id} className="barcode-item my-4 p-4 border rounded-lg">
                    <svg className="barcode-svg w-full"></svg>
                    {item.label && <div className="barcode-label mt-2 text-center font-semibold">{item.label}</div>}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}