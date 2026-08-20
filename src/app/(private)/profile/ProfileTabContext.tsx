"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type ProfileTab = "myArticles" | "savedArticles";

type ProfileTabContextValue = {
  activeTab: ProfileTab;
  setActiveTab: (tab: ProfileTab) => void;
};

const ProfileTabContext = createContext<ProfileTabContextValue | null>(null);

export function ProfileTabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("myArticles");

  return (
    <ProfileTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ProfileTabContext.Provider>
  );
}

export function useProfileTab(): ProfileTabContextValue {
  const context = useContext(ProfileTabContext);
  if (!context) {
    throw new Error("useProfileTab must be used within a ProfileTabProvider");
  }
  return context;
}