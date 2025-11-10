import { useConfigStore } from "../store/configStore";
import { useState } from "react";

export default function ImportModsButton() {
  const importModsBatch = useConfigStore(s => s.importModsBatch);
  const [isOpen, setIsOpen] = useState(false);
  const [modIdsText, setModIdsText] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setModIdsText("");
  };

  const handleClose = () => {
    setIsOpen(false);
    setModIdsText("");
  };

  const handleImport = async () => {
    if (!modIdsText.trim()) return;
    
    const modIds = modIdsText
      .split(/[,\n\r\s]+/)
      .map(id => id.trim())
      .filter(id => id.length > 0);
    
    if (modIds.length === 0) {
      alert("Please enter at least one mod ID");
      return;
    }
    
    setIsImporting(true);
    try {
      await importModsBatch(modIds);
      handleClose();
    } finally {
      setIsImporting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleImport();
    }
  };

  return (
    <>
      <button 
        className="btn btn-outline-light btn-sm"
        onClick={handleOpen}
      >
        Import Mods
      </button>

      {isOpen && (
        <div 
          className="modal show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleClose}
        >
          <div 
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Import Mods</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleClose}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Enter mod IDs separated by commas:</label>
                <textarea
                  className="form-control"
                  rows={5}
                  placeholder="65AD7D0D9941A380, 6586079789278413, 65AD7D4F994EA327"
                  value={modIdsText}
                  onChange={(e) => setModIdsText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleImport}
                  disabled={isImporting || !modIdsText.trim()}
                >
                  {isImporting ? "Importing..." : "Import"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

