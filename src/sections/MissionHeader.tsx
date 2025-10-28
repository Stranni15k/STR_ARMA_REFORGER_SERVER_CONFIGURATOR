import { useConfigStore } from "../store/configStore";

export default function MissionHeader() {
  const { config, update, toggleMissionHeaderEnabled } = useConfigStore();
  const enabled = !!config.game.gameProperties.missionHeader;
  const h = config.game.gameProperties.missionHeader ?? {
    m_iPlayerCount: 40,
    m_eEditableGameFlags: 6,
    m_eDefaultGameFlags: 6,
    other: "values"
  };

  return (
    <div className="fieldset-content">
        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={enabled}
                 onChange={e=>toggleMissionHeaderEnabled(e.target.checked)} />
          <label className="form-check-label">Enabled</label>
        </div>

        {enabled && (
          <>
            <div className="field-group">
              <label className="field-label">Player Count</label>
              <input
                className="form-control"
                type="number"
                value={h.m_iPlayerCount ?? 40}
                onChange={(e) =>
                  update("game.gameProperties.missionHeader.m_iPlayerCount", +e.target.value)
                }
              />
            </div>

            <div className="field-group">
              <label className="field-label">Editable Game Flags</label>
              <input
                className="form-control"
                type="number"
                value={h.m_eEditableGameFlags ?? 6}
                onChange={(e) =>
                  update("game.gameProperties.missionHeader.m_eEditableGameFlags", +e.target.value)
                }
              />
            </div>

            <div className="field-group">
              <label className="field-label">Default Game Flags</label>
              <input
                className="form-control"
                type="number"
                value={h.m_eDefaultGameFlags ?? 6}
                onChange={(e) =>
                  update("game.gameProperties.missionHeader.m_eDefaultGameFlags", +e.target.value)
                }
              />
            </div>

            <div className="field-group">
              <label className="field-label">Other Values</label>
              <input
                className="form-control"
                value={h.other ?? "values"}
                onChange={(e) =>
                  update("game.gameProperties.missionHeader.other", e.target.value)
                }
              />
            </div>
          </>
        )}
    </div>
  );
}