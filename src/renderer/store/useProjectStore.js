import { create } from 'zustand';

export const useProjectStore = create((set, get) => ({
  isOnboarded: false,
  rootPath: null,
  driveRoot: null,
  scanDepth: 2,
  projects: [],
  loading: false,
  selectedProject: null,

      checkOnboarding: async () => {
    try {
      const rootPath = await window.api.getConfig('root_path');
      const depth = parseInt(await window.api.getConfig('scan_depth') || '2', 10);
      const driveRoot = await window.api.getConfig('drive_root');
      
      set({ isOnboarded: !!rootPath, rootPath, driveRoot, scanDepth: depth });
      if (rootPath) get().refreshProjects();
    } catch (err) {
      console.error('checkOnboarding failed:', err);
      set({ isOnboarded: false, rootPath: null, driveRoot: null, scanDepth: 2 });
    }
  },

  completeOnboarding: async (rootPath, depth) => {
    await window.api.setRoot(rootPath, depth);
    set({ isOnboarded: true, rootPath, scanDepth: depth });
    await get().refreshProjects();
  },

  updateSettings: async (rootPath, depth, driveRoot) => {
    set({ loading: true });
    await window.api.setRoot(rootPath, depth);
    if (driveRoot !== undefined) {
      await window.api.setConfig('drive_root', driveRoot || '');
    }
    set({ rootPath, scanDepth: depth, driveRoot: driveRoot || null });
    await get().refreshProjects();
  },

  refreshProjects: async () => {
    set({ loading: true });
    await window.api.scanNow();
    const projects = await window.api.getAllProjects();
    set({ projects, loading: false });
  },

  selectProject: (project) => set({ selectedProject: project }),
  closePanel: () => set({ selectedProject: null }),

  updateProject: async (id, folderPath, updates) => {
    const updated = await window.api.updateProject(id, folderPath, updates);
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? updated : p)),
      selectedProject: updated
    }));
  }
}));


