import { useConfigStore } from "../store/configStore";
import { downloadJson } from "../utils/jsonIO";

export default function ExportButton() {
  const exportJson = useConfigStore(s => s.exportJson);
  return (
    <button className="btn btn-primary btn-sm" onClick={() => {
      const json = exportJson();
      if (json) downloadJson("server.json", json);
    }}>
      Save JSON
    </button>
  );
}
