import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { ExchangeRate } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ExchangeRateCard() {
  const [newRate, setNewRate] = useState("");
  const { data: exchangeRate } = useQuery<ExchangeRate>({
    queryKey: ["/api/exchange-rate"],
  });

  async function updateRate() {
    if (!newRate) return;
    
    await apiRequest("POST", "/api/exchange-rate", {
      usdToIqd: Number(newRate)
    });
    
    queryClient.invalidateQueries({ queryKey: ["/api/exchange-rate"] });
    setNewRate("");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">سعر صرف الدولار</CardTitle>
        <RefreshCw className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-2xl font-bold">
            1 دولار = {exchangeRate?.usdToIqd} دينار عراقي
          </div>
          <p className="text-xs text-muted-foreground">
            آخر تحديث: {exchangeRate ? new Date(exchangeRate.date).toLocaleString('ar-IQ') : '-'}
          </p>
          
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="أدخل السعر الجديد"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
            />
            <Button onClick={updateRate}>
              تحديث
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
