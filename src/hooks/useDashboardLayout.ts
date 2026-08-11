import { useState, useEffect, useCallback } from 'react';

export type ViewportDevice = 'mobile' | 'tablet' | 'desktop';
export type SidebarMode = 'drawer' | 'collapsed' | 'expanded';

export interface ResponsiveLayoutState {
  windowWidth: number;
  windowHeight: number;
  device: ViewportDevice;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  sidebarMode: SidebarMode;
}

export interface ResponsiveLayoutActions {
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebarCollapse: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  handleTabChange: (tabHandler?: () => void) => void;
}

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export function useDashboardLayout() {
  const [windowSize, setWindowSize] = useState<{ width: number; height: number }>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));

  const getDevice = useCallback((width: number): ViewportDevice => {
    if (width < MOBILE_BREAKPOINT) return 'mobile';
    if (width < TABLET_BREAKPOINT) return 'tablet';
    return 'desktop';
  }, []);

  const device = getDevice(windowSize.width);
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';
  const isDesktop = device === 'desktop';

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => !isMobile);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => isTablet);

  // Compute current sidebar mode
  const sidebarMode: SidebarMode = isMobile
    ? 'drawer'
    : isSidebarCollapsed
    ? 'collapsed'
    : 'expanded';

  // Handle window resizing with auto-adaptation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        setWindowSize({ width, height });

        const newDevice = getDevice(width);
        if (newDevice === 'mobile') {
          setIsSidebarOpen(false); // Drawer hidden by default on mobile
        } else if (newDevice === 'tablet') {
          setIsSidebarOpen(true);
          setIsSidebarCollapsed(true); // Compact mode on tablet
        } else {
          setIsSidebarOpen(true);
          setIsSidebarCollapsed(false); // Expanded on desktop
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [getDevice]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const handleTabChange = useCallback((tabHandler?: () => void) => {
    if (tabHandler) tabHandler();
    // On mobile or overlay drawer mode, auto-close sidebar when switching tabs
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  const isTouchDevice = typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  return {
    // State
    windowWidth: windowSize.width,
    windowHeight: windowSize.height,
    device,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    isSidebarOpen,
    isSidebarCollapsed,
    sidebarMode,

    // Actions
    toggleSidebar,
    openSidebar,
    closeSidebar,
    toggleSidebarCollapse,
    setSidebarOpen: setIsSidebarOpen,
    setSidebarCollapsed: setIsSidebarCollapsed,
    handleTabChange,
  };
}

export const useResponsiveLayout = useDashboardLayout;
