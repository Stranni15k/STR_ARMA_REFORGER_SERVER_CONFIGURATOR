export function downloadJson(filename: string, json: string) {
  const blob = new Blob([json], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

export async function saveJsonWithDialog(json: string, defaultName: string = "server.json") {
  try {
    if ('showSaveFilePicker' in window) {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: defaultName,
        types: [{
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] }
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
    } else {
      downloadJson(defaultName, json);
    }
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      console.error('Save failed:', err);
      downloadJson(defaultName, json);
    }
  }
}