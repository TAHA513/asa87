import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { getApiKeys } from '@/api/settings';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Sidebar from '@/components/layout/sidebar';

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

const AssistantPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'مرحباً، كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: apiKeys } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: getApiKeys,
  });

  const hasHuggingFaceKey = apiKeys?.huggingface?.apiKey;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call API to get response from AI
      if (hasHuggingFaceKey) {
        const response = await fetch('/api/assistant/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: input,
          }),
        });

        const data = await response.json();

        // Add AI response
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.response || 'عذراً، لم أستطع فهم طلبك.',
            timestamp: new Date(),
          },
        ]);
      } else {
        // No API key set
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'لم يتم تكوين مفتاح API للمساعد الذكي. يرجى إضافة مفتاح Hugging Face API في صفحة الإعدادات.',
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">المساعد الذكي</h1>

          {!hasHuggingFaceKey && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>تنبيه</AlertTitle>
              <AlertDescription>
                لم يتم تكوين مفتاح Hugging Face API. توجه إلى صفحة الإعدادات لإضافة المفتاح.
              </AlertDescription>
            </Alert>
          )}

          <Card className="mb-4">
            <CardContent className="p-6">
              <div className="h-[60vh] overflow-y-auto mb-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${
                      message.role === 'assistant' ? 'bg-muted p-3 rounded-lg' : ''
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">
                      {message.role === 'assistant' ? 'المساعد' : 'أنت'}
                    </p>
                    <p>{message.content}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading}
                >
                  {isLoading ? 'جاري الإرسال...' : 'إرسال'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-medium mb-2">كيف يمكن للمساعد الذكي مساعدتك</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>استفسارات عن المنتجات والمخزون</li>
                <li>معلومات عن المبيعات والإيرادات</li>
                <li>نصائح لتحسين أداء المتجر</li>
                <li>المساعدة في حل المشكلات الشائعة</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AssistantPage;