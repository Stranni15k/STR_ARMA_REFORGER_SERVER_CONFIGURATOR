import { useEffect, useRef, useState } from "react";
import { useConfigStore } from "../store/configStore";
import { saveJsonWithDialog } from "../utils/jsonIO";
import s1 from "../../standart_s1.json";
import s2 from "../../standart_s2.json";

export default function TemplatesDropdown() {
  const importJson = useConfigStore((s) => s.importJson);
  const exportJson = useConfigStore((s) => s.exportJson);
  const importModsBatch = useConfigStore((s) => s.importModsBatch);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isModsOpen, setIsModsOpen] = useState(false);
  const [modIdsText, setModIdsText] = useState("");
  const [isImportingMods, setIsImportingMods] = useState(false);

  const applyTemplate = (tpl: any) => {
    importJson(JSON.stringify(tpl));
    setOpen(false);
  };

  const handleImportJsonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      importJson(String(ev.target?.result ?? ""));
      setOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    r.readAsText(f);
  };

  const handleSaveJson = async () => {
    const json = exportJson();
    if (json) await saveJsonWithDialog(json, "server.json");
    setOpen(false);
  };

  const openImportMods = () => {
    setIsModsOpen(true);
    setModIdsText("");
    setOpen(false);
  };

  const closeImportMods = () => {
    setIsModsOpen(false);
    setModIdsText("");
  };

  const handleImportMods = async () => {
    const text = modIdsText.trim();
    if (!text) return;
    const modIds = text
      .split(/[\,\n\r\s]+/)
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
    if (modIds.length === 0) return;
    setIsImportingMods(true);
    try {
      await importModsBatch(modIds);
      closeImportMods();
    } finally {
      setIsImportingMods(false);
    }
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className="dropdown" style={{ position: "relative", display: "inline-block" }}>
      <button
        className="btn btn-outline-light btn-sm tools-button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          position: 'relative',
          paddingRight: '0.75rem',
        }}
      >
        Tools
      </button>
      {open && (
        <div className="dropdown-menu show rounded-3 shadow-lg p-2 menu-slide-right" style={{ display: "block", minWidth: 260 }}>
          <h6 className="dropdown-header">JSON</h6>
          <button className="dropdown-item rounded-2" onClick={handleImportJsonClick}>Import JSON…</button>
          <button className="dropdown-item rounded-2" onClick={handleSaveJson}>Save JSON</button>
          <div className="dropdown-divider" />
          <h6 className="dropdown-header">Mods</h6>
          <button className="dropdown-item rounded-2" onClick={openImportMods}>Import Mods…</button>
          <div className="dropdown-divider" />
          <h6 className="dropdown-header">Templates</h6>
          <button className="dropdown-item rounded-2" onClick={() => applyTemplate(s1)}>ECHO (TTVT) S1</button>
          <button className="dropdown-item rounded-2" onClick={() => applyTemplate(s2)}>ECHO (TTVT) S2</button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            hidden
            onChange={handleFileChange}
          />
        </div>
      )}

      {isModsOpen && (
        <div 
          className="modal show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeImportMods}
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
                  onClick={closeImportMods}
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
                />
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeImportMods}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleImportMods}
                  disabled={isImportingMods || !modIdsText.trim()}
                >
                  {isImportingMods ? "Importing..." : "Import"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
