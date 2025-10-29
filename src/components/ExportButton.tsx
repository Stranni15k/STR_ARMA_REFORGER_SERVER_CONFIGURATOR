import { useConfigStore } from "../store/configStore";
import { saveJsonWithDialog } from "../utils/jsonIO";

export default function ExportButton() {
  const exportJson = useConfigStore(s => s.exportJson);
  return (
    <button className="btn btn-primary btn-sm" onClick={async () => {
      const json = exportJson();
      if (json) await saveJsonWithDialog(json, "server.json");
    }}>
      Save JSON
    </button>
  );
}
