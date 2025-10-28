import type { ServerConfig } from "../types/serverConfig";

export function supportedPlatforms(crossPlatform: boolean) {
  return crossPlatform ? ["PLATFORM_PC", "PLATFORM_XBL", "PLATFORM_PSN"] : ["PLATFORM_PC"];
}

export function computeDisableNavmeshToggle(disableNavmeshStreaming?: string[] | null) {
  return disableNavmeshStreaming != null; // null/undefined -> disabled; [] or array -> enabled
}

export function createNoBackendArgs(cfg: ServerConfig) {
  const ids = (cfg.game.mods || []).map(m => m.modId);
  const mods = ["NO_BACKEND_SCENARIO_LOADER", ...ids].join(",");
  return [
    `-adminPassword "${cfg.game.passwordAdmin}"`,
    `-addons ${mods}`,
    `-server worlds/NoBackendScenarioLoader.ent`,
    `-scenarioId ${cfg.game.scenarioId}`,
    `-bindIP ${cfg.bindAddress}`,
    `-publicAddress ${cfg.publicAddress}`,
  ].join(" ");
}
