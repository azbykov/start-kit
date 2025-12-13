"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface PageMetaData {
  firstName?: string;
  lastName?: string;
  teamId?: string | null;
  team?: {
    id: string;
    name: string;
    logo: string | null;
  } | null;
  image?: string | null;
}

interface PageTitleContextType {
  title: string | undefined;
  setTitle: (title: string | undefined) => void;
  metaData: PageMetaData | undefined;
  setMetaData: (metaData: PageMetaData | undefined) => void;
  showBackButton: boolean;
  setShowBackButton: (show: boolean) => void;
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(
  undefined
);

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [metaData, setMetaData] = useState<PageMetaData | undefined>(undefined);
  const [showBackButton, setShowBackButton] = useState<boolean>(false);

  return (
    <PageTitleContext.Provider value={{ title, setTitle, metaData, setMetaData, showBackButton, setShowBackButton }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle() {
  const context = useContext(PageTitleContext);
  if (context === undefined) {
    throw new Error("usePageTitle must be used within a PageTitleProvider");
  }
  return context;
}



