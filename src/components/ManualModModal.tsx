import { useState } from "react";
import { useConfigStore } from "../store/configStore";

interface ManualModModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManualModModal({ isOpen, onClose }: ManualModModalProps) {
  const { addManualMod, enabledMods } = useConfigStore();
  const [modId, setModId] = useState("");
  const [modName, setModName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!modId.trim() || !modName.trim()) {
      setError("Both Mod ID and Mod Name are required");
      return;
    }

    if (enabledMods.some(m => m.modId === modId.trim())) {
      setError("A mod with this ID is already enabled");
      return;
    }

    try {
      addManualMod(modId.trim(), modName.trim());
      setModId("");
      setModName("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add mod");
    }
  };

  const handleClose = () => {
    setModId("");
    setModName("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="manual-mod-modal">
      <div className="manual-mod-modal-backdrop" onClick={handleClose}></div>
      <div className="manual-mod-modal-content">
        <div className="manual-mod-modal-header">
          <h5>Add Mod Manually</h5>
          <button type="button" className="btn-close" onClick={handleClose}></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="manual-mod-modal-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <div className="mb-3">
              <label htmlFor="modId" className="form-label">Mod ID</label>
              <input
                type="text"
                className="form-control"
                id="modId"
                value={modId}
                onChange={(e) => setModId(e.target.value)}
                placeholder="Enter mod ID (e.g., ABC123456789)"
                required
                autoComplete="off"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="modName" className="form-label">Mod Name</label>
              <input
                type="text"
                className="form-control"
                id="modName"
                value={modName}
                onChange={(e) => setModName(e.target.value)}
                placeholder="Enter mod name"
                required
                autoComplete="off"
              />
            </div>
          </div>
          <div className="manual-mod-modal-footer">
            <button type="submit" className="btn btn-primary w-100">
              Add Mod
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
