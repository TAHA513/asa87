import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
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
  MdNotifications,
} from "react-icons/md";

const navigation = [
  // لوحة التحكم الرئيسية
  { 
    name: "لوحة التحكم", 
    href: "/", 
    icon: MdDashboard, 
    color: "#4285F4" 
  },

  // إدارة المبيعات والمخزون
  { 
    group: "المبيعات والمخزون",
    items: [
      { name: "المبيعات", href: "/sales", icon: MdPointOfSale, color: "#EA4335" },
      { name: "المخزون", href: "/inventory", icon: MdInventory2, color: "#34A853" },
      { name: "الباركود", href: "/barcodes", icon: MdQrCode2, color: "#EA4335" },
    ]
  },

  // إدارة العملاء والموردين
  {
    group: "العملاء والموردين",
    items: [
      { name: "العملاء", href: "/customers", icon: MdPeople, color: "#FBBC05" },
      { name: "الموردين", href: "/suppliers", icon: MdLocalShipping, color: "#34A853" },
    ]
  },

  // المالية والمحاسبة
  {
    group: "المالية والمحاسبة",
    items: [
      { name: "الفواتير", href: "/invoices", icon: MdReceipt, color: "#4285F4" },
      { name: "التقسيط", href: "/installments", icon: MdCalendarMonth, color: "#34A853" },
      { name: "المصروفات", href: "/expenses", icon: MdAccountBalance, color: "#4285F4" },
    ]
  },

  // التسويق والتقارير
  {
    group: "التسويق والتقارير",
    items: [
      { name: "التسويق", href: "/marketing", icon: MdCampaign, color: "#EA4335" },
      { name: "التقارير", href: "/reports", icon: MdBarChart, color: "#FBBC05" },
      { name: "أكواد الخصم", href: "/discount-codes", icon: MdLocalOffer, color: "#FBBC05" },
    ]
  },

  // إدارة النظام
  {
    group: "إدارة النظام",
    items: [
      { name: "الموظفين", href: "/staff", icon: MdSupervisorAccount, color: "#4285F4" },
      { name: "التنبيهات", href: "/notifications", icon: MdNotifications, color: "#EA4335" },
      { name: "الإعدادات", href: "/settings", icon: MdSettings, color: "#34A853" },
    ]
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  return (
    <div className="flex flex-col h-full bg-white border-l">
      {/* رأس القائمة */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          نظام إدارة الأعمال
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          مرحباً, {user?.fullName || user?.username}
        </p>
      </div>

      {/* القائمة الرئيسية */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-6">
          {/* عنصر لوحة التحكم */}
          <li>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-10 px-3 text-sm font-normal",
                location === "/"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              )}
              asChild
            >
              <Link href="/">
                <MdDashboard className="h-5 w-5" style={{ color: "#4285F4" }} />
                لوحة التحكم
              </Link>
            </Button>
          </li>

          {/* مجموعات القائمة */}
          {navigation.filter(item => item.group).map((group, idx) => (
            <li key={idx} className="space-y-2">
              <div className="px-3 text-xs font-medium text-muted-foreground">
                {group.group}
              </div>
              <ul className="space-y-1">
                {group.items?.map((item) => (
                  <li key={item.name}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-9 px-3 text-sm font-normal",
                        location === item.href
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                      )}
                      asChild
                    >
                      <Link href={item.href}>
                        {item.icon && (
                          <item.icon
                            className="h-4 w-4"
                            style={{ color: item.color }}
                          />
                        )}
                        {item.name}
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      {/* زر تسجيل الخروج */}
      <div className="p-3 border-t">
        <Button
          variant="ghost"
          className="w-full h-10 text-sm font-normal justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-4 w-4" />
          تسجيل خروج
        </Button>
      </div>
    </div>
  );
}