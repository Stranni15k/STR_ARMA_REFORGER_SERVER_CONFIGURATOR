export type RconPermission =
  | "admin"
  | "monitor";

export interface Rcon {
  address: string;
  port: number;
  password: string;
  maxClients: number;
  whitelist?: string[];
  blacklist?: string[];
  permission?: RconPermission;
}

export interface A2S { address: string; port: number; }

export interface Mod { 
  modId: string; 
  name: string;
  version?: string;
  required?: boolean;
}

export interface MissionHeader {
  [key: string]: any;
}

export interface GameProperties {
  serverMaxViewDistance: number;
  serverMinGrassDistance: number;
  networkViewDistance: number;
  disableThirdPerson?: boolean;
  fastValidation?: boolean;
  battlEye?: boolean;
  vonCanTransmitCrossFaction?: boolean;
  vonDisableUI?: boolean;
  vonDisableDirectSpeechUI?: boolean;
  missionHeader?: MissionHeader;
}

export interface Game {
  name: string;
  password: string;
  passwordAdmin: string;
  admins?: string[];
  scenarioId: string;
  maxPlayers: number;
  visible?: boolean;
  modsRequiredByDefault?: boolean;
  crossPlatform?: boolean;
  supportedPlatforms?: string[];
  mods?: Mod[];
  gameProperties: GameProperties;
}

export interface Operating {
  lobbyPlayerSynchronise?: boolean;
  playerSaveTime: number;
  aiLimit: number;
  disableCrashReporter?: boolean;
  disableServerShutdown?: boolean;
  slotReservationTimeout: number;
  disableAI?: boolean;
  joinQueue: { maxSize: number };
  disableNavmeshStreaming?: string[];
}

export interface ServerConfig {
  bindAddress: string;
  bindPort: number;
  publicAddress: string;
  publicPort: number;
  a2s: A2S;
  rcon?: Rcon;
  game: Game;
  operating: Operating;
}