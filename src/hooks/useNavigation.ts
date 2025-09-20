import { useState, useCallback } from "react";

export function useNavigation() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return {
    isSidebarOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
  };
}
