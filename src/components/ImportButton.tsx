import { useConfigStore } from "../store/configStore";

export default function ImportButton() {
  const importJson = useConfigStore(s => s.importJson);
  return (
    <label style={{ cursor:"pointer" }}>
      <input type="file" accept=".json" hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = ev => importJson(String(ev.target?.result ?? ""));
          r.readAsText(f);
        }}/>
      <span className="btn btn-outline-light btn-sm">Import JSON</span>
    </label>
  );
}
