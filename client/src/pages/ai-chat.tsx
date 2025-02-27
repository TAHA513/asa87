
import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function AiChat() {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    try {
      // Add user message to conversation
      const userMessage = { role: "user" as const, content: message };
      setConversation(prev => [...prev, userMessage]);
      setIsLoading(true);
      setMessage("");

      // Send message to API
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "فشل في الاتصال بالذكاء الاصطناعي");
      }

      // Add AI response to conversation
      setConversation(prev => [
        ...prev,
        { role: "assistant", content: data.response }
      ]);
    } catch (error) {
      console.error("Error in AI chat:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء التواصل مع الذكاء الاصطناعي"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-6">
      <div className="grid gap-6">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>المساعد الذكي</CardTitle>
            <CardDescription>استخدم المساعد الذكي للمساعدة في إدارة متجرك والإجابة عن أسئلتك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-[400px] overflow-y-auto border rounded-md p-4">
                {conversation.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    ابدأ محادثة جديدة مع المساعد الذكي
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversation.map((msg, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          msg.role === "user"
                            ? "bg-muted mr-12 text-left"
                            : "bg-primary/10 ml-12 text-right"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !message.trim()}>
                  {isLoading ? "جاري الإرسال..." : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
