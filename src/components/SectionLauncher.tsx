import { useState } from "react";
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
  const [activeKey, setActiveKey] = useState<SectionKey>("network");
  const [isModsModalOpen, setIsModsModalOpen] = useState(false);

  const toggle = (key: SectionKey) => setActiveKey(key); 

  const active = SECTION_MAP.find((s) => s.key === activeKey);

  return (
    <div className={`section-launcher ${className}`}>
      <div className="launcher-buttons row g-2 mb-3">
        {SECTION_MAP.map((s) => (
          <div key={s.key} className="col-6 col-md-4 col-lg-3">
            <button
              className={`btn btn-sm w-100 ${activeKey === s.key ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => toggle(s.key)}
            >
              {s.label}
            </button>
          </div>
        ))}
        <div className="col-6 col-md-4 col-lg-3">
          <button
            className="btn btn-sm btn-outline-primary w-100"
            onClick={() => setIsModsModalOpen(true)}
          >
            Mods
          </button>
        </div>
      </div>

      <div className="section-inline-body">
        <div className="section-content">
          <div className="mb-2"><strong>{active?.label}</strong></div>
          {active?.component}
        </div>
      </div>
      
      <ModsModal 
        isOpen={isModsModalOpen} 
        onClose={() => setIsModsModalOpen(false)} 
      />
    </div>
  );
}
