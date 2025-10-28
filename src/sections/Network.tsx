import { useConfigStore } from "../store/configStore";

export default function Network() {
  const { config, update } = useConfigStore();
  return (
    <div className="fieldset-content">
        <div className="field-group">
          <label className="field-label">Bind Address</label>
          <input className="form-control" value={config.bindAddress}
                 onChange={e=>update("bindAddress", e.target.value)} />
        </div>

        <div className="field-group">
          <label className="field-label">Bind Port</label>
          <input className="form-control" type="number" value={config.bindPort}
                 onChange={e=>update("bindPort", +e.target.value)} />
        </div>

        <div className="field-group">
          <label className="field-label">Public Address</label>
          <input className="form-control" value={config.publicAddress}
                 onChange={e=>update("publicAddress", e.target.value)} />
        </div>

        <div className="field-group">
          <label className="field-label">Public Port</label>
          <input className="form-control" type="number" value={config.publicPort}
                 onChange={e=>update("publicPort", +e.target.value)} />
        </div>
    </div>
  );
}
