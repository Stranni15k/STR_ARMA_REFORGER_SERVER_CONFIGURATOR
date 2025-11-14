import type { Mod } from "../types/serverConfig";

export const createMod = (modId: string, name: string, version?: string, required?: boolean): Mod => ({
  modId,
  name,
  version: version || "",
  required: required || false
});

export const createModFromApi = (apiResult: any): Mod => ({
  modId: apiResult.modId,
  name: apiResult.modName || apiResult.name,
  version: apiResult.version || "",
  required: apiResult.required || false
});
