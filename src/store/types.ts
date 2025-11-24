import type { ServerConfig, Mod } from "../types/serverConfig";
import type { ModSearchResult } from "../api/modApi";

export interface FullStoreState {
  config: ServerConfig;
  enabledMods: Mod[];
  keyOrder: string[];
  originalKeyPositions: Record<string, number>;
  searchResults: ModSearchResult[];
  isSearching: boolean;
  searchError: string | null;
  isImportingBatch: boolean;
  batchImportError: string | null;
  toggleRconEnabled: (enabled: boolean) => void;
  update: (path: string, value: any) => void;
  importJson: (json: string) => void;
  exportJson: () => string | null;
  removeMod: (mod: Mod) => void;
  reorderMods: (fromIndex: number, toIndex: number) => void;
  setNavmeshToggle: (enabled: boolean) => void;
  toggleMissionHeaderEnabled: (enabled: boolean) => void;
  toggleAdminsEnabled: (enabled: boolean) => void;
  searchMods: (query: string) => Promise<void>;
  addModFromSearch: (searchResult: ModSearchResult) => Promise<void>;
  addManualMod: (modId: string, modName: string) => void;
  processBatchMods: (mods: any[], existingModIds: Set<string>) => Promise<{ mods: Mod[]; errors: string[] }>;
  importModsBatch: (modIds: string[]) => Promise<void>;
  importModsList: (mods: Mod[]) => void;
}
