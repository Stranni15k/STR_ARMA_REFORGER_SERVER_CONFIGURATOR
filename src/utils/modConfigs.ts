import modConfigsData from '../../modConfigs.json';

interface ModConfigData {
  modIdPrefix: string;
  displayName: string;
  missionHeaderFields: Record<string, any>;
}

class ModConfig {
  readonly modIdPrefix: string;
  readonly displayName: string;
  readonly missionHeaderFields: Record<string, any>;
  
  constructor(data: ModConfigData) {
    this.modIdPrefix = data.modIdPrefix;
    this.displayName = data.displayName;
    this.missionHeaderFields = data.missionHeaderFields;
  }
  
  matches(modId: string): boolean {
    const cleanId = modId.replace(/^workshop\//, '');
    return cleanId.startsWith(this.modIdPrefix);
  }
  
  getDefaultConfig(): Record<string, any> {
    return this.extractDefaults(this.missionHeaderFields);
  }
  
  private extractDefaults(fields: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(fields)) {
      if (value && typeof value === 'object') {
        if ('default' in value) {
          result[key] = value.default;
        } else {
          result[key] = this.extractDefaults(value);
        }
      }
    }
    
    return result;
  }
  
  mergeConfig(existingHeader: Record<string, any> | undefined): Record<string, any> {
    const defaultConfig = this.getDefaultConfig();
    return this.deepMerge(existingHeader || {}, defaultConfig);
  }
  
  private deepMerge(existing: Record<string, any>, defaults: Record<string, any>): Record<string, any> {
    const result = { ...existing };
    
    for (const [key, value] of Object.entries(defaults)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.deepMerge(existing[key] || {}, value);
      } else if (!(key in existing)) {
        result[key] = value;
      }
    }
    
    return result;
  }
  
  getFieldsConfig(): Record<string, any> {
    return this.missionHeaderFields;
  }
}

const SUPPORTED_MODS: ModConfig[] = (modConfigsData.mods as ModConfigData[]).map(data => new ModConfig(data));
export function findModConfig(modId: string): ModConfig | undefined {
  return SUPPORTED_MODS.find(mod => mod.matches(modId));
}

export const hasModConfig = (modId: string): boolean => !!findModConfig(modId);

export const getModDisplayName = (modId: string): string | undefined => findModConfig(modId)?.displayName;
export const mergeMissionHeaderWithModConfigs = (
  existingHeader: Record<string, any> | undefined,
  modIds: string[]
): Record<string, any> | undefined => {
  const modsWithConfig = modIds.map(findModConfig).filter((c): c is ModConfig => !!c);
  return modsWithConfig.length === 0 ? existingHeader : modsWithConfig.reduce((header, mod) => mod.mergeConfig(header), existingHeader);
};

export const getModFieldsConfig = (modIds: string[]) =>
  modIds.map(id => findModConfig(id)).filter((c): c is ModConfig => !!c).map(c => ({ modName: c.displayName, fields: c.getFieldsConfig() }));
