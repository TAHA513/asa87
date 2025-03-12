
import React from 'react';
import { MainLayout } from "../components/layout/main-layout";
import { PageHeader } from "../components/page-header";
import { StoreSettings } from "@/components/settings/StoreSettings";

export default function StoreSettingsPage() {
  return (
    <MainLayout>
      <PageHeader
        title="إعدادات المتجر"
        subtitle="تخصيص معلومات المتجر الخاص بك"
      />
      <div className="container mx-auto py-6">
        <StoreSettings />
      </div>
    </MainLayout>
  );
}
