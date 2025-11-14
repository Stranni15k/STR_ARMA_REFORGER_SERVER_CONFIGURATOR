import type { StateCreator } from "zustand";
import { findModConfig } from "../../utils/modConfigs";
import { updateModsAndConfig } from "../../utils/storeHelpers";
import { importJson, exportJson } from "../../services/configService";
import { updateConfig, toggleOptionalSection, toggleGameProperty, toggleMissionHeader, rebuildConfigWithKeyOrder, cleanConfig } from "../../utils/configUtils";
import type { Mod } from "../../types/serverConfig";
import type { FullStoreState } from "../types";

export const createConfigSlice: StateCreator<
  FullStoreState,
  [],
  [],
  Pick<FullStoreState, 'keyOrder' | 'originalKeyPositions' | 'toggleRconEnabled' | 'update' | 'importJson' | 'exportJson' | 'removeMod' | 'setNavmeshToggle' | 'toggleMissionHeaderEnabled' | 'toggleAdminsEnabled'>
> = (set, get) => ({
  keyOrder: [],
  originalKeyPositions: {},
  toggleRconEnabled: (enabled: boolean) => {
    set((s) => {
      if (enabled) {
        const cfgWithRcon = toggleOptionalSection(s.config, "rcon", true);
        const originalPos = s.originalKeyPositions?.["rcon"];
        const { config, keyOrder } = rebuildConfigWithKeyOrder(cfgWithRcon, s.keyOrder, "rcon", originalPos);
        return { config, keyOrder };
      } else {
        const cfgWithoutRcon = toggleOptionalSection(s.config, "rcon", false);
        const nextKeyOrder = s.keyOrder.filter((k) => k !== "rcon");
        return { config: cfgWithoutRcon, keyOrder: nextKeyOrder };
      }
    });
  },
  update: (path: string, value: any) => {
    set((s) => ({ config: updateConfig(s.config, path, value) }));
  },
  importJson: (json: string) => {
    const result = importJson(json);
    if (result) {
      set(result);
    }
  },
  exportJson: () => exportJson(get().config),
  removeMod: (mod: Mod) => {
    set((s) => {
      const modConfig = findModConfig(mod.modId);
      const updatedMods = s.enabledMods.filter(m => m.modId !== mod.modId);

      if (modConfig) {
        const currentHeader = s.config.game.gameProperties?.missionHeader || {};
        const defaultConfig = modConfig.getDefaultConfig();

        const newHeader = JSON.parse(JSON.stringify(currentHeader));

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
    });
  },
  setNavmeshToggle: (enabled: boolean) => {
    set((s) => ({ config: toggleGameProperty(s.config, "disableNavmeshStreaming", enabled, []) }));
  },
  toggleMissionHeaderEnabled: (enabled: boolean) => {
    set((s) => ({ config: toggleMissionHeader(s.config, enabled) }));
  },
  toggleAdminsEnabled: (enabled: boolean) => {
    set((s) => ({ config: toggleGameProperty(s.config, "admins", enabled, []) }));
  },
});
