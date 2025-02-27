
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'حدث خطأ في الاتصال');
      }

      setResponse(data.response);
    } catch (error) {
      console.error('خطأ في إرسال الرسالة:', error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : 'فشل في إرسال الرسالة',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10 mx-auto">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>الدردشة الذكية</CardTitle>
          <CardDescription>
            تحدث مع الذكاء الاصطناعي من Hugging Face
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {response && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap">{response}</p>
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              className="flex-1 ml-2"
            />
            <Button type="submit" disabled={loading || !message.trim()}>
              {loading ? "جاري الإرسال..." : "إرسال"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          يعتمد هذا المحادثة على نموذج Hugging Face للذكاء الاصطناعي
        </CardFooter>
          يعتمد هذا المحادثة على نموذج Hugging Face للذكاء الاصطناعي
        </CardFooter>
      </Card>
    </div>
  );
}
