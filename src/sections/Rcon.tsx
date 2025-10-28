import { useConfigStore } from "../store/configStore";

export default function Rcon() {
  const { config, update, toggleRconEnabled } = useConfigStore();
  const enabled = !!config.rcon;
  const rcon = config.rcon ?? { address:"", port:0, password:"", maxClients:10, permission:"admin" };

  return (
    <div className="fieldset-content">
        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={enabled}
                 onChange={e=>toggleRconEnabled(e.target.checked)} />
          <label className="form-check-label">Enabled</label>
        </div>

        {enabled && (
          <>
            <div className="field-group">
              <label className="field-label">Address</label>
              <input className="form-control" value={rcon.address} onChange={e=>update("rcon.address", e.target.value)} />
            </div>

            <div className="field-group">
              <label className="field-label">Port</label>
              <input className="form-control" type="number" value={rcon.port} onChange={e=>update("rcon.port", +e.target.value)} />
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <input className="form-control" type="password" value={rcon.password} onChange={e=>update("rcon.password", e.target.value)} />
            </div>

            <div className="field-group">
              <label className="field-label">Max Clients</label>
              <input className="form-control" type="number" value={rcon.maxClients} onChange={e=>update("rcon.maxClients", +e.target.value)} />
            </div>

            <div className="field-group">
              <label className="field-label">Permission</label>
              <select className="form-select" value={rcon.permission ?? "admin"}
                      onChange={e=>update("rcon.permission", e.target.value)}>
                <option value="admin">admin</option>
                <option value="moderator">moderator</option>
                <option value="observer">observer</option>
              </select>
            </div>
          </>
        )}
    </div>
  );
}
