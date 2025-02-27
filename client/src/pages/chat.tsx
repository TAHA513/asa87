
import React, { useState } from "react";
import { Sidebar } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // إضافة رسالة المستخدم
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };
    
    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // إرسال الطلب إلى API
      const response = await axios.post("/api/ai/chat", {
        prompt: input,
      });
      
      // إضافة رد المساعد
      if (response.data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.data.message,
          role: "assistant",
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // في حالة حدوث خطأ
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `عذراً، حدث خطأ: ${response.data.message}`,
          role: "assistant",
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      // إضافة رسالة خطأ
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
        role: "assistant",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <div className="flex-1 p-8">
        <Card className="w-full h-[calc(100vh-4rem)] flex flex-col">
          <CardHeader>
            <CardTitle>المساعد الذكي</CardTitle>
            <CardDescription>
              يمكنك التحدث معي حول أي موضوع، وسأحاول مساعدتك قدر الإمكان
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-auto space-y-4 mb-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                <p>ابدأ محادثة جديدة من خلال كتابة رسالة أدناه</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground mr-auto"
                      : "bg-muted ml-auto"
                  }`}
                >
                  <p style={{ whiteSpace: "pre-wrap" }}>{message.content}</p>
                  <div className="text-xs mt-1 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="p-3 rounded-lg bg-muted max-w-[80%] ml-auto">
                <div className="flex items-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>جاري التفكير...</span>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="border-t pt-4">
            <form onSubmit={handleSubmit} className="w-full flex space-x-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 resize-none ml-2"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
          
          <CardFooter className="text-xs text-muted-foreground">
            يعتمد هذا المحادثة على نموذج Hugging Face للذكاء الاصطناعي
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
