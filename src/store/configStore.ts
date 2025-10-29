import { create } from "zustand";
import { zServerConfig } from "../utils/schema";
import { DEFAULT_CONFIG } from "../utils/defaults";
import { setByPath } from "../utils/pathSet";
import type { ServerConfig, Mod } from "../types/serverConfig";
import { supportedPlatforms } from "../utils/args";

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

interface ModSearchResult {
  author: string;
  modId: string;
  modName: string;
  size: string;
  image: string;
  url: string;
}

interface ModDependency {
  modId: string;
  modName: string;
  url: string;
}

interface ConfigState {
  config: ServerConfig;
  enabledMods: Mod[];
  searchResults: ModSearchResult[];
  isSearching: boolean;
  searchError: string | null;
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
  getModDependencies: (modId: string, modName: string) => Promise<ModDependency[]>;
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
    
    const res = zServerConfig.safeParse(parsed);
    if (!res.success) {
      console.error("Validation error:", res.error.issues);
      alert("Конфиг не прошёл валидацию: " + res.error.issues[0].message);
      return;
    }
    
    const enabled = res.data.game.mods;
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
      alert("Экспорт невозможен: " + res.error.issues[0].message);
      return null;
    }
    return JSON.stringify(res.data, null, 2);
  },
  removeMod: (mod) =>
    set((s) => {
      const nextEnabled = s.enabledMods.filter(m => m.modId !== mod.modId);
      return {
        enabledMods: nextEnabled,
        config: {
          ...s.config,
          game: { ...s.config.game, mods: nextEnabled },
        },
      };
    }),
  importModsList: (mods) =>
    set((s) => {
      return {
        enabledMods: mods,
        config: {
          ...s.config,
          game: { ...s.config.game, mods },
        },
      };
    }),
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
                missionHeader: s.config.game.gameProperties.missionHeader ?? {
                  m_iPlayerCount: 40,
                  m_eEditableGameFlags: 6,
                  m_eDefaultGameFlags: 6,
                  other: "values"
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
      const response = await fetch(`http://127.0.0.1:5000/search?name=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const results = Array.isArray(data) ? data : (data.Content || data.content || []);
      set({ 
        searchResults: results, 
        isSearching: false,
        searchError: null 
      });
    } catch (error) {
      set({ 
        searchResults: [], 
        isSearching: false,
        searchError: error instanceof Error ? error.message : 'Ошибка поиска модов'
      });
    }
  },
  addModFromSearch: async (searchResult: ModSearchResult) => {
    const mod: Mod = {
      modId: searchResult.modId,
      name: searchResult.modName
    };
    
    set((s) => {
      const isAlreadyAdded = s.enabledMods.some(m => m.modId === mod.modId);
      if (isAlreadyAdded) {
        return s;
      }
      
      const nextEnabledMods = [...s.enabledMods, mod];
      return {
        enabledMods: nextEnabledMods,
        config: {
          ...s.config,
          game: { 
            ...s.config.game, 
            mods: nextEnabledMods 
          },
        },
      };
    });

    try {
      const dependencies = await get().getModDependencies(searchResult.modId, searchResult.modName);
      if (dependencies.length > 0) {
        const newMods: Mod[] = [];
        
        dependencies.forEach(dep => {
          const isAlreadyAdded = get().enabledMods.some(m => m.modId === dep.modId);
          if (!isAlreadyAdded) {
            newMods.push({
              modId: dep.modId,
              name: dep.modName
            });
          }
        });

        if (newMods.length > 0) {
          set((s) => {
            const nextEnabledMods = [...s.enabledMods, ...newMods];
            return {
              enabledMods: nextEnabledMods,
              config: {
                ...s.config,
                game: { 
                  ...s.config.game, 
                  mods: nextEnabledMods 
                },
              },
            };
          });
        }
      }
    } catch (error) {
      console.warn('Ошибка при получении зависимостей:', error);
    }
  },
  getModDependencies: async (modId: string, modName: string): Promise<ModDependency[]> => {
    try {
      const response = await fetch('http://127.0.0.1:5000/mod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modId,
          modName
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.dependencies || [];
    } catch (error) {
      console.error('Ошибка при получении зависимостей:', error);
      return [];
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