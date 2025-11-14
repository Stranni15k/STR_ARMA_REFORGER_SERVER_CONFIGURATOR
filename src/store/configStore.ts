import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_CONFIG } from "../utils/defaults";
import type { FullStoreState } from "./types";
import { createConfigSlice } from "./slices/configSlice";
import { createModSlice } from "./slices/modSlice";

export const useConfigStore = create<FullStoreState>()(
  persist(
    (...a) => ({
      ...createConfigSlice(...a),
      ...createModSlice(...a),
      config: DEFAULT_CONFIG,
      enabledMods: [],
      keyOrder: Object.keys(DEFAULT_CONFIG),
      originalKeyPositions: Object.fromEntries(Object.keys(DEFAULT_CONFIG).map((k, i) => [k, i])),
    }),
    {
      name: "arfc:state",
      partialize: (state) => ({
        config: state.config,
        enabledMods: state.enabledMods,
        keyOrder: state.keyOrder,
        originalKeyPositions: state.originalKeyPositions,
      }),
    }
  )
);