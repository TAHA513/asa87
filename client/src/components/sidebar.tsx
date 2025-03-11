import React from 'react';
import { Link } from 'react-router-dom';
import { Package as PackageIcon } from "lucide-react";
import ShoppingCartIcon from './icons/ShoppingCartIcon';
import BarChart3Icon from './icons/BarChart3Icon';


function Sidebar() {
  return (
    <aside>
      <ul>
        <li>
          <Link to="/inventory">
            <PackageIcon /> المخزون
          </Link>
        </li>
        <li>
          <Link to="/sales-history">
            <ShoppingCartIcon /> المبيعات
          </Link>
        </li>
        <li>
          <Link to="/sales-analytics">
            <BarChart3Icon /> تحليلات المبيعات الذكية
          </Link>
        </li>
        <li>
          <Link to="/reports">
            <BarChart3Icon /> التقارير
          </Link>
        </li>
        <li>
          <Link to="/ai-analytics">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M12 2a8 8 0 0 0-8 8c0 3.6 2.4 6.9 6 8.7V22l3.5-3.5a12 12 0 0 0 4.5-.3 8 8 0 0 0 0-16" />
              <path d="M19 2v6" />
              <path d="M16 5h6" />
            </svg>
            <span>تحليلات الذكاء الاصطناعي</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;