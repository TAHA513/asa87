import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsSocket } from "@/lib/websocket";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

interface LiveUpdate {
  platform: string;
  type: "impression" | "click" | "conversion";
  timestamp: string;
}

export default function LiveUpdates() {
  const [updates, setUpdates] = useState<LiveUpdate[]>([]);

  useEffect(() => {
    const unsubscribe = analyticsSocket.subscribe((data) => {
      setUpdates((prev) => [data, ...prev].slice(0, 5));
    });

    // إرجاع دالة التنظيف
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          التحديثات المباشرة
          <Badge variant="secondary" className="ml-2">
            مباشر
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {updates.map((update, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-sm"
            >
              <span>
                {update.type === "impression"
                  ? "مشاهدة جديدة"
                  : update.type === "click"
                  ? "نقرة جديدة"
                  : "تحويل جديد"}{" "}
                على {update.platform}
              </span>
              <span className="text-muted-foreground">
                {new Date(update.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}