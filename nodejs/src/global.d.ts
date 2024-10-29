declare namespace chrome {
  export const tabs: {
    query: (queryInfo: {
      active: boolean;
      currentWindow: boolean;
    }) => Promise<chrome.tabs.Tab[]>;
  };
  export const runtime: {
    id: string;
  };
}

interface Tab {
  url?: string;
  title?: string;
}

declare namespace chrome.tabs {
  interface Tab {
    url?: string;
    title?: string;
  }
}
