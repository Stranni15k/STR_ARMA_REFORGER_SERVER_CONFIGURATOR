import type { ServerConfig, Mod } from "../types/serverConfig";
import { mergeMissionHeaderWithModConfigs } from "./modConfigs";

export const updateModsAndConfig = (
  config: ServerConfig,
  mods: Mod[]
) => ({
  enabledMods: mods.map(m => ({
    ...m,
    version: m.version ?? "",
    required: m.required ?? false
  })),
  config: {
    ...config,
    game: {
      ...config.game,
      mods: mods.map(m => ({
        ...m,
        version: m.version ?? "",
        required: m.required ?? false
      })),
      gameProperties: {
        ...config.game.gameProperties,
        missionHeader: mergeMissionHeaderWithModConfigs(
          config.game.gameProperties.missionHeader,
          mods.map(m => m.modId)
        )
      }
    }
  }
});
