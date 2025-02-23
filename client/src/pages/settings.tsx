import Sidebar from "@/components/layout/sidebar";
import ChangePasswordForm from "@/components/settings/change-password";
import ThemeSettings from "@/components/settings/theme-settings";
import { Settings as SettingsIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Settings() {
  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <SettingsIcon className="h-6 w-6" />
            <h1 className="text-3xl font-bold">الإعدادات</h1>
          </div>

          <div className="grid gap-8 max-w-2xl">
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