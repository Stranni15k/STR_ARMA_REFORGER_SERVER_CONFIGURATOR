import { useConfigStore } from "../store/configStore";
import { useDebouncedArrayInput } from "../hooks/useDebouncedArrayInput";

export default function Game() {
  const { config, update, toggleAdminsEnabled } = useConfigStore();
  const g = config.game;
  const adminsEnabled = !!g.admins;
  
  const admins = useDebouncedArrayInput(g.admins, (values) => update("game.admins", values));
  return (
    <div className="fieldset-content">
        <div className="field-group">
          <label className="field-label">Server Name</label>
          <input className="form-control" value={g.name} onChange={e=>update("game.name", e.target.value)} />
        </div>

        <div className="field-group">
          <label className="field-label">Server Password</label>
          <input className="form-control" value={g.password} onChange={e=>update("game.password", e.target.value)} />
        </div>

        <div className="field-group">
          <label className="field-label">Admin Password</label>
          <input className="form-control" value={g.passwordAdmin} onChange={e=>update("game.passwordAdmin", e.target.value)} />
        </div>

        <div className="field-group">
          <label className="field-label">Max Players</label>
          <input className="form-control" type="number" value={g.maxPlayers} onChange={e=>update("game.maxPlayers", +e.target.value)} />
        </div>

        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={g.visible ?? true} onChange={e=>update("game.visible", e.target.checked)} />
          <label className="form-check-label">Visible</label>
        </div>

        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={g.crossPlatform ?? true} onChange={e=>update("game.crossPlatform", e.target.checked)} />
          <label className="form-check-label">Cross Platform</label>
        </div>

        <div className="field-group">
          <label className="field-label">Scenario ID</label>
          <input className="form-control" value={g.scenarioId} onChange={e=>update("game.scenarioId", e.target.value)} />
        </div>

        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={adminsEnabled}
                 onChange={e=>toggleAdminsEnabled(e.target.checked)} />
          <label className="form-check-label">Admins Enabled</label>
        </div>

        {adminsEnabled && (
          <div className="field-group">
            <label className="field-label">Admins (SteamIDs/XboxIDs)</label>
            <input 
              className="form-control" 
              value={admins.input}
              onChange={e => admins.handleChange(e.target.value)}
              placeholder="Enter IDs separated by commas"
            />
          </div>
        )}

        <div className="form-check mt-2">
          <input className="form-check-input" type="checkbox" checked={g.modsRequiredByDefault ?? true}
                 onChange={e=>update("game.modsRequiredByDefault", e.target.checked)} />
          <label className="form-check-label">Mods required by default</label>
        </div>
    </div>
  );
}
