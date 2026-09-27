"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AnimalSectorConfig, AnimalSectorId } from "@/types/sector";
import {
  ANIMAL_SECTORS,
  DEFAULT_ACTIVE_SECTORS,
  getAllEnabledSectors,
  getSectorConfig,
} from "@/lib/config/sectors";

const STORAGE_KEY = "himel_agro_selected_sectors";

export interface SectorContextType {
  selectedSectors: AnimalSectorId[];
  activeSectors: AnimalSectorId[];
  setSelectedSectors: (sectors: AnimalSectorId[]) => void;
  toggleSector: (sectorId: AnimalSectorId) => void;
  selectOnlySector: (sectorId: AnimalSectorId) => void;
  selectAllEnabledSectors: () => void;
  setAllSectors: () => void;
  isSectorActive: (sectorId: AnimalSectorId) => boolean;
  isSingleSectorMode: boolean;
  isCombinedMode: boolean;
  activePrimarySector: AnimalSectorId | "ALL";
  setActivePrimarySector: (sector: AnimalSectorId | "ALL") => void;
  availableSectors: AnimalSectorConfig[];
  allConfigs: AnimalSectorConfig[];
  getSectorInfo: (sectorId: AnimalSectorId) => AnimalSectorConfig;
}

const SectorContext = createContext<SectorContextType | undefined>(undefined);

export function SectorProvider({ children }: { children: React.ReactNode }) {
  const [selectedSectors, setSelectedSectorsState] = useState<AnimalSectorId[]>(
    DEFAULT_ACTIVE_SECTORS
  );
  const [activePrimarySector, setActivePrimarySector] = useState<
    AnimalSectorId | "ALL"
  >("ALL");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved sector selection from localStorage upon mounting
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedSectorsState(parsed);
          if (parsed.length === 1) {
            setActivePrimarySector(parsed[0]);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load sectors from localStorage:", err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const setSelectedSectors = (sectors: AnimalSectorId[]) => {
    const valid = sectors.filter((s) => Boolean(ANIMAL_SECTORS[s.toUpperCase()]));
    const next = valid.length > 0 ? valid : ["PIGEON"];
    setSelectedSectorsState(next);
    if (next.length === 1) {
      setActivePrimarySector(next[0]);
    } else {
      setActivePrimarySector("ALL");
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn("Failed to save sectors to localStorage:", e);
    }
  };

  const toggleSector = (sectorId: AnimalSectorId) => {
    const upper = sectorId.toUpperCase();
    if (selectedSectors.includes(upper)) {
      // Prevent unselecting all sectors - keep at least one active
      if (selectedSectors.length > 1) {
        const next = selectedSectors.filter((s) => s !== upper);
        setSelectedSectors(next);
      }
    } else {
      setSelectedSectors([...selectedSectors, upper]);
    }
  };

  const selectOnlySector = (sectorId: AnimalSectorId) => {
    const upper = sectorId.toUpperCase();
    setSelectedSectors([upper]);
    setActivePrimarySector(upper);
  };

  const selectAllEnabledSectors = () => {
    const all = getAllEnabledSectors().map((s) => s.id);
    setSelectedSectors(all);
    setActivePrimarySector("ALL");
  };

  const isSectorActive = (sectorId: AnimalSectorId): boolean => {
    return selectedSectors.includes(sectorId.toUpperCase());
  };

  const isSingleSectorMode = selectedSectors.length === 1;
  const isCombinedMode = selectedSectors.length > 1;

  const value: SectorContextType = {
    selectedSectors,
    activeSectors: selectedSectors,
    setSelectedSectors,
    toggleSector,
    selectOnlySector,
    selectAllEnabledSectors,
    setAllSectors: selectAllEnabledSectors,
    isSectorActive,
    isSingleSectorMode,
    isCombinedMode,
    activePrimarySector,
    setActivePrimarySector,
    availableSectors: getAllEnabledSectors(),
    allConfigs: getAllEnabledSectors(),
    getSectorInfo: getSectorConfig,
  };

  return (
    <SectorContext.Provider value={value}>{children}</SectorContext.Provider>
  );
}

export function useSector(): SectorContextType {
  const context = useContext(SectorContext);
  if (!context) {
    throw new Error("useSector must be used within a SectorProvider");
  }
  return context;
}
