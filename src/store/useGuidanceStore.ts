import { create } from 'zustand';
import { TutorialSectionKey } from '../config/tutorialContent';

const CAMERA_GUIDANCE_KEY = 'roofray_camera_guidance_dismissed';
const getTutorialKey = (s: TutorialSectionKey) => `roofray_tutorial_${s}_completed`;

interface GuidanceState {
  // Camera Guidance
  isCameraGuidanceOpen: boolean;
  showCameraGuidance: () => void;
  dismissCameraGuidance: (explicit: boolean) => void;

  // Active Section Spotlight Tutorial
  activeTutorial: TutorialSectionKey | null;
  tutorialStepIndex: number;
  startSectionTutorial: (section: TutorialSectionKey, force?: boolean) => void;
  nextTutorialStep: (totalSteps: number) => void;
  prevTutorialStep: () => void;
  skipTutorial: () => void;
  finishTutorial: () => void;

  // Guide & Help Modal
  isHelpModalOpen: boolean;
  openHelpModal: () => void;
  closeHelpModal: () => void;

  // Section Tab Navigation hook callback
  activeSectionTab: TutorialSectionKey;
  setActiveSectionTab: (tab: TutorialSectionKey) => void;

  // Query completion status
  isSectionCompleted: (section: TutorialSectionKey) => boolean;
  isCameraCompleted: () => boolean;

  // Tab change trigger hook
  notifyTabChange: (newTab: TutorialSectionKey) => void;
}

export const useGuidanceStore = create<GuidanceState>((set, get) => {
  // Check if camera guidance was explicitly dismissed in localStorage
  const isCameraCompletedInitially = () => {
    if (typeof window === 'undefined') return true;
    try {
      return !!window.localStorage.getItem(CAMERA_GUIDANCE_KEY);
    } catch {
      return true;
    }
  };

  const isInitiallyDismissed = isCameraCompletedInitially();

  return {
    isCameraGuidanceOpen: !isInitiallyDismissed,
    activeTutorial: null,
    tutorialStepIndex: 0,
    isHelpModalOpen: false,
    activeSectionTab: 'planner',

    showCameraGuidance: () => {
      // Close active tutorial and help modal, display camera toast
      set({
        isCameraGuidanceOpen: true,
        activeTutorial: null,
        isHelpModalOpen: false,
      });
    },

    dismissCameraGuidance: (explicit: boolean) => {
      if (explicit && typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(CAMERA_GUIDANCE_KEY, 'true');
        } catch {
          // ignore
        }
      }

      set({ isCameraGuidanceOpen: false });

      // After camera guidance is dismissed or completed, check if Planner tutorial should run
      const currentTab = get().activeSectionTab;
      if (!get().isSectionCompleted(currentTab)) {
        setTimeout(() => {
          get().startSectionTutorial(currentTab);
        }, 300);
      }
    },

    startSectionTutorial: (section: TutorialSectionKey, force = false) => {
      // Never overlap camera toast and section tutorial
      if (get().isCameraGuidanceOpen && !force) {
        return;
      }

      if (!force && get().isSectionCompleted(section)) {
        return;
      }

      set({
        activeTutorial: section,
        tutorialStepIndex: 0,
        activeSectionTab: section,
        isHelpModalOpen: false,
      });
    },

    nextTutorialStep: (totalSteps: number) => {
      const current = get().tutorialStepIndex;
      if (current + 1 < totalSteps) {
        set({ tutorialStepIndex: current + 1 });
      } else {
        get().finishTutorial();
      }
    },

    prevTutorialStep: () => {
      const current = get().tutorialStepIndex;
      if (current > 0) {
        set({ tutorialStepIndex: current - 1 });
      }
    },

    skipTutorial: () => {
      const current = get().activeTutorial;
      if (current && typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(getTutorialKey(current), 'true');
        } catch {
          // ignore
        }
      }
      set({ activeTutorial: null, tutorialStepIndex: 0 });
    },

    finishTutorial: () => {
      const current = get().activeTutorial;
      if (current && typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(getTutorialKey(current), 'true');
        } catch {
          // ignore
        }
      }
      set({ activeTutorial: null, tutorialStepIndex: 0 });
    },

    openHelpModal: () => set({ isHelpModalOpen: true }),
    closeHelpModal: () => set({ isHelpModalOpen: false }),

    setActiveSectionTab: (tab: TutorialSectionKey) => {
      set({ activeSectionTab: tab });
    },

    isSectionCompleted: (section: TutorialSectionKey) => {
      if (typeof window === 'undefined') return true;
      try {
        return !!window.localStorage.getItem(getTutorialKey(section));
      } catch {
        return false;
      }
    },

    isCameraCompleted: () => {
      if (typeof window === 'undefined') return true;
      try {
        return !!window.localStorage.getItem(CAMERA_GUIDANCE_KEY);
      } catch {
        return false;
      }
    },

    notifyTabChange: (newTab: TutorialSectionKey) => {
      set({ activeSectionTab: newTab });

      // If camera guidance is open, don't auto-launch section tutorial
      if (get().isCameraGuidanceOpen) {
        return;
      }

      // If active tutorial belongs to another section, close it
      if (get().activeTutorial && get().activeTutorial !== newTab) {
        set({ activeTutorial: null, tutorialStepIndex: 0 });
      }

      // If user enters section for the first time, auto-display that section's interactive tutorial
      if (!get().isSectionCompleted(newTab)) {
        setTimeout(() => {
          // Re-check state before launching
          if (!get().isCameraGuidanceOpen && !get().activeTutorial && get().activeSectionTab === newTab) {
            get().startSectionTutorial(newTab);
          }
        }, 80);
      }
    },
  };
});
