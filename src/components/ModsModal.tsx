import { useState } from "react";
import { useConfigStore } from "../store/configStore";
import { getModDisplayName } from "../utils/modConfigs";
import type { ModSearchResult } from "../api/modApi";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ManualModModal from "./ManualModModal";
import "../styles/ui.css";

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
    addModFromSearch,
    reorderMods
  } = useConfigStore();
  
  const [addingMod, setAddingMod] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"search" | "enabled">("enabled");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    })
  );

  const onDragStart = (event: { active: { id: string | number } }) => {
    setActiveId(String(event.active.id));
    document.body.classList.add('dragging-active');
    document.body.style.userSelect = 'none';
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    document.body.classList.remove('dragging-active');
    document.body.style.userSelect = '';
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }
    
    const fromIndex = enabledMods.findIndex(m => m.modId === String(active.id));
    const toIndex = enabledMods.findIndex(m => m.modId === String(over.id));
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderMods(fromIndex, toIndex);
    }
    setActiveId(null);
  };

  const onDragCancel = () => {
    document.body.classList.remove('dragging-active');
    document.body.style.userSelect = '';
    setActiveId(null);
  };

  function SortableModCard({ mod }: { mod: typeof enabledMods[number] }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
      id: mod.modId,
      transition: {
        duration: 150,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
      }
    });
    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0 : 1,
    };
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`mod-card ${isDragging ? "mod-card--dragging" : ""}`}
        {...attributes}
        {...listeners}
      >
        <div className="mod-card-body">
          <div className="mod-name d-flex align-items-center justify-content-between">
            <span>{mod.name}</span>
            {getModDisplayName(mod.modId) && (
              <span className="badge bg-success ms-2" title="Auto-configured missionHeader settings">
                Headers supported
              </span>
            )}
          </div>
          <div className="mod-id">ID: {mod.modId}</div>
        </div>
        <div className="mod-card-footer">
          <button 
            className="btn btn-sm btn-danger w-100"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => removeMod(mod)}
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  const handleSearch = async () => {
    await searchMods(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddMod = async (mod: ModSearchResult) => {
    setAddingMod(mod.modId);
    try {
      await addModFromSearch(mod);
    } finally {
      setAddingMod(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mods-modal">
      <div 
        className={`mods-modal-backdrop ${activeId ? 'no-pointer-events' : ''}`}
        onClick={onClose}
      ></div>
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
            <li className="nav-item ms-auto">
              <button 
                className="nav-link"
                onClick={() => setShowManualModal(true)}
              >
                Add Manually
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
                        Author: {result.author}
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
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={onDragCancel}>
                  <SortableContext items={enabledMods.map(m => m.modId)} strategy={verticalListSortingStrategy}>
                    <div className="mods-grid">
                      {enabledMods.map((mod) => (
                        <SortableModCard key={mod.modId} mod={mod} />
                      ))}
                    </div>
                  </SortableContext>
                  <DragOverlay adjustScale={false} dropAnimation={null}>
                    {(() => {
                      const active = enabledMods.find(m => m.modId === activeId);
                      if (!active) return null;
                      return (
                        <div className="mod-card" style={{ width: '100%' }}>
                          <div className="mod-card-body">
                            <div className="mod-name d-flex align-items-center justify-content-between">
                              <span>{active.name}</span>
                              {getModDisplayName(active.modId) && (
                                <span className="badge bg-success ms-2" title="Auto-configured missionHeader settings">
                                  Headers supported
                                </span>
                              )}
                            </div>
                            <div className="mod-id">ID: {active.modId}</div>
                          </div>
                          <div className="mod-card-footer">
                            <button className="btn btn-sm btn-danger w-100" disabled>Remove</button>
                          </div>
                        </div>
                      );
                    })()}
                  </DragOverlay>
                </DndContext>
              )}
            </div>
          )}
        </div>
      </div>
      
      <ManualModModal 
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
      />
    </div>
  );
}
