import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppearanceForm } from "@/components/settings/appearance-form";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/page-header";
import { ApiIntegrationSettings } from "@/components/settings/api-integration-settings";
import { StoreSettings } from "@/components/settings/StoreSettings";

export default function SettingsPage() {
  return (
    <MainLayout>
      <PageHeader
        title="الإعدادات"
        subtitle="تخصيص إعدادات النظام حسب احتياجاتك"
      />

      <Tabs defaultValue="store" className="mt-6">
        <TabsList className="mb-6">
          <TabsTrigger value="store">معلومات المتجر</TabsTrigger>
          <TabsTrigger value="appearance">المظهر</TabsTrigger>
          <TabsTrigger value="api-keys">واجهات برمجة التطبيقات</TabsTrigger>
        </TabsList>
        <TabsContent value="store">
          <StoreSettings />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceForm />
        </TabsContent>
        <TabsContent value="api-keys">
          <ApiIntegrationSettings />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}