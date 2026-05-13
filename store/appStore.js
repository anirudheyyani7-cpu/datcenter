import { create } from 'zustand';

const useAppStore = create((set) => ({
  // Data
  datacenterData: null,
  setDatacenterData: (data) => set({ datacenterData: data }),

  // UI State
  selectedCountry: 'All',
  setSelectedCountry: (country) => set({ selectedCountry: country }),

  selectedDatacenter: null,
  setSelectedDatacenter: (dc) => set({ selectedDatacenter: dc }),

  // Stage progress
  completedStages: [],
  markStageComplete: (stageNum) =>
    set((state) => ({
      completedStages: [...new Set([...state.completedStages, stageNum])],
    })),

  // AI state per stage
  stageOutputs: {},
  setStageOutput: (stageNum, output) =>
    set((state) => ({
      stageOutputs: { ...state.stageOutputs, [stageNum]: output },
    })),

  // Modal state
  activeModal: null,
  setActiveModal: (modal) => set({ activeModal: modal }),

  // Intro animation done
  introComplete: false,
  setIntroComplete: () => set({ introComplete: true }),
}));

export default useAppStore;
