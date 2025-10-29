import { useState } from "react";
import { useConfigStore } from "../store/configStore";
import { getModFieldsConfig } from "../utils/modConfigs";
import ModSettingsModal from "../components/ModSettingsModal";

export default function MissionHeader() {
  const { config, update, toggleMissionHeaderEnabled } = useConfigStore();
  const enabled = !!config.game.gameProperties.missionHeader;
  const h = config.game.gameProperties.missionHeader ?? { m_iPlayerCount: 40, m_eEditableGameFlags: 6, m_eDefaultGameFlags: 6 };
  const modFieldsConfigs = getModFieldsConfig(config.game.mods?.map(m => m.modId) || []);
  const [activeModModal, setActiveModModal] = useState<{ modName: string; fields: Record<string, any> } | null>(null);

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

            {modFieldsConfigs.length > 0 && (
              <>
                <hr className="my-4" />
                <h6 className="section-title mb-3">Mod-Specific Settings</h6>
                <div className="d-flex flex-wrap gap-2">
                  {modFieldsConfigs.map((modConfig, index) => (
                    <button
                      key={index}
                      className="btn btn-outline-primary"
                      onClick={() => setActiveModModal({ modName: modConfig.modName, fields: modConfig.fields })}
                    >
                      {modConfig.modName} Settings
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
        
        {activeModModal && (
          <ModSettingsModal
            isOpen={true}
            onClose={() => setActiveModModal(null)}
            modName={activeModModal.modName}
            fields={activeModModal.fields}
          />
        )}
    </div>
  );
}