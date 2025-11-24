import type { StateCreator } from "zustand";
import { updateModsAndConfig } from "../../utils/storeHelpers";
import { searchMods, type ModSearchResult } from "../../api/modApi";
import { createMod } from "../../utils/modUtils";
import type { Mod } from "../../types/serverConfig";
import type { FullStoreState } from "../types";
import config from "../../../config.json";

interface ProcessedMod {
  modId: string;
  modName: string;
  name?: string;
  version?: string;
  author?: string;
  size?: number;
  url?: string;
  error?: string;
}

interface ModInfo {
  modId: string;
  modName: string;
  author?: string;
  version?: string;
  size?: number;
  url?: string;
}

const fetchModsInfo = async (modIds: string[]): Promise<ModInfo[]> => {
  try {
    const response = await fetch(`${config.apiUrl}/mods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mods: modIds })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch mod details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching mods info:', error);
    throw error;
  }
};

export const createModSlice: StateCreator<
  FullStoreState,
  [],
  [],
  Pick<
    FullStoreState, 
    'searchResults' | 'isSearching' | 'searchError' | 
    'isImportingBatch' | 'batchImportError' | 'searchMods' | 
    'addModFromSearch' | 'importModsBatch' | 'importModsList' | 
    'reorderMods' | 'processBatchMods' | 'addManualMod'
  >
> = (set, get) => ({
  searchResults: [],
  isSearching: false,
  searchError: null,
  isImportingBatch: false,
  batchImportError: null,
  
  reorderMods: (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    set((s) => {
      const mods = [...s.enabledMods];
      const [moved] = mods.splice(fromIndex, 1);
      mods.splice(toIndex, 0, moved);
      return updateModsAndConfig(s.config, mods);
    });
  },
  
  searchMods: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [], searchError: null });
      return;
    }

    set({ isSearching: true, searchError: null });

    try {
      const results = await searchMods(query);
      set({
        searchResults: results,
        isSearching: false,
        searchError: null
      });
    } catch (error) {
      set({
        searchResults: [],
        isSearching: false,
        searchError: error instanceof Error ? error.message : 'Mod search error'
      });
    }
  },
  
  addModFromSearch: async (searchResult: ModSearchResult) => {
    const mod = createMod(searchResult.modId, searchResult.modName);
    set((s) => {
      if (s.enabledMods.some(m => m.modId === mod.modId)) return s;
      return updateModsAndConfig(s.config, [...s.enabledMods, mod]);
    });
  },

  addManualMod: (modId: string, modName: string) => {
    if (!modId.trim() || !modName.trim()) {
      throw new Error('Both modId and modName are required');
    }

    const mod = createMod(modId.trim(), modName.trim());
    set((s) => {
      if (s.enabledMods.some(m => m.modId === mod.modId)) return s;
      return updateModsAndConfig(s.config, [...s.enabledMods, mod]);
    });
  },

  processBatchMods: async (mods: ProcessedMod[], existingModIds: Set<string>): Promise<{ mods: Mod[]; errors: string[] }> => {
    const successfulMods: Mod[] = [];
    const errors: string[] = [];
    const processedMods = new Set<string>(existingModIds);
    
    for (const current of mods) {
      const modId = current.modId;

      if (processedMods.has(modId)) continue;

      if (current.error) {
        errors.push(`${modId}: ${current.error}`);
        continue;
      }

      if (!current.modId || !current.modName) {
        errors.push(`Invalid mod data for ${modId}`);
        continue;
      }

      try {
        successfulMods.push(createMod(modId, current.modName));
        processedMods.add(modId);
      } catch (error) {
        errors.push(`Error creating mod ${modId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { mods: successfulMods, errors };
  },

  importModsBatch: async (modIds: string[]) => {
    set({ isImportingBatch: true, batchImportError: null });
    
    try {
      const existingModIds = new Set(get().enabledMods.map((m: Mod) => m.modId));
      
      const seen = new Set();
      const uniqueModIds = modIds.filter(modId => {
        if (!modId || seen.has(modId)) return false;
        seen.add(modId);
        return true;
      });
      
      if (uniqueModIds.length === 0) {
        throw new Error('No valid mod IDs provided');
      }

      const modsInfo = await fetchModsInfo(uniqueModIds);
      
      const modInfoMap = new Map(modsInfo.map(mod => [mod.modId, mod]));
      
      const modsToProcess = uniqueModIds.map(modId => {
        const mod = modInfoMap.get(modId);
        if (!mod) return null;
        
        return {
          modId: mod.modId,
          modName: mod.modName,
          name: mod.modName,
          version: mod.version,
          author: mod.author,
          size: mod.size,
          url: mod.url
        };
      }).filter(Boolean);
      
      const { mods: newMods, errors } = await get().processBatchMods(
        modsToProcess,
        existingModIds
      );

      if (newMods.length > 0) {
        set((s) => {
          const updatedMods = [...s.enabledMods];
          for (const mod of newMods) {
            if (!updatedMods.some(m => m.modId === mod.modId)) {
              updatedMods.push({
                modId: mod.modId,
                name: mod.name || mod.modId,
                ...(mod.version && { version: mod.version }),
                ...(mod.author && { author: mod.author }),
                ...(mod.size && { size: mod.size }),
                ...(mod.url && { url: mod.url })
              });
            }
          }
          return updateModsAndConfig(s.config, updatedMods);
        });
      }

      if (errors.length > 0) {
        set({ batchImportError: `Some mods could not be imported: ${errors.join(', ')}` });
      }
    } catch (error) {
      set({ batchImportError: error instanceof Error ? error.message : 'Failed to import mods' });
      throw error;
    } finally {
      set({ isImportingBatch: false });
    }
  },

  importModsList: async (mods: Mod[]) => {
    try {
      set({ isImportingBatch: true, batchImportError: null });
      
      const modIds = mods.map(mod => mod.modId);
      await get().importModsBatch(modIds);
    } catch (error) {
      set({ batchImportError: error instanceof Error ? error.message : 'Failed to import mods' });
      throw error;
    } finally {
      set({ isImportingBatch: false });
    }
  }
});