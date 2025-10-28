import React, { useState } from "react";
import Network from "../sections/Network";
import A2S from "../sections/A2S";
import Rcon from "../sections/Rcon";
import Game from "../sections/Game";
import GameProperties from "../sections/GameProperties";
import MissionHeader from "../sections/MissionHeader";
import Operating from "../sections/Operating";
import ModsModal from "./ModsModal";

type SectionKey =
  | "network"
  | "a2s"
  | "rcon"
  | "game"
  | "gameprops"
  | "mission"
  | "operating";

const SECTION_MAP: { key: SectionKey; label: string; component: React.ReactNode }[] = [
  { key: "network", label: "Network", component: <Network /> },
  { key: "a2s", label: "A2S", component: <A2S /> },
  { key: "rcon", label: "RCON", component: <Rcon /> },
  { key: "game", label: "Game Settings", component: <Game /> },
  { key: "gameprops", label: "Game Properties", component: <GameProperties /> },
  { key: "mission", label: "Mission Header", component: <MissionHeader /> },
  { key: "operating", label: "Operating", component: <Operating /> },
];

export default function SectionLauncher({ className = "" }: { className?: string }) {
  const [activeKey, setActiveKey] = useState<SectionKey | null>(null);
  const [isModsModalOpen, setIsModsModalOpen] = useState(false);

  const toggle = (key: SectionKey) => setActiveKey((k) => (k === key ? null : key));

  const active = SECTION_MAP.find((s) => s.key === activeKey);

  const left = SECTION_MAP.slice(0, 4);
  const right = SECTION_MAP.slice(4, 7);

  return (
    <div className={`section-launcher ${className}`}>
      <div className="launcher-buttons d-flex flex-column flex-md-row gap-3 mb-3">
        <div className="d-flex flex-column gap-2" style={{ flex: 1 }}>
          {left.map((s) => (
            <button
              key={s.key}
              className={`btn btn-outline-light text-start ${activeKey === s.key ? "active" : ""}`}
              onClick={() => toggle(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="d-flex flex-column gap-2" style={{ flex: 1 }}>
          {right.map((s) => (
            <button
              key={s.key}
              className={`btn btn-outline-light text-start ${activeKey === s.key ? "active" : ""}`}
              onClick={() => toggle(s.key)}
            >
              {s.label}
            </button>
          ))}
          <button
            className="btn btn-outline-primary text-start"
            onClick={() => setIsModsModalOpen(true)}
          >
            Mods
          </button>
        </div>
      </div>

      <div className="section-inline-body">
        {active ? (
          <div>
            <div className="mb-2"><strong>{active.label}</strong></div>
            <div>{active.component}</div>
          </div>
        ) : null}
      </div>
      
      <ModsModal 
        isOpen={isModsModalOpen} 
        onClose={() => setIsModsModalOpen(false)} 
      />
    </div>
  );
}
