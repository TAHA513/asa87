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
} from "lucide-react";

const navigation = [
  { name: "لوحة التحكم", href: "/", icon: LayoutDashboard },
  { name: "المخزون", href: "/inventory", icon: Package },
  { name: "المبيعات", href: "/sales", icon: Receipt },
  { name: "الفواتير", href: "/invoices", icon: FileText },
  { name: "التقسيط", href: "/installments", icon: Calendar },
  { name: "التسويق", href: "/marketing", icon: Megaphone },
  { name: "التقارير", href: "/reports", icon: BarChart },
  { name: "المصروفات", href: "/expenses", icon: Wallet },
  { name: "الموردين", href: "/suppliers", icon: Truck },
  { name: "الباركود", href: "/barcodes", icon: QrCode },
  { name: "الموظفين", href: "/staff", icon: Users },
  { name: "الإعدادات", href: "/settings", icon: SettingsIcon },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  return (
    <div className="flex flex-col h-full bg-sidebar border-r">
      <div className="p-6">
        <h1 className="text-xl font-bold text-sidebar-foreground">
          نظام إدارة الأعمال
        </h1>
        <p className="text-sm text-sidebar-foreground/60">
          مرحباً, {user?.username}
        </p>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3",
                    location === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-4 w-4 ml-2" />
          تسجيل خروج
        </Button>
      </div>
    </div>
  );
}