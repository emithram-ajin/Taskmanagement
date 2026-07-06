import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Any component (header, sidebar, dashboard content) can call this
// to read/toggle the sidebar state without needing it passed as a prop.
export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebar must be used inside a <SidebarProvider>');
  }
  return ctx;
};