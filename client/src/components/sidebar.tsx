import React from 'react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom is used
import PackageIcon from './icons/PackageIcon'; // Placeholder for icon component
import ShoppingCartIcon from './icons/ShoppingCartIcon'; // Placeholder for icon component
import BarChart3Icon from './icons/BarChart3Icon'; // Placeholder for icon component


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
      </ul>
    </aside>
  );
}

export default Sidebar;