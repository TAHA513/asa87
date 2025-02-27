import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, SendIcon, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AiChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("llama3-8b-8192");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const models = [
    { value: "llama3-8b-8192", label: "Llama 3 8B" },
    { value: "llama3-70b-8192", label: "Llama 3 70B" },
    { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
    { value: "gemma-7b-it", label: "Gemma 7B" }
  ];

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    // طلب التأكد من تكوين المفتاح عند تحميل الصفحة
    const checkApiKey = async () => {
      try {
        const response = await apiRequest("/api/settings/api-keys", {
          method: "GET"
        });

        const data = await response.json();
        if (!data?.groq?.apiKey) {
          toast({
            title: "تنبيه",
            description: "تحتاج إلى إعداد مفتاح Groq API للاستخدام الكامل للدردشة",
            variant: "warning"
          });
        }
      } catch (error) {
        console.error("خطأ في التحقق من مفتاح API:", error);
      }
    };

    checkApiKey();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // إضافة رسالة المستخدم
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // إرسال الرسالة إلى الـ API
      const response = await apiRequest("/api/ai/chat", {
        method: "POST",
        body: {
          message: inputMessage,
          model: selectedModel
        }
      });

      const data = await response.json();

      // إضافة رد المساعد
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الدردشة مع المساعد",
        variant: "destructive"
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
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">الدردشة مع Groq AI</h1>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot size={20} />
                المساعد الذكي
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-grow">
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النموذج" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map(model => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ScrollArea ref={scrollAreaRef} className="h-[500px] pr-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Bot size={50} />
                    <p className="mt-4">أرسل رسالة للبدء في الدردشة مع المساعد الذكي</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {messages.map(message => (
                      <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className="flex items-start gap-3 max-w-[80%]">
                          {message.role === "assistant" && (
                            <Avatar className="mt-1">
                              <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`rounded-lg p-3 ${
                            message.role === "user" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted"
                          }`}>
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          </div>
                          {message.role === "user" && (
                            <Avatar className="mt-1">
                              <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="flex items-start gap-3 max-w-[80%]">
                          <Avatar className="mt-1">
                            <AvatarFallback>AI</AvatarFallback>
                          </Avatar>
                          <div className="rounded-lg p-3 bg-muted">
                            <Loader2 className="animate-spin h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>

            <CardFooter>
              <div className="flex w-full gap-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  className="flex-grow resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !inputMessage.trim()}
                  variant="default"
                >
                  {isLoading ? 
                    <Loader2 className="h-4 w-4 animate-spin" /> : 
                    <SendIcon className="h-4 w-4" />
                  }
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}