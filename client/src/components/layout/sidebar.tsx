import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, Moon, Sun, Eye } from "lucide-react";
import {
  MdDashboard,
  MdInventory2,
  MdPointOfSale,
  MdPeople,
  MdReceipt,
  MdCalendarMonth,
  MdCampaign,
  MdBarChart,
  MdAccountBalance,
  MdLocalShipping,
  MdQrCode2,
  MdLocalOffer,
  MdSupervisorAccount,
  MdSettings,
} from "react-icons/md";
import { useTheme } from "@/hooks/use-theme";

const navigation = [
  { name: "لوحة التحكم", href: "/", icon: MdDashboard, color: "#4285F4" },
  { name: "المخزون", href: "/inventory", icon: MdInventory2, color: "#34A853" },
  { name: "المبيعات", href: "/sales", icon: MdPointOfSale, color: "#EA4335" },
  { name: "العملاء", href: "/customers", icon: MdPeople, color: "#FBBC05" },
  { name: "الفواتير", href: "/invoices", icon: MdReceipt, color: "#4285F4" },
  { name: "التقسيط", href: "/installments", icon: MdCalendarMonth, color: "#34A853" },
  { name: "التسويق", href: "/marketing", icon: MdCampaign, color: "#EA4335" },
  { name: "التقارير", href: "/reports", icon: MdBarChart, color: "#FBBC05" },
  { name: "المصروفات", href: "/expenses", icon: MdAccountBalance, color: "#4285F4" },
  { name: "الموردين", href: "/suppliers", icon: MdLocalShipping, color: "#34A853" },
  { name: "الباركود", href: "/barcodes", icon: MdQrCode2, color: "#EA4335" },
  { name: "أكواد الخصم", href: "/discount-codes", icon: MdLocalOffer, color: "#FBBC05" },
  { name: "الموظفين", href: "/staff", icon: MdSupervisorAccount, color: "#4285F4" },
  { name: "الإعدادات", href: "/settings", icon: MdSettings, color: "#34A853" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col h-full bg-background border-l">
      <div className="p-4">
        <h1 className="text-base font-medium text-foreground">
          نظام إدارة الأعمال
        </h1>
        <p className="text-xs text-muted-foreground">
          مرحباً, {user?.username}
        </p>
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-10 px-3 text-sm font-normal",
                    location === item.href
                      ? "bg-secondary text-secondary-foreground"
                      : "text-foreground hover:bg-secondary/50"
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon 
                      className="h-5 w-5"
                      style={{ color: item.color }}
                    />
                    {item.name}
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-border space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-sm font-normal"
          onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'focus' : 'light')}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : theme === 'dark' ? (
            <Eye className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          {theme === 'light' ? 'الوضع الليلي' : theme === 'dark' ? 'وضع التركيز' : 'الوضع النهاري'}
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sm font-normal text-destructive hover:text-destructive"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-5 w-5" />
          تسجيل خروج
        </Button>
      </div>
    </div>
  );
}