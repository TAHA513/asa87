
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getApiKeys } from '@/api/settings';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Sidebar from '@/components/sidebar';

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'مرحباً! أنا المساعد الذكي الخاص بإدارة متجرك. كيف يمكنني مساعدتك اليوم؟',
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

  const hasHuggingFaceKey = apiKeys?.huggingFaceApiKey;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        // Actual API call would go here
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
            content: data.response || 'عذراً، حدث خطأ في معالجة طلبك.',
            timestamp: new Date(),
          },
        ]);
      } else {
        // If no API key, simulate response
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: 'لم يتم تكوين مفتاح API الخاص بهاغينغ فيس. يرجى إضافة المفتاح في صفحة الإعدادات.',
              timestamp: new Date(),
            },
          ]);
          setIsLoading(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'عذراً، حدث خطأ أثناء محاولة الاتصال بالخدمة. يرجى المحاولة مرة أخرى.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">المساعد الذكي</h1>
          
          {!hasHuggingFaceKey && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>تنبيه</AlertTitle>
              <AlertDescription>
                لم يتم تكوين مفتاح API الخاص بهاغينغ فيس. يرجى إضافة المفتاح في{' '}
                <a href="/settings" className="underline">صفحة الإعدادات</a>.
              </AlertDescription>
            </Alert>
          )}
          
          <Card className="mb-4">
            <CardContent className="p-6">
              <div className="h-[60vh] overflow-y-auto mb-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-4 flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`flex p-3 rounded-lg max-w-[80%] ${
                        msg.role === 'assistant'
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <div className="mr-2 mt-1">
                        {msg.role === 'assistant' ? (
                          <Bot className="h-5 w-5" />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="اكتب رسالتك هنا..."
                  disabled={isLoading || !hasHuggingFaceKey}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !input.trim() || !hasHuggingFaceKey}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-medium mb-2">كيف يمكن للمساعد الذكي مساعدتك</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>الإجابة على الأسئلة المتعلقة بإدارة المتجر</li>
                <li>مساعدتك في فهم تقارير المبيعات والمخزون</li>
                <li>اقتراح استراتيجيات للتسويق والمبيعات</li>
                <li>مساعدتك في إدارة العملاء والموردين</li>
                <li>توفير نصائح لزيادة الإنتاجية وتحسين الأداء</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
