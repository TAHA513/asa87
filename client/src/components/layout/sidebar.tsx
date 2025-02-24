import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Receipt,
  Users,
  FileText,
  LogOut,
  Calendar,
  Settings as SettingsIcon,
  Megaphone,
  BarChart,
  Wallet,
  Truck,
  QrCode,
  Tag,
  UserRound,
} from "lucide-react";

const navigation = [
  { name: "لوحة التحكم", href: "/", icon: LayoutDashboard },
  { name: "المخزون", href: "/inventory", icon: Package },
  { name: "المبيعات", href: "/sales", icon: Receipt },
  { name: "العملاء", href: "/customers", icon: UserRound },
  { name: "الفواتير", href: "/invoices", icon: FileText },
  { name: "التقسيط", href: "/installments", icon: Calendar },
  { name: "التسويق", href: "/marketing", icon: Megaphone },
  { name: "التقارير", href: "/reports", icon: BarChart },
  { name: "المصروفات", href: "/expenses", icon: Wallet },
  { name: "الموردين", href: "/suppliers", icon: Truck },
  { name: "الباركود", href: "/barcodes", icon: QrCode },
  { name: "أكواد الخصم", href: "/discount-codes", icon: Tag },
  { name: "الموظفين", href: "/staff", icon: Users },
  { name: "الإعدادات", href: "/settings", icon: SettingsIcon },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  return (
    <div className="flex flex-col h-full bg-white border-l">
      <div className="p-4">
        <h1 className="text-base font-medium text-black">
          نظام إدارة الأعمال
        </h1>
        <p className="text-xs text-gray-600">
          مرحباً, {user?.username}
        </p>
      </div>

      <nav className="flex-1 px-2">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 h-8 px-2 text-xs font-normal",
                    location === item.href
                      ? "bg-gray-100 text-black"
                      : "text-black hover:bg-gray-50"
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="h-3.5 w-3.5" />
                    {item.name}
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-2 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full h-8 text-xs font-normal text-black hover:bg-gray-50"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-3.5 w-3.5 ml-2" />
          تسجيل خروج
        </Button>
      </div>
    </div>
  );
}