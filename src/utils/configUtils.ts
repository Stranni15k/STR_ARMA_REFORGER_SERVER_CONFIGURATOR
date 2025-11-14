import { setByPath } from "../utils/pathSet";
import { supportedPlatforms } from "../utils/args";
import { DEFAULT_CONFIG } from "../utils/defaults";
import type { ServerConfig } from "../types/serverConfig";

export const updateConfig = (config: ServerConfig, path: string, value: any): ServerConfig => {
  if (path === "game.crossPlatform") {
    const cross = Boolean(value);
    const cfg = setByPath(config, path, cross);
    cfg.game.supportedPlatforms = supportedPlatforms(cross);
    return cfg;
  }
  if (path === "operating.disableNavmeshStreaming") {
    return setByPath(config, path, value);
  }
  return setByPath(config, path, value);
};

export const toggleOptionalSection = (
  config: ServerConfig,
  section: keyof ServerConfig,
  enabled: boolean,
  defaultValue?: any
): ServerConfig => {
  if (enabled) {
    return {
      ...config,
      [section]: config[section] ?? defaultValue ?? (DEFAULT_CONFIG as any)[section]
    };
  } else {
    const { [section]: _, ...rest } = config as any;
    return rest as ServerConfig;
  }
};

export const toggleGameProperty = (
  config: ServerConfig,
  property: string,
  enabled: boolean,
  defaultValue?: any
): ServerConfig => {
  if (enabled) {
    return {
      ...config,
      game: {
        ...config.game,
        [property]: config.game[property as keyof typeof config.game] ?? defaultValue ?? []
      }
    };
  } else {
    const { [property]: _, ...game } = config.game as any;
    return {
      ...config,
      game
    };
  }
};

export const toggleMissionHeader = (
  config: ServerConfig,
  enabled: boolean
): ServerConfig => {
  if (enabled) {
    return {
      ...config,
      game: {
        ...config.game,
        gameProperties: {
          ...config.game.gameProperties,
          missionHeader: {
            m_iPlayerCount: 40,
            m_eEditableGameFlags: 6,
            m_eDefaultGameFlags: 6
          }
        }
      }
    };
  } else {
    const { missionHeader, ...gameProperties } = config.game.gameProperties;
    return {
      ...config,
      game: {
        ...config.game,
        gameProperties
      }
    };
  }
};

export const rebuildConfigWithKeyOrder = (
  config: ServerConfig,
  keyOrder: string[],
  key: string,
  originalPos?: number
): { config: ServerConfig; keyOrder: string[] } => {
  const out: any = {};
  const used = new Set<string>();
  for (const k of keyOrder) {
    if (k in config) {
      out[k] = (config as any)[k];
      used.add(k);
    }
  }
  for (const k of Object.keys(config)) {
    if (!used.has(k)) out[k] = (config as any)[k];
  }

  let nextKeyOrder = [...keyOrder];
  if (!nextKeyOrder.includes(key)) {
    if (typeof originalPos === "number" && originalPos >= 0 && originalPos <= nextKeyOrder.length) {
      nextKeyOrder.splice(originalPos, 0, key);
    } else {
      nextKeyOrder.push(key);
    }
  }

  return { config: out as ServerConfig, keyOrder: nextKeyOrder };
};

export const cleanConfig = (config: any, defaults: any): void => {
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
