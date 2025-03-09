
import React, { useEffect, useState } from 'react';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('appearance');
  const { isLoading, error, initialize } = useAppTheme();
  const navigate = useNavigate();
  
  useEffect(() => {
    // يمكن استخدام معرف المستخدم الحالي من localStorage أو أي مصدر آخر
    const userId = localStorage.getItem('userId') || '1';
    initialize(parseInt(userId));
  }, [initialize]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="mr-2">جاري تحميل الإعدادات...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          className="px-4 py-2 bg-primary text-white rounded"
          onClick={() => navigate('/')}
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">الإعدادات</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="appearance">المظهر والألوان</TabsTrigger>
          <TabsTrigger value="account">إعدادات الحساب</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="security">الأمان والخصوصية</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>
        
        <TabsContent value="account">
          <div className="text-center p-12">
            <h2 className="text-xl font-medium mb-4">إعدادات الحساب</h2>
            <p>سيتم إضافة هذا القسم قريبًا</p>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <div className="text-center p-12">
            <h2 className="text-xl font-medium mb-4">إعدادات الإشعارات</h2>
            <p>سيتم إضافة هذا القسم قريبًا</p>
          </div>
        </TabsContent>
        
        <TabsContent value="security">
          <div className="text-center p-12">
            <h2 className="text-xl font-medium mb-4">الأمان والخصوصية</h2>
            <p>سيتم إضافة هذا القسم قريبًا</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
