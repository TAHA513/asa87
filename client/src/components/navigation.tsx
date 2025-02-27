
import React from "react";
import { Link } from "react-router-dom";
import { SidebarMenuButton, SidebarMenu, SidebarMenuGroup } from "@/components/ui/sidebar";
import { ChatBubbleIcon } from "@radix-ui/react-icons";

// قد تحتاج لتعديل هذا الملف بناءً على هيكل التنقل الحالي في تطبيقك
export function NavigationMenu() {
  return (
    <SidebarMenu>
      {/* الروابط الموجودة في الأصل */}
      
      {/* إضافة رابط الدردشة الجديد */}
      <SidebarMenuGroup>
        <SidebarMenuButton as={Link} to="/chat" icon={<ChatBubbleIcon />}>
          الدردشة الذكية
        </SidebarMenuButton>
      </SidebarMenuGroup>
    </SidebarMenu>
  );
}

export default NavigationMenu;
