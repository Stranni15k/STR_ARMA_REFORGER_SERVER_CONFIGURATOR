import { useConfigStore } from "../store/configStore";

export default function A2S() {
  const { config, update } = useConfigStore();
  return (
    <div className="fieldset-content">
        <div className="field-group">
          <label className="field-label">Address</label>
          <input className="form-control" value={config.a2s.address}
                 onChange={e=>update("a2s.address", e.target.value)} />
        </div>

        <div className="field-group">
          <label className="field-label">Port</label>
          <input className="form-control" type="number" value={config.a2s.port}
                 onChange={e=>update("a2s.port", +e.target.value)} />
        </div>
    </div>
  );
}
