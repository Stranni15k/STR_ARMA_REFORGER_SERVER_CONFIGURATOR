import type { ServerConfig, Mod } from "../types/serverConfig";
import { mergeMissionHeaderWithModConfigs } from "./modConfigs";

export const updateModsAndConfig = (
  config: ServerConfig,
  mods: Mod[]
) => ({
  enabledMods: mods,
  config: {
    ...config,
    game: {
      ...config.game,
      mods,
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
