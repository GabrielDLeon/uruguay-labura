import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react/offline";

import SavedJobsBoard from "@/components/jobs/SavedJobsBoard";
import SavedSearchesBoard from "@/components/jobs/SavedSearchesBoard";
import useJobs from "@/components/jobs/useJobs";
import { appIcons } from "@/lib/icons";
import {
  getSavedSearches,
  subscribeToSavedSearches,
} from "@/lib/saved-searches";
import { countUniqueNewJobs, getSearchesNews } from "@/lib/search-news";
import type { SavedSearch } from "@/types/jobs";

type TabId = "empleos" | "busquedas";

function readTabFromUrl(): TabId {
  if (typeof window === "undefined") {
    return "empleos";
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("tab") === "busquedas" ? "busquedas" : "empleos";
}

export default function SavedItemsTabs() {
  const { jobs } = useJobs();
  const [tab, setTab] = useState<TabId>("empleos");
  const [searches, setSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    setTab(readTabFromUrl());
  }, []);

  useEffect(() => {
    const sync = () => setSearches(getSavedSearches());
    sync();
    return subscribeToSavedSearches(sync);
  }, []);

  const newsCount = useMemo(
    () => countUniqueNewJobs(getSearchesNews(jobs, searches)),
    [jobs, searches],
  );

  const selectTab = (next: TabId) => {
    setTab(next);

    const params = new URLSearchParams(window.location.search);
    if (next === "busquedas") {
      params.set("tab", "busquedas");
    } else {
      params.delete("tab");
    }

    const query = params.toString();
    history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname,
    );
  };

  // Optamos por fuera del JS de basecoat, así que manejamos las flechas.
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }

    event.preventDefault();
    const next: TabId = tab === "empleos" ? "busquedas" : "empleos";
    selectTab(next);
    document
      .getElementById(
        next === "empleos" ? "guardados-tab-empleos" : "guardados-tab-busquedas",
      )
      ?.focus();
  };

  return (
    <div className="tabs gap-0" data-tabs-initialized="true">
      <nav
        role="tablist"
        aria-orientation="horizontal"
        className="flex w-full flex-wrap gap-x-3 rounded-none"
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          role="tab"
          id="guardados-tab-empleos"
          aria-controls="guardados-panel-empleos"
          aria-selected={tab === "empleos"}
          tabIndex={tab === "empleos" ? 0 : -1}
          onClick={() => selectTab("empleos")}
          className="shadow-none aria-selected:border aria-selected:border-border"
        >
          <Icon
            icon={appIcons.bookmarkOutline}
            width="20"
            height="20"
            className="mr-1.5 shrink-0"
            aria-hidden="true"
          />
          Empleos
        </button>

        <button
          type="button"
          role="tab"
          id="guardados-tab-busquedas"
          aria-controls="guardados-panel-busquedas"
          aria-selected={tab === "busquedas"}
          tabIndex={tab === "busquedas" ? 0 : -1}
          onClick={() => selectTab("busquedas")}
          className="shadow-none aria-selected:border aria-selected:border-border"
        >
          <Icon
            icon={appIcons.starOutline}
            width="20"
            height="20"
            className="mr-1.5 shrink-0"
            aria-hidden="true"
          />
          Búsquedas
          {newsCount > 0 ? (
            <span className="badge ml-1.5 text-xs" data-variant="success">
              {newsCount > 99 ? "99+" : newsCount}
            </span>
          ) : null}
        </button>
      </nav>

      <div className="w-full border-b border-border" />

      <div
        role="tabpanel"
        id="guardados-panel-empleos"
        aria-labelledby="guardados-tab-empleos"
        tabIndex={-1}
        hidden={tab !== "empleos"}
      >
        <SavedJobsBoard />
      </div>

      <div
        role="tabpanel"
        id="guardados-panel-busquedas"
        aria-labelledby="guardados-tab-busquedas"
        tabIndex={-1}
        hidden={tab !== "busquedas"}
      >
        <SavedSearchesBoard />
      </div>
    </div>
  );
}
