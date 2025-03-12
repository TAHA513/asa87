
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button } from './button';
import { Download } from 'lucide-react';

interface ExportToExcelProps {
  data: any[];
  filename?: string;
  buttonText?: string;
  buttonClassName?: string;
}

export const ExportToExcel: React.FC<ExportToExcelProps> = ({
  data,
  filename = 'تقرير',
  buttonText = 'تصدير إلى Excel',
  buttonClassName = '',
}) => {
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // تعديل عرض الأعمدة
    const maxWidth = data.reduce((w, r) => Math.max(w, Object.keys(r).length), 0);
    const colWidths = Array(maxWidth).fill({ wch: 15 });
    worksheet['!cols'] = colWidths;
    
    // تصدير الملف
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className={`gap-2 ${buttonClassName}`}
    >
      <Download className="h-4 w-4" />
      {buttonText}
    </Button>
  );
};

interface ExportToPDFProps {
  data: any[];
  headers?: string[];
  filename?: string;
  title?: string;
  buttonText?: string;
  buttonClassName?: string;
}

export const ExportToPDF: React.FC<ExportToPDFProps> = ({
  data,
  headers = [],
  filename = 'تقرير',
  title = 'تقرير',
  buttonText = 'تصدير إلى PDF',
  buttonClassName = '',
}) => {
  const handleExport = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // إعداد الخط العربي
    doc.addFont('/fonts/cairo-regular.ttf', 'Cairo', 'normal');
    doc.setFont('Cairo');
    doc.setR2L(true); // تفعيل الكتابة من اليمين لليسار

    // إضافة العنوان
    doc.setFontSize(18);
    doc.text(title, doc.internal.pageSize.width / 2, 20, { align: 'center' });
    
    // إضافة التاريخ
    doc.setFontSize(12);
    doc.text(
      `تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-IQ')}`,
      doc.internal.pageSize.width / 2,
      30,
      { align: 'center' }
    );

    // تحويل البيانات إلى تنسيق مناسب للجدول
    const tableHeaders = headers.length > 0 ? headers : Object.keys(data[0] || {});
    const tableData = data.map(row => {
      return headers.length > 0
        ? headers.map(header => (typeof row[header] === 'number' ? row[header].toLocaleString() : row[header]))
        : Object.values(row).map(val => (typeof val === 'number' ? val.toLocaleString() : val));
    });

    // إنشاء الجدول
    (doc as any).autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 40,
      theme: 'grid',
      styles: {
        font: 'Cairo',
        fontSize: 10,
        cellPadding: 5,
        halign: 'right', // محاذاة النص إلى اليمين
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
    });

    // إضافة ترويسة وتذييل الصفحة
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `الصفحة ${i} من ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      doc.text(
        'تم إنشاء هذا التقرير بواسطة نظام SAS للإدارة',
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 5,
        { align: 'center' }
      );
    }

    // حفظ الملف
    doc.save(`${filename}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className={`gap-2 ${buttonClassName}`}
    >
      <Download className="h-4 w-4" />
      {buttonText}
    </Button>
  );
};
