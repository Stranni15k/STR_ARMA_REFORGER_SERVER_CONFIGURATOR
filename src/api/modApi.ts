import config from '../../config.json';

export interface ModSearchResult {
  author: string;
  modId: string;
  modName: string;
  size: string;
  image: string;
  url: string;
}

export interface ModDependency {
  modId: string;
  modName: string;
  url: string;
}

export const searchMods = async (query: string): Promise<ModSearchResult[]> => {
  if (!query.trim()) return [];

  const response = await fetch(`${config.apiUrl}/search?name=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.Content || data.content || []);
};

export const getModDependencies = async (modId: string, modName: string): Promise<ModDependency[]> => {
  const response = await fetch(`${config.apiUrl}/mod`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      modId,
      modName
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.dependencies || [];
};

export const fetchModsBatch = async (modIds: string[]): Promise<any[]> => {
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
