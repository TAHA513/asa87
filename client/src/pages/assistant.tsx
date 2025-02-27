import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

export default function AssistantPage() {
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "حدث خطأ في الاتصال");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تم استلام الرد",
        description: data.response,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    chatMutation.mutate(prompt);
    setPrompt("");
  };

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>المساعد الذكي</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="اكتب سؤالك هنا..."
              className="min-h-[100px]"
            />
            <Button 
              type="submit"
              disabled={chatMutation.isPending}
              className="w-full"
            >
              <Send className="ml-2 h-4 w-4" />
              {chatMutation.isPending ? "جاري المعالجة..." : "إرسال"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}