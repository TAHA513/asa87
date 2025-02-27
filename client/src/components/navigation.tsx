import {
  Package,
  ShoppingCart,
  Calendar,
  Tags,
  BarChart3,
  Settings,
  Truck,
  Users,
  CreditCard,
  Wallet,
  Home,
  Barcode,
  Store,
  MessageSquare
} from "lucide-react";

// Assuming this is a sidebar navigation component
const sidebarItems = [
  { name: 'الرئيسية', path: '/', icon: <Home className="h-4 w-4" /> },
  { name: 'المشتريات', path: '/purchases', icon: <ShoppingCart className="h-4 w-4" /> },
  { name: 'المبيعات', path: '/sales', icon: <BarChart3 className="h-4 w-4" /> },
  { name: 'المخزون', path: '/inventory', icon: <Package className="h-4 w-4" /> },
  { name: 'المواعيد', path: '/appointments', icon: <Calendar className="h-4 w-4" /> },
  { name: 'الشحن', path: '/shipping', icon: <Truck className="h-4 w-4" /> },
  { name: 'الإعدادات', path: '/settings', icon: <Settings className="h-4 w-4" /> },
  { name: 'العملاء', path: '/customers', icon: <Users className="h-4 w-4" /> },
  { name: 'أكواد الخصم', path: '/discount-codes', icon: <Tags className="h-4 w-4" /> },
  { name: 'طباعة الباركود', path: '/barcodes', icon: <Barcode className="h-4 w-4" /> },
  { name: 'الدردشة الذكية', path: '/chat', icon: <MessageSquare className="h-4 w-4" /> },
  // ... other sidebar items ...
];


export default sidebarItems;