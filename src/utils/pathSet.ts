export function setByPath<T extends object>(obj: T, path: string, value: any): T {
    const parts = path.split(".");
    const draft: any = structuredClone(obj);
    let cur = draft;
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
    cur[parts[parts.length - 1]] = value;
    return draft as T;
  }
  