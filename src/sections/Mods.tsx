import { useConfigStore } from "../store/configStore";
import { useState } from "react";

export default function Mods() {
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

  return (
    <div className="fieldset-content">
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
            className="btn btn-primary"
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

      <div className="mods-enabled">
        <h6 className="section-title mb-3">Enabled Mods ({enabledMods.length})</h6>
        {enabledMods.length === 0 ? (
          <div className="mods-list-empty muted-weak">No enabled mods</div>
        ) : (
          <div className="mods-grid">
            {enabledMods.map((mod) => (
              <div key={mod.modId} className="mod-card">
                <div className="mod-card-body">
                  <div className="mod-name">{mod.name}</div>
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
    </div>
  );
}