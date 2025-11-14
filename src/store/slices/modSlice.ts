import type { StateCreator } from "zustand";
import { updateModsAndConfig } from "../../utils/storeHelpers";
import { searchMods, getModDependencies, fetchModsBatch, type ModSearchResult, type ModDependency } from "../../api/modApi";
import { createMod, createModFromApi } from "../../utils/modUtils";
import type { Mod } from "../../types/serverConfig";
import type { FullStoreState } from "../types";

export const createModSlice: StateCreator<
  FullStoreState,
  [],
  [],
  Pick<FullStoreState, 'searchResults' | 'isSearching' | 'searchError' | 'isImportingBatch' | 'batchImportError' | 'searchMods' | 'addModFromSearch' | 'getModDependencies' | 'processModsWithDependencies' | 'importModsBatch' | 'importModsList' | 'reorderMods'>
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
  addModFromSearch: async (searchResult: ModSearchResult, options?: { includeDependencies?: boolean }) => {
    const includeDependencies = options?.includeDependencies ?? true;
    const mod = createMod(searchResult.modId, searchResult.modName);

    set((s) => {
      if (s.enabledMods.some(m => m.modId === mod.modId)) return s;
      return updateModsAndConfig(s.config, [...s.enabledMods, mod]);
    });

    if (includeDependencies) {
      try {
        const dependencies = await get().getModDependencies(searchResult.modId, searchResult.modName);
        const newMods = dependencies
          .filter(dep => !get().enabledMods.some(m => m.modId === dep.modId))
          .map(dep => createMod(dep.modId, dep.modName));

        if (newMods.length > 0) {
          set((s) => updateModsAndConfig(s.config, [...s.enabledMods, ...newMods]));
        }
      } catch (error) {
        console.warn('Error fetching dependencies:', error);
      }
    }
  },
  getModDependencies: async (modId: string, modName: string): Promise<ModDependency[]> => {
    try {
      return await getModDependencies(modId, modName);
    } catch (error) {
      console.error('Error fetching dependencies:', error);
      return [];
    }
  },
  processModsWithDependencies: async (mods: any[], existingModIds: Set<string>): Promise<{ mods: Mod[]; errors: string[] }> => {
    const successfulMods: Mod[] = [];
    const errors: string[] = [];
    const processedMods = new Set<string>(existingModIds);
    const modsToProcess = [...mods];

    while (modsToProcess.length > 0) {
      const current = modsToProcess.shift()!;
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

      successfulMods.push(createModFromApi(current));
      processedMods.add(modId);

      if (current.dependencies && Array.isArray(current.dependencies)) {
        for (const dep of current.dependencies) {
          if (!processedMods.has(dep.modId)) {
            try {
              const depResults = await fetchModsBatch([dep.modId]);
              const depResult = depResults[0];
              if (depResult.error) {
                errors.push(`Dependency ${dep.modId} for ${modId}: ${depResult.error}`);
              } else {
                modsToProcess.unshift(depResult);
              }
            } catch (error) {
              errors.push(`Error processing dependency ${dep.modId} for ${modId}: ${error}`);
            }
          }
        }
      }
    }

    return { mods: successfulMods, errors };
  },
  importModsBatch: async (modIds: string[]) => {
    if (!modIds?.length) {
      set({ batchImportError: "No mod IDs specified for import" });
      return;
    }

    const validModIds = [...new Set(
      modIds
        .map(id => id.trim())
        .filter(Boolean)
    )];

    if (!validModIds.length) {
      set({ batchImportError: "No valid mod IDs for import" });
      return;
    }

    set({ isImportingBatch: true, batchImportError: null });

    try {
      const results = await fetchModsBatch(validModIds);

      const existingMods = get().enabledMods;
      const existingModIds = new Set(existingMods.map(m => m.modId));

      const { mods: newMods, errors } = await get().processModsWithDependencies(
        results,
        existingModIds
      );

      if (newMods.length > 0) {
        set((s) => {
          const modsMap = new Map<string, Mod>();

          s.enabledMods.forEach(mod => modsMap.set(mod.modId, mod));

          newMods.forEach(mod => modsMap.set(mod.modId, mod));

          return updateModsAndConfig(s.config, Array.from(modsMap.values()));
        });
      }

      if (errors.length > 0) {
        set({
          isImportingBatch: false,
          batchImportError: `Import issues occurred:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...and ' + (errors.length - 5) + ' more errors' : ''}`
        });
      } else {
        set({
          isImportingBatch: false,
          batchImportError: null
        });
      }
    } catch (error) {
      set({
        isImportingBatch: false,
        batchImportError: error instanceof Error ? error.message : 'Batch import error'
      });
    }
  },
  importModsList: (mods: Mod[]) => {
    set((s) => updateModsAndConfig(s.config, mods));
  },
});
