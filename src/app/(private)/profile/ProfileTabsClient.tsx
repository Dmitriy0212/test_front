"use client";

import type { ReactNode } from "react";

import { useProfileTab } from "./ProfileTabContext";
import css from "./layout.module.css";

type ProfileTabsClientProps = {
  children: ReactNode;
  myArticles: ReactNode;
  savedArticles: ReactNode;
};

export default function ProfileTabsClient({
  children,
  myArticles,
  savedArticles,
}: ProfileTabsClientProps) {
  const { activeTab, setActiveTab } = useProfileTab();

  return (
    <>
      <div className={css.tabs} role="tablist" aria-label="Profile articles">
        <button
          type="button"
          role="tab"
          id="tab-myArticles"
          aria-selected={activeTab === "myArticles"}
          aria-controls="tabpanel-myArticles"
          className={`${css.tab} ${activeTab === "myArticles" ? css.tabActive : ""}`}
          onClick={() => setActiveTab("myArticles")}
        >
          My Articles
        </button>
        <button
          type="button"
          role="tab"
          id="tab-savedArticles"
          aria-selected={activeTab === "savedArticles"}
          aria-controls="tabpanel-savedArticles"
          className={`${css.tab} ${activeTab === "savedArticles" ? css.tabActive : ""}`}
          onClick={() => setActiveTab("savedArticles")}
        >
          Saved Articles
        </button>
      </div>

      <div
        id="tabpanel-myArticles"
        role="tabpanel"
        aria-labelledby="tab-myArticles"
        hidden={activeTab !== "myArticles"}
      >
        {activeTab === "myArticles" && myArticles}
      </div>

      <div
        id="tabpanel-savedArticles"
        role="tabpanel"
        aria-labelledby="tab-savedArticles"
        hidden={activeTab !== "savedArticles"}
      >
        {activeTab === "savedArticles" && savedArticles}
      </div>

      {children}
    </>
  );
}