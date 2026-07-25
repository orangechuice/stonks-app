import React from 'react';
import { RefreshCw, Sidebar as SidebarIcon } from 'lucide-react';
import { StonksIcon } from './StonksIcon';

interface TitlebarProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Titlebar: React.FC<TitlebarProps> = ({
  onRefresh,
  isRefreshing,
  toggleSidebar,
  isSidebarOpen,
}) => {
  const handleClose = () => {
    if (window.electronAPI?.closeWindow) {
      window.electronAPI.closeWindow();
    }
  };

  const handleMinimize = () => {
    if (window.electronAPI?.minimizeWindow) {
      window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI?.maximizeWindow) {
      window.electronAPI.maximizeWindow();
    }
  };

  const isElectron = Boolean(window.electronAPI);

  return (
    <header className="mac-titlebar" style={{ WebkitAppRegion: 'drag' } as any}>
      {/* Traffic Light Window Controls */}
      <div className="traffic-light-container" style={{ WebkitAppRegion: 'no-drag' } as any}>
        {!isElectron && (
          <>
            <div
              className="traffic-light"
              style={{ backgroundColor: '#FF5F56', borderColor: '#E0443E' }}
              onClick={handleClose}
              title="Close Window"
            />
            <div
              className="traffic-light"
              style={{ backgroundColor: '#FFBD2E', borderColor: '#DEA123' }}
              onClick={handleMinimize}
              title="Minimize Window"
            />
            <div
              className="traffic-light"
              style={{ backgroundColor: '#27C93F', borderColor: '#1AAB29' }}
              onClick={handleMaximize}
              title="Expand Window"
            />
          </>
        )}

        <button
          onClick={toggleSidebar}
          style={{
            marginLeft: isElectron ? '70px' : '12px',
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
        <StonksIcon size={20} />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.02em' }}>
          Stonks
        </span>
        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
          {isElectron ? 'macOS' : 'Web'}
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '160px', justifyContent: 'flex-end', WebkitAppRegion: 'no-drag' } as any}>
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
