import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'sponsor',    label: 'Sponsor',      to: '/sponsor-portal'        },
  { id: 'advertiser', label: 'Advertiser',   to: '/advertiser-enrollment' },
  { id: 'affiliates', label: 'Affiliates',   to: '/referral'              },
  { id: 'policy',    label: 'Policy Center', to: '/policy'                },
];

export default function BusinessCenter() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex bg-[#f5f0e8] font-sans" style={{ minHeight: '100vh' }}>
      {/* Left Sidebar — sticky */}
      <aside
        className={`sticky top-0 self-start h-screen flex-shrink-0 bg-[#ede8df] border-r border-[#d9d2c7] flex flex-col transition-all duration-200 ${collapsed ? 'w-12' : 'w-52'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#d9d2c7]">
          {!collapsed && (
            <span className="text-[13px] font-semibold text-gray-700 tracking-tight">Business Center</span>
          )}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="p-1.5 rounded-lg hover:bg-[#e4ddd0] text-gray-500 transition-colors ml-auto"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {collapsed ? <polyline points="9,18 15,12 9,6" /> : <polyline points="15,18 9,12 15,6" />}
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.id}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={`flex items-center px-3 py-2.5 rounded-xl text-[13.5px] transition-colors
                ${location.pathname === item.to
                  ? 'bg-[#e4ddd0] text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900'}`}
            >
              {!collapsed && <span className="truncate">{item.label}</span>}
              {collapsed && <span className="truncate text-[11px]">{item.label.charAt(0)}</span>}
            </Link>
          ))}
        </nav>

        {/* Back to chat */}
        <div className="px-2 pb-4">
          <Link
            to="/chat"
            title={collapsed ? 'Back to chat' : undefined}
            className="flex items-center px-3 py-2 rounded-xl text-[13px] text-gray-400 hover:text-gray-700 hover:bg-[#e4ddd0] transition-colors"
          >
            {!collapsed && <span>← Back to chat</span>}
            {collapsed && <span>←</span>}
          </Link>
        </div>
      </aside>

      {/* Main content — scrolls independently */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="border-b border-[#d9d2c7] bg-[#f5f0e8] px-8 py-5">
          <h1 className="text-xl font-semibold text-gray-900">Business Center</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Manage your partnerships, advertising, and platform agreements.
          </p>
        </div>

        <div className="px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.id}
                to={item.to}
                className="group flex flex-col gap-2 p-5 rounded-2xl bg-white border border-[#e4ddd0] hover:border-[#c8bfb0] hover:shadow-sm transition-all"
              >
                <p className="text-[14px] font-semibold text-gray-800 group-hover:text-gray-900">{item.label}</p>
                <p className="text-[12.5px] text-gray-500">
                  {item.id === 'sponsor'    && 'Partner with medmed.ai as a sponsor.'}
                  {item.id === 'advertiser' && 'Run targeted health-focused campaigns.'}
                  {item.id === 'affiliates' && 'Earn commissions through referrals.'}
                  {item.id === 'policy'     && 'Review platform policies and terms.'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
