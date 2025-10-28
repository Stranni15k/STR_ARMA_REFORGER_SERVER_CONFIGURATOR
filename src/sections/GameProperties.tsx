import { useConfigStore } from "../store/configStore";

export default function GameProperties() {
  const { config, update } = useConfigStore();
  const p = config.game.gameProperties;
  return (
    <div className="fieldset-content">
        <div className="field-group">
          <label className="field-label">Server Max View Distance</label>
          <input className="form-control" type="number" value={p.serverMaxViewDistance}
                 onChange={e=>update("game.gameProperties.serverMaxViewDistance", +e.target.value)} />
        </div>

        <div className="field-group">
          <label className="field-label">Server Min Grass Distance</label>
          <input className="form-control" type="number" value={p.serverMinGrassDistance}
                 onChange={e=>update("game.gameProperties.serverMinGrassDistance", +e.target.value)} />
        </div>

        <div className="field-group">
          <label className="field-label">Network View Distance</label>
          <input className="form-control" type="number" value={p.networkViewDistance}
                 onChange={e=>update("game.gameProperties.networkViewDistance", +e.target.value)} />
        </div>

        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={p.disableThirdPerson ?? false}
                 onChange={e=>update("game.gameProperties.disableThirdPerson", e.target.checked)} />
          <label className="form-check-label">Disable Third Person</label>
        </div>

        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={p.fastValidation ?? false}
                 onChange={e=>update("game.gameProperties.fastValidation", e.target.checked)} />
          <label className="form-check-label">Fast Validation</label>
        </div>

        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={p.battlEye ?? true}
                 onChange={e=>update("game.gameProperties.battlEye", e.target.checked)} />
          <label className="form-check-label">BattlEye</label>
        </div>

        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={p.vonCanTransmitCrossFaction ?? false}
                 onChange={e=>update("game.gameProperties.vonCanTransmitCrossFaction", e.target.checked)} />
          <label className="form-check-label">VON Cross Faction</label>
        </div>

        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={p.vonDisableUI ?? false}
                 onChange={e=>update("game.gameProperties.vonDisableUI", e.target.checked)} />
          <label className="form-check-label">VON Disable UI</label>
        </div>

        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={p.vonDisableDirectSpeechUI ?? false}
                 onChange={e=>update("game.gameProperties.vonDisableDirectSpeechUI", e.target.checked)} />
          <label className="form-check-label">VON Disable Direct Speech UI</label>
        </div>
    </div>
  );
}
