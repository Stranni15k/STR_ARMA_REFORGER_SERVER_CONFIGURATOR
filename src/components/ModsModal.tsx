import { useState } from "react";
import { useConfigStore } from "../store/configStore";
import { getModDisplayName } from "../utils/modConfigs";

interface ModsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModsModal({ isOpen, onClose }: ModsModalProps) {
  const { 
    enabledMods, 
    searchResults, 
    isSearching, 
    searchError, 
    removeMod, 
    searchMods, 
    addModFromSearch 
  } = useConfigStore();
  
  const [addingMod, setAddingMod] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"search" | "enabled">("enabled");

  const handleSearch = async () => {
    await searchMods(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddMod = async (result: any) => {
    setAddingMod(result.modId);
    try {
      await addModFromSearch(result);
    } finally {
      setAddingMod(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mods-modal">
      <div className="mods-modal-backdrop" onClick={onClose}></div>
      <div className="mods-modal-content">
        <div className="mods-modal-header">
          <h2>Manage Mods</h2>
          <button className="btn btn-sm btn-close btn-close-white" onClick={onClose}></button>
        </div>
        
        <div className="mods-modal-body">
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === "enabled" ? "active" : ""}`}
                onClick={() => setActiveTab("enabled")}
              >
                Enabled Mods ({enabledMods.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === "search" ? "active" : ""}`}
                onClick={() => setActiveTab("search")}
              >
                Search Mods
              </button>
            </li>
          </ul>
          
          {activeTab === "search" && (
            <>
              <div className="field-group mb-4">
                <label className="field-label">Search for mods</label>
                <div className="controls-row">
              <input
                className="form-control"
                type="text"
                placeholder="Enter the name of the mod..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                className="btn btn-primary btn-sm"
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {searchError && (
            <div className="alert alert-danger mb-3">
              Error: {searchError}
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="mods-container mb-4">
              <h6 className="section-title mb-3">Search Results ({searchResults.length})</h6>
              <div className="mods-grid">
                {searchResults.map((result) => (
                  <div key={result.modId} className="mod-card">
                    {result.image && (
                      <div className="mod-card-image">
                        <img src={result.image} alt={result.modName} />
                      </div>
                    )}
                    <div className="mod-card-body">
                      <div className="mod-name">{result.modName}</div>
                      <div className="mod-id">ID: {result.modId}</div>
                      <div className="control-help">
                        Author: {result.author} • Size: {result.size}
                      </div>
                    </div>
                    <div className="mod-card-footer">
                      <button 
                        className="btn btn-sm btn-success w-100"
                        onClick={() => handleAddMod(result)}
                        disabled={enabledMods.some(m => m.modId === result.modId) || addingMod === result.modId}
                      >
                        {addingMod === result.modId ? "Adding..." : 
                         enabledMods.some(m => m.modId === result.modId) ? "Added" : "Add"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
            </>
          )}

          {activeTab === "enabled" && (
            <div className="mods-enabled">
            <h6 className="section-title mb-3">Enabled Mods ({enabledMods.length})</h6>
            {enabledMods.length === 0 ? (
              <div className="mods-list-empty muted-weak">No enabled mods</div>
            ) : (
              <div className="mods-grid">
                {enabledMods.map((mod) => (
                  <div key={mod.modId} className="mod-card">
                    <div className="mod-card-body">
                      <div className="mod-name">
                        {mod.name}
                        {getModDisplayName(mod.modId) && (
                          <span className="badge bg-success ms-2" title="Auto-configured missionHeader settings">
                            Auto-config
                          </span>
                        )}
                      </div>
                      <div className="mod-id">ID: {mod.modId}</div>
                    </div>
                    <div className="mod-card-footer">
                      <button 
                        className="btn btn-sm btn-danger w-100"
                        onClick={() => removeMod(mod)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
