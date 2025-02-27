
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ message: string }>();

  const onSubmit = async (data: { message: string }) => {
    if (!data.message.trim()) return;

    // إضافة رسالة المستخدم
    const userMessage: Message = { role: "user", content: data.message };
    setMessages((prev) => [...prev, userMessage]);
    
    // إعادة تعيين نموذج الإدخال
    reset();
    
    try {
      setLoading(true);
      
      // إرسال الرسالة إلى الواجهة الخلفية
      const response = await axios.post("/api/chat", { message: data.message });
      
      // إضافة رد المساعد
      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.response,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("خطأ في إرسال الرسالة:", error);
      
      // إضافة رسالة خطأ
      const errorMessage: Message = {
        role: "assistant",
        content: "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.",
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>الدردشة الذكية</CardTitle>
          <CardDescription>
            تحدث مع مساعدنا الذكي المدعوم بتقنية Hugging Face
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto p-1">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                ابدأ محادثة جديدة بإرسال رسالة...
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-2 bg-muted flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  <span>جاري التفكير...</span>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-2 space-x-reverse">
            <Input
              {...register("message")}
              placeholder="اكتب رسالتك هنا..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          يعتمد هذا المحادثة على نموذج Hugging Face للذكاء الاصطناعي
        </CardFooter>
      </Card>
    </div>
  );
}
