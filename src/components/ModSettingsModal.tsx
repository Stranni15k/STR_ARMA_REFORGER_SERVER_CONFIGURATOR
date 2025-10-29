import React from "react";
import { useConfigStore } from "../store/configStore";

interface FieldConfig {
  type: 'number' | 'boolean' | 'string';
  default: any;
  label: string;
  min?: number;
  max?: number;
  step?: number;
}

interface ModSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  modName: string;
  fields: Record<string, any>;
}

export default function ModSettingsModal({ isOpen, onClose, modName, fields }: ModSettingsModalProps) {
  const { config, update } = useConfigStore();

  if (!isOpen) return null;

  const renderField = (fieldConfig: any, path: string): React.ReactElement | null => {
    if (fieldConfig && typeof fieldConfig === 'object' && !('type' in fieldConfig)) {
      return (
        <React.Fragment key={path}>
          {Object.entries(fieldConfig).map(([subKey, subConfig]) =>
            renderField(subConfig, path ? `${path}.${subKey}` : subKey)
          )}
        </React.Fragment>
      );
    }

    if (!fieldConfig || !('type' in fieldConfig)) return null;

    const field = fieldConfig as FieldConfig;
    const fullPath = `game.gameProperties.missionHeader.${path}`;
    const currentValue = getNestedValue(config.game.gameProperties.missionHeader, path);

    return (
      <div key={path} className="field-group">
        {field.type === 'boolean' ? (
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={currentValue === 1 || currentValue === true}
              onChange={e => update(fullPath, e.target.checked ? 1 : 0)}
            />
            <label className="form-check-label">{field.label}</label>
          </div>
        ) : (
          <>
            <label className="field-label">{field.label}</label>
            {field.type === 'number' ? (
            <input
              className="form-control"
              type="number"
              value={currentValue ?? field.default}
              min={field.min}
              max={field.max}
              step={field.step}
              onChange={e => update(fullPath, +e.target.value)}
            />
          ) : (
            <input
              className="form-control"
              type="text"
              value={currentValue ?? field.default}
              onChange={e => update(fullPath, e.target.value)}
            />
          )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="mods-modal">
      <div className="mods-modal-backdrop" onClick={onClose}></div>
      <div className="mods-modal-content">
        <div className="mods-modal-header">
          <h2>{modName} Settings</h2>
          <button className="btn btn-sm btn-close btn-close-white" onClick={onClose}></button>
        </div>
        
        <div className="mods-modal-body">
          {Object.entries(fields).map(([key, fieldConfig]) =>
            renderField(fieldConfig, key)
          )}
        </div>
      </div>
    </div>
  );
}

const getNestedValue = (obj: any, path: string): any =>
  path.split('.').reduce((curr, key) => curr?.[key], obj);
