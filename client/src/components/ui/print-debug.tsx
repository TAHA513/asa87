
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PrintDebugProps {
  onTest: () => void;
}

export function PrintDebug({ onTest }: PrintDebugProps) {
  const [logs, setLogs] = React.useState<string[]>([]);
  
  const handleTest = () => {
    try {
      setLogs(prev => [...prev, "بدء اختبار الطباعة..."]);
      onTest();
      setLogs(prev => [...prev, "تم إكمال اختبار الطباعة بنجاح!"]);
    } catch (error) {
      setLogs(prev => [...prev, `خطأ: ${error instanceof Error ? error.message : String(error)}`]);
      console.error("خطأ في اختبار الطباعة:", error);
    }
  };
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>تشخيص الطباعة</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleTest} variant="outline">اختبار الطباعة</Button>
        
        {logs.length > 0 && (
          <div className="mt-4 p-2 bg-muted rounded-md">
            <h4 className="text-sm font-medium mb-2">سجلات الاختبار:</h4>
            <div className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
              {logs.map((log, i) => (
                <div key={i} className="py-1 border-b border-border last:border-0">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
