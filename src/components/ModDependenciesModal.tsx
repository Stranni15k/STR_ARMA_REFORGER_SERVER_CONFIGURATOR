import type { ModSearchResult, ModDependency } from "../api/modApi";

interface ModDependenciesModalProps {
  isOpen: boolean;
  mod: ModSearchResult | null;
  deps: ModDependency[];
  onConfirm: (includeDependencies: boolean) => void;
  onClose: () => void;
}

export default function ModDependenciesModal({ isOpen, mod, deps, onConfirm, onClose }: ModDependenciesModalProps) {
  if (!isOpen || !mod) return null;

  return (
    <div className="mods-modal mods-modal--top mods-modal--narrow deps-modal">
      <div className="mods-modal-backdrop" onClick={onClose}></div>
      <div className="mods-modal-content">
        <div className="mods-modal-header">
          <h2>Mod Dependencies</h2>
          <button className="btn btn-sm btn-close btn-close-white" onClick={onClose}></button>
        </div>
        <div className="mods-modal-body">
          <div className="mb-3 deps-desc"><strong>{mod.modName}</strong> requires the following mods to work properly:</div>
          <div className="mods-container mb-3">
            {deps.map((dep) => (
              <div key={dep.modId} className="dep-card mb-2">
                <div className="dep-name">{dep.modName}</div>
                <div className="dep-id">{dep.modId}</div>
              </div>
            ))}
          </div>
          <div className="deps-separator" />
        </div>
        <div className="mods-modal-footer vertical">
          <button className="btn btn-affirm" onClick={() => onConfirm(true)}>
            Add with Dependencies
          </button>
          <button className="btn btn-secondary-ghost" onClick={() => onConfirm(false)}>
            Add Only This Mod
          </button>
        </div>
      </div>
    </div>
  );
}
