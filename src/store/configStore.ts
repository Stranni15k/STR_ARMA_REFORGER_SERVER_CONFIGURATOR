import { create } from "zustand";
import { zServerConfig } from "../utils/schema";
import { DEFAULT_CONFIG } from "../utils/defaults";
import { setByPath } from "../utils/pathSet";
import type { ServerConfig, Mod } from "../types/serverConfig";
import { supportedPlatforms } from "../utils/args";
import { mergeMissionHeaderWithModConfigs, findModConfig } from "../utils/modConfigs";
import { updateModsAndConfig } from "../utils/storeHelpers";
import { searchMods, getModDependencies, fetchModsBatch, type ModSearchResult, type ModDependency } from "../api/modApi";

const STORAGE_KEY = "arfc:state";

const loadFromLocalStorage = (): { config: ServerConfig; enabledMods: Mod[]; keyOrder?: string[]; originalKeyPositions?: Record<string, number> } | null => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    const res = zServerConfig.safeParse(parsed.config);
    if (!res.success) return null;
    const keyOrder = Array.isArray(parsed.keyOrder)
      ? parsed.keyOrder
      : Object.keys(parsed.config ?? res.data);
    const originalKeyPositions = parsed.originalKeyPositions
      ? parsed.originalKeyPositions
      : Object.fromEntries(keyOrder.map((k: string, i: number) => [k, i]));

    return {
      config: res.data,
      enabledMods: Array.isArray(parsed.enabledMods) ? parsed.enabledMods : [],
      keyOrder,
      originalKeyPositions,
    };
  } catch (e) {
    console.warn("Failed to load persisted state:", e);
    return null;
  }
};

interface ConfigState {
  config: ServerConfig;
  enabledMods: Mod[];
  searchResults: ModSearchResult[];
  isSearching: boolean;
  searchError: string | null;
  isImportingBatch: boolean;
  batchImportError: string | null;
  keyOrder: string[];
  originalKeyPositions: Record<string, number>;
  toggleRconEnabled: (enabled: boolean) => void;
  toggleMissionHeaderEnabled: (enabled: boolean) => void;
  update: (path: string, value: any) => void;
  importJson: (json: string) => void;
  exportJson: () => string | null;
  removeMod: (mod: Mod) => void;
  importModsList: (mods: Mod[]) => void;
  setNavmeshToggle: (enabled: boolean) => void;
  searchMods: (query: string) => Promise<void>;
  addModFromSearch: (searchResult: ModSearchResult) => Promise<void>;
  importModsBatch: (modIds: string[]) => Promise<void>;
  getModDependencies: (modId: string, modName: string) => Promise<ModDependency[]>;
  processModsWithDependencies: (mods: any[], existingModIds: Set<string>) => Promise<{ mods: Mod[]; errors: string[] }>;
  toggleAdminsEnabled: (enabled: boolean) => void;
}

const _persisted = loadFromLocalStorage();

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: _persisted?.config ?? DEFAULT_CONFIG,
  enabledMods: _persisted?.enabledMods ?? [],
  keyOrder: _persisted?.keyOrder ?? Object.keys(_persisted?.config ?? DEFAULT_CONFIG),
  originalKeyPositions:
    _persisted?.originalKeyPositions ?? Object.fromEntries(
      Object.keys(_persisted?.config ?? DEFAULT_CONFIG).map((k, i) => [k, i])
    ),
  searchResults: [],
  isSearching: false,
  searchError: null,
  isImportingBatch: false,
  batchImportError: null,
  toggleRconEnabled: (enabled) =>
    set((s) => {
      const rebuild = (cfg: any, keyOrder: string[]) => {
        const out: any = {};
        const used = new Set<string>();
        for (const k of keyOrder) {
          if (k in cfg) {
            out[k] = (cfg as any)[k];
            used.add(k);
          }
        }
        for (const k of Object.keys(cfg)) {
          if (!used.has(k)) out[k] = (cfg as any)[k];
        }
        return out as ServerConfig;
      };

      if (enabled) {
        const cfgWithRcon = { ...s.config, rcon: s.config.rcon ?? DEFAULT_CONFIG.rcon! };
        const originalPos = s.originalKeyPositions?.["rcon"];
        let nextKeyOrder = [...s.keyOrder];
        if (!nextKeyOrder.includes("rcon")) {
          if (typeof originalPos === "number" && originalPos >= 0 && originalPos <= nextKeyOrder.length) {
            nextKeyOrder.splice(originalPos, 0, "rcon");
          } else {
            nextKeyOrder.push("rcon");
          }
        }
        return { config: rebuild(cfgWithRcon, nextKeyOrder), keyOrder: nextKeyOrder };
      } else {
        const { rcon, ...rest } = s.config as any;
        const nextKeyOrder = s.keyOrder.filter((k) => k !== "rcon");
        return { config: rest as ServerConfig, keyOrder: nextKeyOrder };
      }
    }),
  update: (path, value) =>
    set((s) => {
      if (path === "game.crossPlatform") {
        const cross = Boolean(value);
        const cfg = setByPath(s.config, path, cross);
        cfg.game.supportedPlatforms = supportedPlatforms(cross);
        return { config: cfg };
      }
      if (path === "operating.disableNavmeshStreaming") {
        return { config: setByPath(s.config, path, value) };
      }
      return { config: setByPath(s.config, path, value) };
    }),
  importJson: (json) => {
    const parsed = JSON.parse(json);
    
    if (!parsed.operating) {
      parsed.operating = DEFAULT_CONFIG.operating;
    }
    
    if (!parsed.game.modsRequiredByDefault) {
      parsed.game.modsRequiredByDefault = DEFAULT_CONFIG.game.modsRequiredByDefault;
    }
    if (!parsed.game.crossPlatform) {
      parsed.game.crossPlatform = DEFAULT_CONFIG.game.crossPlatform;
    }
    if (!parsed.game.supportedPlatforms) {
      parsed.game.supportedPlatforms = DEFAULT_CONFIG.game.supportedPlatforms;
    }
    if (!parsed.game.mods) {
      parsed.game.mods = [];
    } else if (Array.isArray(parsed.game.mods)) {
      parsed.game.mods = parsed.game.mods.map((m: any) => ({
        modId: m.modId,
        name: m.name,
        version: typeof m.version === "string" ? m.version : "",
        required: typeof m.required === "boolean" ? m.required : false
      }));
    }
    
    if (parsed.game.gameProperties) {
      if (!parsed.game.gameProperties.missionHeader) {
        parsed.game.gameProperties.missionHeader = DEFAULT_CONFIG.game.gameProperties.missionHeader;
      } else if (Object.keys(parsed.game.gameProperties.missionHeader).length === 0) {
        parsed.game.gameProperties.missionHeader = DEFAULT_CONFIG.game.gameProperties.missionHeader;
      }
    }
    
    if (parsed.rcon) {
      if (!parsed.rcon.maxClients) {
        parsed.rcon.maxClients = 10;
      }
      if (parsed.rcon.permission && 
          !["admin", "monitor"].includes(parsed.rcon.permission)) {
        parsed.rcon.permission = "admin";
      }
    }
    
    const modIds = (parsed.game.mods || []).map((m: any) => m.modId);
    const updatedMissionHeader = mergeMissionHeaderWithModConfigs(
      parsed.game.gameProperties?.missionHeader,
      modIds
    );
    
    if (updatedMissionHeader) {
      if (!parsed.game.gameProperties) {
        parsed.game.gameProperties = DEFAULT_CONFIG.game.gameProperties;
      }
      parsed.game.gameProperties.missionHeader = updatedMissionHeader;
    }
    
    const res = zServerConfig.safeParse(parsed);
    if (!res.success) {
      console.error("Validation error:", res.error.issues);
      alert("Config validation failed: " + res.error.issues[0].message);
      return;
    }
    
    const enabled = res.data.game.mods || [];
    const topKeys = Object.keys(parsed);
    const originalKeyPositions = Object.fromEntries(topKeys.map((k, i) => [k, i]));
    set({
      config: res.data,
      enabledMods: enabled,
      keyOrder: topKeys,
      originalKeyPositions,
    });
  },
  exportJson: () => {
    const res = zServerConfig.safeParse(get().config);
    if (!res.success) {
      alert("Export failed: " + res.error.issues[0].message);
      return null;
    }
    return JSON.stringify(res.data, null, 2);
  },
  removeMod: (mod) => set((s) => {
    const modConfig = findModConfig(mod.modId);
    const updatedMods = s.enabledMods.filter(m => m.modId !== mod.modId);
    
    if (modConfig) {
      const currentHeader = s.config.game.gameProperties?.missionHeader || {};
      const defaultConfig = modConfig.getDefaultConfig();
      
      const newHeader = JSON.parse(JSON.stringify(currentHeader));
      
      const cleanConfig = (config: any, defaults: any) => {
        for (const [key, value] of Object.entries(defaults)) {
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            if (key in config) {
              if (Object.keys(value).length === 0) {
                delete config[key];
              } else {
                cleanConfig(config[key], value);
                if (Object.keys(config[key]).length === 0) {
                  delete config[key];
                }
              }
            }
          } else if (key in config && JSON.stringify(config[key]) === JSON.stringify(value)) {
            delete config[key];
          }
        }
      };
      
      cleanConfig(newHeader, defaultConfig);
      
      const newConfig = {
        ...s.config,
        game: {
          ...s.config.game,
          gameProperties: {
            ...s.config.game.gameProperties,
            missionHeader: newHeader
          }
        }
      };
      
      return updateModsAndConfig(newConfig, updatedMods);
    }
    
    return updateModsAndConfig(s.config, updatedMods);
  }),
  importModsList: (mods) => set((s) => updateModsAndConfig(s.config, mods)),
  setNavmeshToggle: (enabled) =>
    set((s) => {
      if (enabled) {
        return {
          config: {
            ...s.config,
            operating: {
              ...s.config.operating,
              disableNavmeshStreaming: s.config.operating.disableNavmeshStreaming ?? [],
            },
          },
        };
      } else {
        const { disableNavmeshStreaming, ...operating } = s.config.operating;
        return {
          config: {
            ...s.config,
            operating,
          },
        };
      }
    }),
  toggleMissionHeaderEnabled: (enabled) =>
    set((s) => {
      if (enabled) {
        return {
          config: {
            ...s.config,
            game: {
              ...s.config.game,
              gameProperties: {
                ...s.config.game.gameProperties,
                missionHeader: {
                  m_iPlayerCount: 40,
                  m_eEditableGameFlags: 6,
                  m_eDefaultGameFlags: 6
                },
              },
            },
          },
        };
      } else {
        const { missionHeader, ...gameProperties } = s.config.game.gameProperties;
        return {
          config: {
            ...s.config,
            game: {
              ...s.config.game,
              gameProperties,
            },
          },
        };
      }
    }),
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
    const mod: Mod = { modId: searchResult.modId, name: searchResult.modName, version: "", required: false };
    
    set((s) => {
      if (s.enabledMods.some(m => m.modId === mod.modId)) return s;
      return updateModsAndConfig(s.config, [...s.enabledMods, mod]);
    });

    try {
      const dependencies = await get().getModDependencies(searchResult.modId, searchResult.modName);
      const newMods = dependencies
        .filter(dep => !get().enabledMods.some(m => m.modId === dep.modId))
        .map(dep => ({ modId: dep.modId, name: dep.modName, version: "", required: false }));

      if (newMods.length > 0) {
        set((s) => updateModsAndConfig(s.config, [...s.enabledMods, ...newMods]));
      }
    } catch (error) {
      console.warn('Error fetching dependencies:', error);
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

      successfulMods.push({
        modId: current.modId,
        name: current.modName,
        version: current.version || "",
        required: current.required || false
      });
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
      set({ batchImportError: "Не указаны ID модов для импорта" });
      return;
    }

    const validModIds = [...new Set(
      modIds
        .map(id => id.trim())
        .filter(Boolean)
    )];

    if (!validModIds.length) {
      set({ batchImportError: "Нет валидных ID модов для импорта" });
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
          batchImportError: `При импорте возникли проблемы:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...и ещё ' + (errors.length - 5) + ' ошибок' : ''}`
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
  toggleAdminsEnabled: (enabled) =>
    set((s) => {
      if (enabled) {
        return {
          config: {
            ...s.config,
            game: {
              ...s.config.game,
              admins: s.config.game.admins ?? [],
            },
          },
        };
      } else {
        const { admins, ...game } = s.config.game;
        return {
          config: {
            ...s.config,
            game,
          },
        };
      }
    }),
}));

try {
  useConfigStore.subscribe((state) => {
    try {
      if (typeof window === "undefined" || !window.localStorage) return;
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          config: state.config,
          enabledMods: state.enabledMods,
          keyOrder: state.keyOrder,
          originalKeyPositions: state.originalKeyPositions,
        })
      );
    } catch (e) {
      console.warn("Failed to persist config to localStorage:", e);
    }
  });
} catch (e) {
  console.warn("Could not attach localStorage persistence:", e);
}