import { zServerConfig } from "../utils/schema";
import { DEFAULT_CONFIG } from "../utils/defaults";
import { mergeMissionHeaderWithModConfigs } from "../utils/modConfigs";
import type { ServerConfig, Mod } from "../types/serverConfig";
import { supportedPlatforms as computePlatforms } from "../utils/args";

export const mergeDefaults = (parsed: any): void => {
  if (!parsed.operating) {
    parsed.operating = DEFAULT_CONFIG.operating;
  }

  if (typeof parsed.game.modsRequiredByDefault !== "boolean") {
    parsed.game.modsRequiredByDefault = DEFAULT_CONFIG.game.modsRequiredByDefault;
  }
  if (typeof parsed.game.crossPlatform !== "boolean") {
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
    const gp = parsed.game.gameProperties;
    
    if (gp.hasOwnProperty('vonCanTransmitCrossFaction')) {
      if (!gp.hasOwnProperty('VONCanTransmitCrossFaction')) {
        gp.VONCanTransmitCrossFaction = gp.vonCanTransmitCrossFaction;
      }
      delete gp.vonCanTransmitCrossFaction;
    }
    
    if (gp.hasOwnProperty('vonDisableUI')) {
      if (!gp.hasOwnProperty('VONDisableUI')) {
        gp.VONDisableUI = gp.vonDisableUI;
      }
      delete gp.vonDisableUI;
    }
    
    if (gp.hasOwnProperty('vonDisableDirectSpeechUI')) {
      if (!gp.hasOwnProperty('VONDisableDirectSpeechUI')) {
        gp.VONDisableDirectSpeechUI = gp.vonDisableDirectSpeechUI;
      }
      delete gp.vonDisableDirectSpeechUI;
    }

    if (!gp.missionHeader) {
      gp.missionHeader = DEFAULT_CONFIG.game.gameProperties.missionHeader;
    } else if (Object.keys(gp.missionHeader).length === 0) {
      gp.missionHeader = DEFAULT_CONFIG.game.gameProperties.missionHeader;
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
};

export const importJson = (json: string): { config: ServerConfig; enabledMods: Mod[]; keyOrder: string[]; originalKeyPositions: Record<string, number> } | null => {
  const parsed = JSON.parse(json);

  mergeDefaults(parsed);

  const cross = Boolean(parsed?.game?.crossPlatform);
  if (!parsed.game.supportedPlatforms) {
    parsed.game.supportedPlatforms = computePlatforms(cross);
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
    return null;
  }

  const enabled = res.data.game.mods || [];
  const topKeys = Object.keys(parsed);
  const originalKeyPositions = Object.fromEntries(topKeys.map((k, i) => [k, i]));

  return {
    config: res.data,
    enabledMods: enabled,
    keyOrder: topKeys,
    originalKeyPositions,
  };
};

export const exportJson = (config: ServerConfig): string | null => {
  const res = zServerConfig.safeParse(config);
  if (!res.success) {
    alert("Export failed: " + res.error.issues[0].message);
    return null;
  }
  return JSON.stringify(res.data, null, 2);
};
