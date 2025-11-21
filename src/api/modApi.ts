import config from '../../config.json';

export interface ModSearchResult {
  modName: string;
  modId: string;
  author?: string;
  size?: string;
  image?: string;
  url: string;
}

export interface ModInfo {
  modId: string;
  modName: string;
  author?: string;
  version?: string;
  size?: string;
  url: string;
}

export const searchMods = async (query: string): Promise<ModSearchResult[]> => {
  if (!query.trim()) return [];

  const response = await fetch(`${config.apiUrl}/search?name=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};

export const fetchModsBatch = async (modIds: string[]): Promise<ModInfo[]> => {
  if (!modIds.length) return [];
  
  const response = await fetch(`${config.apiUrl}/mods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mods: modIds })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};
