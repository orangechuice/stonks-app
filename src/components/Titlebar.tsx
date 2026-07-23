import React from 'react';
import { RefreshCw, Search, Sidebar as SidebarIcon } from 'lucide-react';

interface TitlebarProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  onOpenSearch: () => void;
}

export const Titlebar: React.FC<TitlebarProps> = ({
  onRefresh,
  isRefreshing,
  toggleSidebar,
  isSidebarOpen,
  onOpenSearch,
}) => {
  return (
    <header className="mac-titlebar">
      {/* Traffic Light Buttons (Close, Minimize, Expand) */}
      <div className="traffic-light-container">
        <div className="traffic-light" style={{ backgroundColor: '#FF5F56', borderColor: '#E0443E' }} title="Close" />
        <div className="traffic-light" style={{ backgroundColor: '#FFBD2E', borderColor: '#DEA123' }} title="Minimize" />
        <div className="traffic-light" style={{ backgroundColor: '#27C93F', borderColor: '#1AAB29' }} title="Expand" />

        <button
          onClick={toggleSidebar}
          style={{
            marginLeft: '12px',
            padding: '6px',
            borderRadius: '6px',
            background: isSidebarOpen ? 'rgba(255,255,255,0.12)' : 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Toggle Sidebar"
        >
          <SidebarIcon style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* Center Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.02em' }}>
          Stocks
        </span>
        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
          macOS
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '160px', justifyContent: 'flex-end' }}>
        <button
          onClick={onOpenSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 12,
            color: 'rgba(255,255,255,0.7)',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '4px 10px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          <Search style={{ width: 13, height: 13 }} />
          <span>Search</span>
          <kbd style={{ fontSize: 10, background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: 3, fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>⌘K</kbd>
        </button>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          style={{
            padding: '6px',
            borderRadius: '6px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: isRefreshing ? 'default' : 'pointer',
            opacity: isRefreshing ? 0.4 : 1,
            display: 'flex',
            alignItems: 'center',
          }}
          title="Refresh Quotes"
        >
          <RefreshCw style={{ width: 14, height: 14 }} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>
    </header>
  );
};
