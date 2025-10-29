export function supportedPlatforms(crossPlatform: boolean) {
  return crossPlatform ? ["PLATFORM_PC", "PLATFORM_XBL", "PLATFORM_PSN"] : ["PLATFORM_PC"];
}
