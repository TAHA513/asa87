import Sidebar from '@/components/layout/sidebar';
import ChangePasswordForm from '@/components/settings/change-password';
import ThemeSettings from '@/components/settings/theme-settings';
import ApiKeysForm from '@/components/settings/api-keys-form';
import { Settings as SettingsIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Settings() {
  return (
    <div className="flex h-screen">
      <div className="h-full w-64">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center gap-4">
            <SettingsIcon className="h-6 w-6" />
            <h1 className="text-3xl font-bold">الإعدادات</h1>
          </div>

          <div className="grid max-w-2xl gap-8">
            <Card>
              <CardHeader>
                <CardTitle>مفاتيح API للمنصات الاجتماعية</CardTitle>
                <CardDescription>
                  قم بإضافة مفاتيح API الخاصة بكل منصة تواصل اجتماعي لتتمكن من الربط والتحكم في
                  الحملات الإعلانية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApiKeysForm />
              </CardContent>
            </Card>

            <ThemeSettings />

            <Card>
              <CardHeader>
                <CardTitle>تغيير كلمة المرور</CardTitle>
                <CardDescription>
                  قم بتغيير كلمة المرور الخاصة بك. يجب إدخال كلمة المرور الحالية للتحقق.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
