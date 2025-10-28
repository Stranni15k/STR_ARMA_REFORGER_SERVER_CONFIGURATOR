import { DEFAULT_CONFIG } from "../utils/defaults";
import { useConfigStore } from "../store/configStore";

export default function ResetButton() {
  const setConfig = useConfigStore.setState;
  return (
    <button className="btn btn-danger btn-sm" onClick={() => setConfig({ config: DEFAULT_CONFIG })}>
      Reset
    </button>
  );
}
