import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Truck,
  Megaphone,
  CreditCard,
  Bot,
} from "lucide-react";

const routes = [
  {
    href: "/",
    icon: BarChart,
    label: "الرئيسية",
  },
  {
    href: "/packages",
    icon: Package,
    label: "الطرود",
  },
  {
    href: "/orders",
    icon: ShoppingCart,
    label: "الطلبات",
  },
  {
    href: "/users",
    icon: Users,
    label: "المستخدمين",
  },
  {
    href: "/assistant",
    icon: Bot,
    label: "المساعد الذكي",
  },
  {
    href: "/settings",
    icon: Settings,
    label: "الإعدادات",
  },
];

function NavItem({ href, icon: Icon, children, ...props }) {
  const location = useLocation();
  const isActive = location === href;

  return (
    <Link href={href} {...props}>
      <li className={cn("group flex items-center p-3 hover:bg-gray-100", { "bg-gray-100": isActive })}>
        <Icon className={cn("w-5 h-5 mr-2", { "text-blue-500": isActive })} />
        <span className={cn("", { "font-medium": isActive })}>{children}</span>
      </li>
    </Link>
  );
}

export function Sidebar() {
  return (
    <div className="bg-white shadow-md">
      <div className="p-4">
        <nav>
          {routes.map((route) => (
            <NavItem key={route.href} href={route.href} icon={route.icon}>
              {route.label}
            </NavItem>
          ))}
        </nav>
      </div>
    </div>
  );
}