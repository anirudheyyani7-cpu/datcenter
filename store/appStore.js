import { create } from 'zustand';
import { createClient } from '@/lib/supabase';

async function syncStageToSupabase(stageNum, data) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('stage_progress').upsert(
      { user_id: user.id, datacenter_id: null, stage_number: stageNum, ...data },
      { onConflict: 'user_id,datacenter_id,stage_number' }
    );
  } catch {
    // Supabase not configured — silently continue
  }
}

const useAppStore = create((set, get) => ({
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
  markStageComplete: (stageNum) => {
    set((state) => ({
      completedStages: [...new Set([...state.completedStages, stageNum])],
    }));
    syncStageToSupabase(stageNum, { completed: true, completed_at: new Date().toISOString() });
  },

  // AI state per stage
  stageOutputs: {},
  setStageOutput: (stageNum, output) => {
    set((state) => ({
      stageOutputs: { ...state.stageOutputs, [stageNum]: output },
    }));
    syncStageToSupabase(stageNum, { ai_output: output });
  },

  // Load stage progress from Supabase (call on app init)
  loadStageProgress: async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('stage_progress')
        .select('stage_number, completed, ai_output')
        .eq('user_id', user.id);

      if (!data) return;

      const completed = data.filter((r) => r.completed).map((r) => r.stage_number);
      const outputs = Object.fromEntries(
        data.filter((r) => r.ai_output).map((r) => [r.stage_number, r.ai_output])
      );

      set({ completedStages: completed, stageOutputs: outputs });
    } catch {
      // Supabase not configured — silently continue
    }
  },

  // Modal state
  activeModal: null,
  setActiveModal: (modal) => set({ activeModal: modal }),

  // Uploaded document analysis
  uploadedDocAnalysis: null,
  setUploadedDocAnalysis: (text) => set({ uploadedDocAnalysis: text }),
  uploadedDocName: null,
  setUploadedDocName: (name) => set({ uploadedDocName: name }),

  // Intro animation done
  introComplete: false,
  setIntroComplete: () => set({ introComplete: true }),
}));

export default useAppStore;
