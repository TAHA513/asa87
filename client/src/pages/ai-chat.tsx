import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import { Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function AiChat() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const response = await fetch("/api/settings/api-keys");
        const data = await response.json();
        setApiKey(data.apiKeys?.groq || "");
      } catch (error) {
        console.error("خطأ في التحقق من مفتاح API:", error);
        setApiKey("");
      }
    };

    checkApiKey();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال نص",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResponse("");

    try {
      const result = await fetch("/api/modify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ request: prompt }),
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.message || "فشل في الاتصال بالخدمة");
      }

      setResponse(data.modifiedCode);
      setPrompt("");

      toast({
        title: "تم!",
        description: "تم استلام الرد بنجاح",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء معالجة الطلب",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Bot className="h-6 w-6" />
            <h1 className="text-3xl font-bold">مساعد تعديل الأكواد</h1>
          </div>

          {!apiKey && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
              <p className="font-bold">تنبيه!</p>
              <p>لم يتم العثور على مفتاح Groq API. يرجى إضافته في صفحة الإعدادات لاستخدام هذه الميزة.</p>
            </div>
          )}

          <div className="grid gap-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <label htmlFor="prompt" className="text-lg font-medium">
                  أدخل طلبك هنا:
                </label>
                <Textarea
                  id="prompt"
                  placeholder="مثال: قم بإضافة تعليقات للكود التالي..."
                  className="min-h-[120px] text-right"
                  dir="rtl"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !prompt.trim() || !apiKey}
              >
                {isLoading ? "جاري المعالجة..." : "إرسال الطلب"}
                <Send className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
              </Button>
            </form>

            {(isLoading || response) && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">الاستجابة:</h2>
                {isLoading ? (
                  <div className="animate-pulse p-4 rounded bg-gray-100 h-32"></div>
                ) : (
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[400px] text-left whitespace-pre-wrap" dir="ltr">
                    {response}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}