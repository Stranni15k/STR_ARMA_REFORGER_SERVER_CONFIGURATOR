import { useConfigStore } from "../store/configStore";
import { useDebouncedArrayInput } from "../hooks/useDebouncedArrayInput";

export default function Operating() {
  const { config, update, setNavmeshToggle } = useConfigStore();
  const o = config.operating;
  const navmeshEnabled = Array.isArray(o.disableNavmeshStreaming);
  
  const navmesh = useDebouncedArrayInput(o.disableNavmeshStreaming, (values) => 
    update("operating.disableNavmeshStreaming", values)
  );

  return (
    <div className="fieldset-content">
        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={o.lobbyPlayerSynchronise ?? true}
                 onChange={e=>update("operating.lobbyPlayerSynchronise", e.target.checked)} />
          <label className="form-check-label">Lobby Player Synchronise</label>
        </div>

        <div className="field-group">
          <label className="field-label">Player Save Time (s)</label>
          <input className="form-control" type="number" value={o.playerSaveTime}
                 onChange={e=>update("operating.playerSaveTime", +e.target.value)} />
        </div>

        <div className="field-group">
          <label className="field-label">AI Limit</label>
          <input className="form-control" type="number" value={o.aiLimit}
                 onChange={e=>update("operating.aiLimit", +e.target.value)} />
        </div>

        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={o.disableCrashReporter ?? false}
                 onChange={e=>update("operating.disableCrashReporter", e.target.checked)} />
          <label className="form-check-label">Disable Crash Reporter</label>
        </div>

        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={o.disableServerShutdown ?? false}
                 onChange={e=>update("operating.disableServerShutdown", e.target.checked)} />
          <label className="form-check-label">Disable Server Shutdown</label>
        </div>

        <div className="field-group">
          <label className="field-label">Slot Reservation Timeout (s)</label>
          <input className="form-control" type="number" value={o.slotReservationTimeout}
                 onChange={e=>update("operating.slotReservationTimeout", +e.target.value)} />
        </div>

        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={o.disableAI ?? false}
                 onChange={e=>update("operating.disableAI", e.target.checked)} />
          <label className="form-check-label">Disable AI</label>
        </div>

        <div className="field-group">
          <label className="field-label">Join Queue Max Size</label>
          <input className="form-control" type="number" value={o.joinQueue.maxSize}
                 onChange={e=>update("operating.joinQueue.maxSize", +e.target.value)} />
        </div>

        <hr />

        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={navmeshEnabled}
                 onChange={e=>setNavmeshToggle(e.target.checked)} />
          <label className="form-check-label">Disable Navmesh Streaming (toggle)</label>
        </div>
        {navmeshEnabled && (
          <div className="field-group">
            <label className="field-label">List (comma separated)</label>
            <input 
              className="form-control" 
              value={navmesh.input}
              onChange={e => navmesh.handleChange(e.target.value)}
              placeholder="Enter values separated by commas"
            />
          </div>
        )}
    </div>
  );
}
