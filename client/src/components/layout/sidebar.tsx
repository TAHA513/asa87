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
} from "react-icons/md";

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
                    <Icon 
                      className="h-4 w-4"
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

      <div className="p-2 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full h-8 text-xs font-normal text-black hover:bg-gray-50"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-3.5 w-3.5 ml-2" style={{ color: "#EA4335" }} />
          تسجيل خروج
        </Button>
      </div>
    </div>
  );
}