/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Project, ProjectAssets, DNALock, AIDirectorInsight, SceneCard } from './types';
import ProjectWizard from './components/ProjectWizard';
import AssetsManager from './components/AssetsManager';
import AIDirector from './components/AIDirector';
import ScriptingWorkspace from './components/ScriptingWorkspace';
import VisualsQueue from './components/VisualsQueue';
import VideoModule from './components/VideoModule';
import ChoosingMasteringModule from './components/MasteringModule';
import PromptInspector from './components/PromptInspector';
import ProjectSettingsModal from './components/ProjectSettingsModal';
import { Sparkles, CheckCircle2, Lock, RefreshCw, Play, Trash2, AlertTriangle, ChevronRight, CheckCircle } from 'lucide-react';
import { useLanguage } from './utils/i18n';
import { HidroIcon } from './components/HidroLogo';
import { useBackgroundQueue } from './context/BackgroundQueueContext';
import ProductionCenter from './components/ProductionCenter';
import ProjectRecoveryPopup from './components/ProjectRecoveryPopup';
import { ProjectDashboard } from './components/ProjectDashboard';

export default function App() {
  const { lang, t, setLang } = useLanguage();
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  // Unified Theme Controller (Dark | Light | Auto)
  const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>(() => {
    try {
      const stored = localStorage.getItem('hidro_studio_theme');
      if (stored === 'dark' || stored === 'light' || stored === 'auto') {
        return stored;
      }
    } catch (e) {}
    return 'dark';
  });

  useEffect(() => {
    const applyTheme = () => {
      let resolvedTheme: 'dark' | 'light' = 'dark';
      if (theme === 'auto') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolvedTheme = isDark ? 'dark' : 'light';
      } else {
        resolvedTheme = theme;
      }
      document.documentElement.setAttribute('data-theme', resolvedTheme);
      try {
        localStorage.setItem('hidro_studio_theme', theme);
      } catch (e) {}
    };

    applyTheme();

    if (theme === 'auto') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [theme]);
  const [inspectorSceneIndex, setInspectorSceneIndex] = useState<number>(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // PROJECT MEMORY & STATE CONSTRAINTS (Loaded from storage if present)
  const { 
    activeProject, 
    setActiveProject, 
    jobs, 
    triggerAssetAnalysis, 
    triggerDirectorAnalysis, 
    triggerScriptGeneration, 
    startVisualProduction,
    isVisualProductionRunning
  } = useBackgroundQueue();

  const [activeTab, setActiveTab] = useState<'assets' | 'director' | 'script' | 'visuals' | 'motion' | 'mastering' | 'inspector'>(() => {
    try {
      const storedTab = localStorage.getItem('hidro_studio_active_tab');
      if (storedTab && ['assets', 'director', 'script', 'visuals', 'motion', 'mastering', 'inspector'].includes(storedTab)) {
        return storedTab as any;
      }
    } catch (e) {
      console.warn('LocalStorage active tab read blocked:', e);
    }
    return 'assets';
  });

  const [isMotionProcessing, setIsMotionProcessing] = useState(false);
  const [isMasteringProcessing, setIsMasteringProcessing] = useState(false);
  const [resetConfirmModal, setResetConfirmModal] = useState<string | null>(null);
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);

  // SUCCESS GUIDED DIALOG STATE
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionLabel: string;
    targetTab: 'assets' | 'director' | 'script' | 'visuals' | 'motion' | 'mastering';
  } | null>(null);

  // Sync state items directly in localStorage
  useEffect(() => {
    try {
      if (activeProject) {
        localStorage.setItem('hidro_studio_active_tab', activeTab);
      } else {
        localStorage.removeItem('hidro_studio_active_tab');
      }
    } catch (e) {
      console.warn('LocalStorage save interrupted', e);
    }
  }, [activeProject, activeTab]);

  // Synchronize active project settings to global localStorage on load/switch, or migrate legacy
  useEffect(() => {
    if (!activeProject) return;

    if (!activeProject.settings) {
      const legacySettings = {
        imageModel: activeProject.imageModel || localStorage.getItem('hidro_default_image_model') || 'Imagen 4 Pro',
        videoModel: activeProject.videoModel || localStorage.getItem('hidro_default_video_model') || 'Veo 3.1 Cinematic Quality',
        voiceEngine: activeProject.voiceModel || localStorage.getItem('hidro_default_voice_engine') || 'ElevenLabs',
        promptArchitecture: localStorage.getItem('hidro_prompt_architecture') || 'Standard',
        renderQueueStrategy: localStorage.getItem('hidro_render_queue_strategy') || 'Sequential',
        workspacePreset: localStorage.getItem('hidro_workspace_preset') || 'Standard',
        isAutoAiRouter: localStorage.getItem('hidro_auto_ai_router') === 'true',
        costScenes: activeProject.sceneCount || Number(localStorage.getItem('hidro_cost_scenes') || '8'),
        costDuration: activeProject.targetDuration || Number(localStorage.getItem('hidro_cost_duration') || '64'),
        outputQuality: localStorage.getItem('hidro_output_quality') || '1080p',
        fpsSetting: localStorage.getItem('hidro_fps') || '30',
        aspectRatioSetting: localStorage.getItem('hidro_aspect_ratio') || '16:9',
        advancedSeed: localStorage.getItem('hidro_advanced_seed') || '42',
        advancedConsistency: Number(localStorage.getItem('hidro_adv_consistency') || '85'),
        advancedCharLock: Number(localStorage.getItem('hidro_adv_charlock') || '90'),
        advancedProductLock: Number(localStorage.getItem('hidro_adv_productlock') || '75'),
        advancedMotion: Number(localStorage.getItem('hidro_adv_motion') || '60'),
        advancedCameraFreedom: Number(localStorage.getItem('hidro_adv_camera') || '50'),
        advancedPhysics: Number(localStorage.getItem('hidro_adv_physics') || '40'),
        isAutoSave30s: localStorage.getItem('hidro_autosave_30s') !== 'false',
        isLocalStorageBackup: localStorage.getItem('hidro_local_backup') !== 'false',
        isGoogleDriveBackupSync: localStorage.getItem('hidro_gdrive_sync_backup') === 'true'
      };
      setActiveProject({
        ...activeProject,
        settings: legacySettings
      });
    } else {
      const s = activeProject.settings;
      if (s.imageModel) localStorage.setItem('hidro_default_image_model', s.imageModel);
      if (s.videoModel) localStorage.setItem('hidro_default_video_model', s.videoModel);
      if (s.voiceEngine) localStorage.setItem('hidro_default_voice_engine', s.voiceEngine);
      if (s.promptArchitecture) localStorage.setItem('hidro_prompt_architecture', s.promptArchitecture);
      if (s.renderQueueStrategy) localStorage.setItem('hidro_render_queue_strategy', s.renderQueueStrategy);
      if (s.workspacePreset) localStorage.setItem('hidro_workspace_preset', s.workspacePreset);
      if (s.isAutoAiRouter !== undefined) localStorage.setItem('hidro_auto_ai_router', String(s.isAutoAiRouter));
      if (s.costScenes !== undefined) localStorage.setItem('hidro_cost_scenes', String(s.costScenes));
      if (s.costDuration !== undefined) localStorage.setItem('hidro_cost_duration', String(s.costDuration));
      if (s.outputQuality) localStorage.setItem('hidro_output_quality', s.outputQuality);
      if (s.fpsSetting) localStorage.setItem('hidro_fps', s.fpsSetting);
      if (s.aspectRatioSetting) localStorage.setItem('hidro_aspect_ratio', s.aspectRatioSetting);
      if (s.advancedSeed) localStorage.setItem('hidro_advanced_seed', s.advancedSeed);
      if (s.advancedConsistency !== undefined) localStorage.setItem('hidro_adv_consistency', String(s.advancedConsistency));
      if (s.advancedCharLock !== undefined) localStorage.setItem('hidro_adv_charlock', String(s.advancedCharLock));
      if (s.advancedProductLock !== undefined) localStorage.setItem('hidro_adv_productlock', String(s.advancedProductLock));
      if (s.advancedMotion !== undefined) localStorage.setItem('hidro_adv_motion', String(s.advancedMotion));
      if (s.advancedCameraFreedom !== undefined) localStorage.setItem('hidro_adv_camera', String(s.advancedCameraFreedom));
      if (s.advancedPhysics !== undefined) localStorage.setItem('hidro_adv_physics', String(s.advancedPhysics));
      if (s.isAutoSave30s !== undefined) localStorage.setItem('hidro_autosave_30s', String(s.isAutoSave30s));
      if (s.isLocalStorageBackup !== undefined) localStorage.setItem('hidro_local_backup', String(s.isLocalStorageBackup));
      if (s.isGoogleDriveBackupSync !== undefined) localStorage.setItem('hidro_gdrive_sync_backup', String(s.isGoogleDriveBackupSync));
    }
  }, [activeProject?.id, activeProject?.settings]);

  // Ping back API configurations on boot
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const r = await fetch('/api/health');
        const data = await r.json();
        setApiOnline(!!data.apiConfigured);
      } catch (e) {
        setApiOnline(false);
      }
    };
    checkHealth();
  }, []);

  // Sync state actions
  const handleProjectCreated = (newProj: Project) => {
    setActiveProject(newProj);
    setActiveTab('assets');
    setIsWizardOpen(false);
  };

  const handleUpdateAssets = (newAssets: ProjectAssets) => {
    if (!activeProject) return;
    setActiveProject({
      ...activeProject,
      assets: newAssets,
    });
  };

  const handleUpdateDirectorData = (dna: DNALock, insight: AIDirectorInsight) => {
    if (!activeProject) return;
    setActiveProject({
      ...activeProject,
      dnaLock: dna,
      directorInsight: insight,
    });
  };

  const handleUpdateScenes = (scenes: SceneCard[], scriptText: string) => {
    if (!activeProject) return;
    setActiveProject({
      ...activeProject,
      scenes,
      scriptText,
    });
  };

  const handleUpdateSceneSingle = (index: number, updatedScene: SceneCard) => {
    if (!activeProject) return;
    const updated = [...activeProject.scenes];
    updated[index] = updatedScene;
    setActiveProject({
      ...activeProject,
      scenes: updated,
    });
  };

  const handleUpdateAllScenes = (scenes: SceneCard[]) => {
    if (!activeProject) return;
    setActiveProject({
      ...activeProject,
      scenes,
    });
  };

  const handleClearActive = () => {
    if (window.confirm(t('wipeConfirm') || 'Wipe active studio cache and reload fresh board?')) {
      setActiveProject(null);
      setActiveTab('assets');
    }
  };

  // STEP SEQUENCING AUTOMATION & SEQUENTIAL CHECKS
  const isStepLocked = (tabId: string) => {
    if (!activeProject) return true;
    if (tabId === 'assets') return false;
    if (tabId === 'director') return !activeProject.assetsAnalyzed;
    if (tabId === 'script') return !activeProject.aiDirectorCompleted;
    if (tabId === 'visuals') return !activeProject.scriptingCompleted;
    if (tabId === 'motion') return !activeProject.visualsCompleted;
    if (tabId === 'mastering') return !activeProject.motionCompleted;
    if (tabId === 'inspector') return !activeProject.masteringCompleted;
    return false;
  };

  const getStepStatus = (id: string) => {
    if (!activeProject) return 'locked';
    if (isStepLocked(id)) return 'locked';

    const isJobRunning = (type: string) => {
      return jobs.some(j => j.type === type && (j.status === 'running' || j.status === 'pending'));
    };

    const hasJobFailed = (type: string) => {
      return jobs.some(j => j.type === type && j.status === 'failed');
    };

    switch (id) {
      case 'assets':
        if (isJobRunning('asset_analysis')) return 'processing';
        if (activeProject.assetsAnalyzed) return 'completed';
        if (hasJobFailed('asset_analysis')) return 'error';
        return 'not_started';
        
      case 'director':
        if (isJobRunning('director_analysis')) return 'processing';
        if (activeProject.aiDirectorCompleted) return 'completed';
        if (hasJobFailed('director_analysis')) return 'error';
        return 'not_started';
        
      case 'script':
        if (isJobRunning('script_generation')) return 'processing';
        if (activeProject.scriptingCompleted) return 'completed';
        if (hasJobFailed('script_generation')) return 'error';
        return 'not_started';
        
      case 'visuals':
        if (jobs.some(j => j.type === 'image_generation' && (j.status === 'running' || j.status === 'pending'))) return 'processing';
        if (activeProject.visualsCompleted) return 'completed';
        if (jobs.some(j => j.type === 'image_generation' && j.status === 'failed')) return 'error';
        return 'not_started';
        
      case 'motion':
        if (isMotionProcessing) return 'processing';
        if (activeProject.motionCompleted) return 'completed';
        return 'not_started';
        
      case 'mastering':
        if (isMasteringProcessing) return 'processing';
        if (activeProject.masteringCompleted) return 'completed';
        return 'not_started';
        
      case 'inspector':
        return 'completed';
        
      default:
        return 'not_started';
    }
  };

  // AUTO-INVALIDATION CHECK & DNA SMART RESET PIPELINE
  const hasDnaChanged = () => {
    if (!activeProject || !activeProject.scriptingCompleted || !activeProject.assetsSnapshot) {
      return false;
    }
    try {
      const snap: ProjectAssets = JSON.parse(activeProject.assetsSnapshot);
      const curr = activeProject.assets;
      if (!snap || !curr) return false;
      return (
        (snap.character?.prompt || '') !== (curr.character?.prompt || '') ||
        (snap.character?.items?.length || 0) !== (curr.character?.items?.length || 0) ||
        (snap.product?.prompt || '') !== (curr.product?.prompt || '') ||
        (snap.product?.items?.length || 0) !== (curr.product?.items?.length || 0) ||
        (snap.background?.prompt || '') !== (curr.background?.prompt || '') ||
        (snap.background?.items?.length || 0) !== (curr.background?.items?.length || 0) ||
        (snap.style?.prompt || '') !== (curr.style?.prompt || '') ||
        (snap.style?.items?.length || 0) !== (curr.style?.items?.length || 0)
      );
    } catch {
      return false;
    }
  };

  const handleDismissOrRegenerateDNA = (action: 'keep' | 'regenerate') => {
    if (!activeProject || !activeProject.assetsSnapshot) return;
    
    if (action === 'keep') {
      setActiveProject({
        ...activeProject,
        assetsSnapshot: JSON.stringify(activeProject.assets)
      });
      return;
    }
    
    try {
      const snap: ProjectAssets = JSON.parse(activeProject.assetsSnapshot);
      const curr = activeProject.assets;
      if (!snap || !curr) return;
      
      const charChanged = (snap.character?.prompt || '') !== (curr.character?.prompt || '') || (snap.character?.items?.length || 0) !== (curr.character?.items?.length || 0);
      const prodChanged = (snap.product?.prompt || '') !== (curr.product?.prompt || '') || (snap.product?.items?.length || 0) !== (curr.product?.items?.length || 0);
      const bgChanged = (snap.background?.prompt || '') !== (curr.background?.prompt || '') || (snap.background?.items?.length || 0) !== (curr.background?.items?.length || 0);
      const styleChanged = (snap.style?.prompt || '') !== (curr.style?.prompt || '') || (snap.style?.items?.length || 0) !== (curr.style?.items?.length || 0);

      let updatedProj = { ...activeProject };

      if (charChanged || prodChanged || bgChanged) {
        // Smart reset: Character, Product or Background changed -> Reset from AI Director (step 2) onwards!
        const stepsToReset = ['director', 'script', 'visuals', 'motion', 'mastering'];
        
        const resetStepData = (id: string) => {
          if (id === 'director') {
            updatedProj.dnaLock = undefined;
            updatedProj.directorInsight = undefined;
            updatedProj.aiDirectorCompleted = false;
          }
          if (id === 'script') {
            updatedProj.scenes = [];
            updatedProj.scriptText = '';
            updatedProj.scriptingCompleted = false;
          }
          if (id === 'visuals') {
            updatedProj.visualsCompleted = false;
          }
          if (id === 'motion') {
            updatedProj.motionCompleted = false;
          }
          if (id === 'mastering') {
            updatedProj.masteringCompleted = false;
          }
        };

        stepsToReset.forEach(resetStepData);
        updatedProj.assetsSnapshot = JSON.stringify(activeProject.assets);
        setActiveProject(updatedProj);
        setActiveTab('director');
      } else if (styleChanged) {
        // Smart reset: ONLY Style DNA changed -> Keep AI Director & Script. Reset Visuals and Motion onwards!
        const stepsToReset = ['visuals', 'motion', 'mastering'];
        
        const resetStepData = (id: string) => {
          if (id === 'visuals') {
            updatedProj.scenes = updatedProj.scenes.map(s => ({
              ...s,
              imageUrl: undefined,
              status: 'idle' as const,
              attempts: 0
            }));
            updatedProj.visualsCompleted = false;
          }
          if (id === 'motion') {
            updatedProj.motionCompleted = false;
          }
          if (id === 'mastering') {
            updatedProj.masteringCompleted = false;
          }
        };

        stepsToReset.forEach(resetStepData);
        updatedProj.assetsSnapshot = JSON.stringify(activeProject.assets);
        setActiveProject(updatedProj);
        setActiveTab('visuals');
      } else {
        setActiveProject({
          ...activeProject,
          assetsSnapshot: JSON.stringify(activeProject.assets)
        });
      }
    } catch {
      setActiveProject({
        ...activeProject,
        assetsSnapshot: JSON.stringify(activeProject.assets)
      });
    }
  };

  // TRIPLE BUTTON PIPELINE EXECUTIONS
  const handleRunStep = async (tabId: string) => {
    if (!activeProject) return;
    if (getStepStatus(tabId) === 'processing') return;

    switch (tabId) {
      case 'assets':
        triggerAssetAnalysis(activeProject.assets);
        break;
      case 'director':
        triggerDirectorAnalysis();
        break;
      case 'script':
        const mode = activeProject.scriptInputMode || 'ai';
        triggerScriptGeneration({
          mode,
          rawText: activeProject.scriptText,
        });
        break;
      case 'visuals':
        startVisualProduction();
        break;
      case 'motion':
        setIsMotionProcessing(true);
        setTimeout(() => {
          setIsMotionProcessing(false);
          handleMotionCompleted();
        }, 2000);
        break;
      case 'mastering':
        setIsMasteringProcessing(true);
        setTimeout(() => {
          setIsMasteringProcessing(false);
          setActiveProject({
            ...activeProject,
            masteringCompleted: true
          });
          setSuccessModal({
            isOpen: true,
            title: lang === 'vn' ? 'Hoàn Thành Biên Tập Master' : 'Mastering Compile Successful',
            message: lang === 'vn' ? 'Đồng bộ toàn bộ biên độ vocal thuyết minh và stems Dolby Atmos.' : 'All dynamic voice vectors & Dolby EQ stems master-synchronized.',
            actionLabel: lang === 'vn' ? 'Tiếp Tục Đến Prompt Inspector' : 'Proceed to Prompt Inspector',
            targetTab: 'inspector' as any,
          });
        }, 2000);
        break;
      default:
        break;
    }
  };

  const handleRegenerateStep = async (tabId: string) => {
    if (!activeProject) return;
    if (getStepStatus(tabId) === 'processing') return;

    switch (tabId) {
      case 'assets':
        setActiveProject({
          ...activeProject,
          assetsAnalyzed: false
        });
        setTimeout(() => {
          triggerAssetAnalysis(activeProject.assets);
        }, 100);
        break;
        
      case 'director':
        setActiveProject({
          ...activeProject,
          dnaLock: undefined,
          directorInsight: undefined,
          aiDirectorCompleted: false
        });
        setTimeout(() => {
          triggerDirectorAnalysis();
        }, 100);
        break;
        
      case 'script':
        setActiveProject({
          ...activeProject,
          scenes: [],
          scriptText: '',
          scriptingCompleted: false
        });
        setTimeout(() => {
          const mode = activeProject.scriptInputMode || 'ai';
          triggerScriptGeneration({
            mode,
            rawText: ''
          });
        }, 100);
        break;
        
      case 'visuals':
        const clearedVisualsScenes = activeProject.scenes.map(s => ({
          ...s,
          imageUrl: undefined,
          status: 'idle' as const,
          attempts: 0
        }));
        setActiveProject({
          ...activeProject,
          scenes: clearedVisualsScenes,
          visualsCompleted: false
        });
        setTimeout(() => {
          startVisualProduction();
        }, 100);
        break;
        
      case 'motion':
        setActiveProject({
          ...activeProject,
          motionCompleted: false
        });
        setIsMotionProcessing(true);
        setTimeout(() => {
          setIsMotionProcessing(false);
          handleMotionCompleted();
        }, 2000);
        break;
        
      case 'mastering':
        setActiveProject({
          ...activeProject,
          masteringCompleted: false
        });
        setIsMasteringProcessing(true);
        setTimeout(() => {
          setIsMasteringProcessing(false);
          setActiveProject({
            ...activeProject,
            masteringCompleted: true
          });
        }, 2000);
        break;
        
      default:
        break;
    }
  };

  const handleResetStep = (tabId: string) => {
    if (!activeProject) return;
    let updatedProj = { ...activeProject };

    const resetStepData = (id: string) => {
      if (id === 'assets') {
        updatedProj.assets = {
          character: { prompt: '', items: [] },
          product: { prompt: '', items: [] },
          background: { prompt: '', items: [] },
          style: { prompt: '', items: [] }
        };
        updatedProj.assetsAnalyzed = false;
        updatedProj.assetsSnapshot = undefined;
      }
      if (id === 'director') {
        updatedProj.dnaLock = undefined;
        updatedProj.directorInsight = undefined;
        updatedProj.aiDirectorCompleted = false;
      }
      if (id === 'script') {
        updatedProj.scenes = [];
        updatedProj.scriptText = '';
        updatedProj.scriptingCompleted = false;
      }
      if (id === 'visuals') {
        updatedProj.scenes = updatedProj.scenes.map(s => ({
          ...s,
          imageUrl: undefined,
          status: 'idle' as const,
          attempts: 0
        }));
        updatedProj.visualsCompleted = false;
      }
      if (id === 'motion') {
        updatedProj.motionCompleted = false;
      }
      if (id === 'mastering') {
        updatedProj.masteringCompleted = false;
      }
    };

    const stepOrder = ['assets', 'director', 'script', 'visuals', 'motion', 'mastering', 'inspector'];
    const tabIndex = stepOrder.indexOf(tabId);
    
    if (tabIndex !== -1) {
      for (let i = tabIndex; i < stepOrder.length; i++) {
        resetStepData(stepOrder[i]);
      }
    }

    setActiveProject(updatedProj);
    setResetConfirmModal(null);
    setActiveTab(tabId as any);
  };

  // STEP RESET METADATA BULLETS
  const getResetStepBulletPoints = (id: string) => {
    const list = lang === 'vn' ? getResetBulletPointsVN(id) : getResetBulletPointsEN(id);
    return list;
  };

  const getResetBulletPointsEN = (tabId: string) => {
    switch (tabId) {
      case 'assets':
        return [
          'Raw brand descriptions, references & image uploads',
          'Deconstructed brand asset key-value analysis logs',
          'Stored AI Director DNA representations & positioning strategy',
          'Locked script screenplay分cảnh and scene narration models',
          'Generated offline visual scene card rendering frames',
          'Engine video motion vectors & prompt templates',
          'Synchronized sound stems & Dolby audio presets'
        ];
      case 'director':
        return [
          'Director core DNA locks (Character, Product, Background, Style)',
          'Intelligence insights & target platform competitors strategy',
          'Script screenplay and scenes models',
          'Generated offline visual scene card rendering frames',
          'Engine video motion vectors & prompt templates',
          'Synchronized sound stems & Dolby audio presets'
        ];
      case 'script':
        return [
          'Narration scripting screenplay details',
          'Storyboards act groupings & directions',
          'Generated offline visual scene card rendering frames',
          'Engine video motion vectors & prompt templates',
          'Synchronized sound stems & Dolby audio presets'
        ];
      case 'visuals':
        return [
          'Generated offline visual scene card rendering frames',
          'Baking progress queues and logs',
          'Engine video motion vectors & prompt templates',
          'Synchronized sound stems & Dolby audio presets'
        ];
      case 'motion':
        return [
          'Engine video motion vectors & prompt templates',
          'Preset camera velocity directives',
          'Synchronized sound stems & Dolby audio presets'
        ];
      case 'mastering':
        return [
          'Synchronized sound stems & Dolby audio presets',
          'Speaker panning allocations'
        ];
      default:
        return ['All downstream pipelines will be wiped and locked.'];
    }
  };

  const getResetBulletPointsVN = (tabId: string) => {
    switch (tabId) {
      case 'assets':
        return [
          'Tài liệu, hình ảnh, văn bản upload của Brand Assets',
          'Nhật ký phân tích phân rã Brand Assets',
          'Toàn bộ DNA core và Chiến lược AI Director Insights',
          'Phân cảnh Kịch Bản chi tiết (Script & Scenes)',
          'Hình ảnh đã render trong visual frames',
          'Prompt và thiết lập camera chuyển động (Motion prompts)',
          'Bộ stems âm thanh Dolby Atmos'
        ];
      case 'director':
        return [
          'Lỗi khóa DNA cốt lõi (Character, Product, Background, Style)',
          'Insight thị trường và góc độ đối thủ cạnh tranh',
          'Phân cảnh Kịch Bản chi tiết (Script & Scenes)',
          'Hình ảnh đã render trong visual frames',
          'Prompt và thiết lập camera chuyển động (Motion prompts)',
          'Bộ stems âm thanh Dolby Atmos'
        ];
      case 'script':
        return [
          'Kịch bản phân cảnh thoại và cấu trúc hành động',
          'Chi tiết bảng kịch bản storyboard',
          'Hình ảnh đã render trong visual frames',
          'Prompt và thiết lập camera chuyển động (Motion prompts)',
          'Bộ stems âm thanh Dolby Atmos'
        ];
      case 'visuals':
        return [
          'Hình ảnh đã render trong visual frames',
          'Hàng đợi kết xuất & lịch sử nướng ảnh',
          'Prompt và thiết lập camera chuyển động (Motion prompts)',
          'Bộ stems âm thanh Dolby Atmos'
        ];
      case 'motion':
        return [
          'Prompt và thiết lập camera chuyển động (Motion prompts)',
          'Thiết lập vận tốc chỉ thị camera',
          'Bộ stems âm thanh Dolby Atmos'
        ];
      case 'mastering':
        return [
          'Bộ stems âm thanh Dolby Atmos',
          'Phân kênh panning đồng bộ âm thanh'
        ];
      default:
        return ['Toàn bộ tiến trình phía sau pipeline sẽ bị xóa và khóa lại.'];
    }
  };

  // TAB DICTIONARY FOR LOCALES
  const tabLabelMap = {
    assets: t('tabAssets'),
    director: t('tabDirector'),
    script: t('tabScripting'),
    visuals: t('tabVisuals'),
    motion: t('tabMotion'),
    mastering: t('tabMastering'),
    inspector: t('tabInspector'),
  };

  const getTabLabelAndBadge = (id: string, isTabLocked: boolean) => {
    if (isTabLocked) {
      return lang === 'vn' ? '🔒 Đã Khóa' : '🔒 Locked';
    }
    const status = getStepStatus(id);
    switch (status) {
      case 'processing': return lang === 'vn' ? '🟡 ĐANG CHẠY' : '🟡 Processing';
      case 'completed': return lang === 'vn' ? '🟢 HOÀN THÀNH' : '🟢 Completed';
      case 'error': return lang === 'vn' ? '🔴 BỊ LỖI' : '🔴 Error';
      case 'not_started': return lang === 'vn' ? '● CHƯA BẮT ĐẦU' : '● Not Started';
      default: return lang === 'vn' ? '● CHƯA BẮT ĐẦU' : '● Not Started';
    }
  };

  // AUTOMATIC NAVIGATION WORKFLOW SUCCESS TRIGGERS
  const handleAssetsAnalyzed = () => {
    if (!activeProject) return;
    setActiveProject({
      ...activeProject,
      assetsAnalyzed: true,
    });
    setSuccessModal({
      isOpen: true,
      title: lang === 'vn' ? 'Phân Tích Brand Hoàn Tất' : 'Asset Analysis Completed',
      message: lang === 'vn' ? 'Phân tích tài sản thương hiệu hoàn tất. DNA đã được biên soạn và khóa lại.' : 'Asset analysis deconstructed successfully. Consistent DNA locked.',
      actionLabel: lang === 'vn' ? 'Tiếp tục đến AI Director' : 'Continue to AI Director',
      targetTab: 'director',
    });
  };

  const handleDirectorCompleted = () => {
    if (!activeProject) return;
    setActiveProject({
      ...activeProject,
      aiDirectorCompleted: true,
    });
    setSuccessModal({
      isOpen: true,
      title: lang === 'vn' ? 'AI Director Hoàn Thành' : 'AI Director Complete',
      message: lang === 'vn' ? 'Chiến lược AI Director hoàn tất. Đã khóa các biến số truyền thông và thoại.' : 'AI Director complete. Marketing and voice variables locked successfully.',
      actionLabel: lang === 'vn' ? 'Tạo Kịch Bản' : 'Generate Script',
      targetTab: 'script',
    });
  };

  const handleScriptingCompleted = () => {
    if (!activeProject) return;
    setActiveProject({
      ...activeProject,
      scriptingCompleted: true,
    });
    setSuccessModal({
      isOpen: true,
      title: lang === 'vn' ? 'Kịch Bản Đã Phân Rã' : 'Scripting Deconstructed',
      message: lang === 'vn' ? 'Phân rã kịch bản hoàn tất. Tất cả các phân cảnh đã được đồng bộ.' : 'Scripting deconstruction complete. All scenes synchronized.',
      actionLabel: lang === 'vn' ? 'Bắt Đầu Render Hình Ảnh' : 'Start Image Generation',
      targetTab: 'visuals',
    });
  };

  const handleVisualsCompleted = () => {
    if (!activeProject) return;
    setActiveProject({
      ...activeProject,
      visualsCompleted: true,
    });
    setSuccessModal({
      isOpen: true,
      title: lang === 'vn' ? 'Hoàn Thành Render Visuals' : 'Visual Rendering Complete',
      message: lang === 'vn' ? 'Hoàn thành render toàn kịch bản hình ảnh. Tất cả scene cards đã định dạng.' : 'Visual rendering pipeline completed. All scene cards formatted successfully.',
      actionLabel: lang === 'vn' ? 'Tiếp Tục Đến Video Motion' : 'Continue to Video',
      targetTab: 'motion',
    });
  };

  const handleMotionCompleted = () => {
    if (!activeProject) return;
    setActiveProject({
      ...activeProject,
      motionCompleted: true,
    });
    setSuccessModal({
      isOpen: true,
      title: lang === 'vn' ? 'Khóa Camera Trực Quan' : 'Camera Presets Frozen',
      message: lang === 'vn' ? 'Góc quay camera và định hướng chuyển động đã được chuẩn bị cho bộ trộn Dolby.' : 'Camera angles and motion settings frozen for mastering compilation.',
      actionLabel: lang === 'vn' ? 'Tiếp Tục Đến Mastering' : 'Continue to Mastering',
      targetTab: 'mastering',
    });
  };

  const getTabStyleClass = (id: string, isTabLocked: boolean, isActive: boolean) => {
    if (isTabLocked) {
      return 'opacity-25 cursor-not-allowed text-gray-600 border border-transparent';
    }
    if (isActive) {
      return 'bg-white/[0.04] border border-[#66FF99]/40 text-[#66FF99] shadow-[0_0_15px_rgba(102,255,153,0.05)]';
    }
    
    const isStepDone = 
      id === 'assets' && activeProject?.assetsAnalyzed ||
      id === 'director' && activeProject?.aiDirectorCompleted ||
      id === 'script' && activeProject?.scriptingCompleted ||
      id === 'visuals' && activeProject?.visualsCompleted ||
      id === 'motion' && activeProject?.motionCompleted ||
      id === 'mastering' && activeProject?.masteringCompleted;

    if (isStepDone) {
      return 'text-gray-300 hover:text-white hover:bg-white/[0.01] border hover:border-white/10 border-[#66FF99]/20';
    }
    
    return 'text-[#4DA6FF] hover:text-white hover:bg-white/[0.01] border border-[#4DA6FF]/10 hover:border-[#4DA6FF]/30';
  };

  if (!activeProject && !isWizardOpen) {
    return (
      <ProjectDashboard
        onSelectProject={(p) => setActiveProject(p)}
        onOpenWizard={() => setIsWizardOpen(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] transition-colors duration-300 relative font-sans flex flex-col justify-between" id="app_viewport">
      {/* Liquid Ambient Blurred Backdrop Blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-[#D9FF1F]/[0.02] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full bg-[#B8E400]/[0.02] blur-[180px] pointer-events-none" />

      {/* Global Top Glass Hub Header */}
      <header className="sticky top-0 z-40 bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border)] py-4 px-6 md:px-12 flex justify-between items-center" id="global_header_bar">
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="p-2 bg-[var(--accent-glass)] border border-[var(--border)] rounded-xl">
            <HidroIcon size={22} />
          </div>
          <div>
            <span className="text-sm font-display font-black tracking-widest text-[var(--accent)] uppercase filter drop-shadow-[0_0_2px_rgba(217,255,31,0.2)]">{t('appTitle') || 'HIDRO STUDIO 2.0'}</span>
            <span className="text-[9px] font-mono tracking-widest text-[var(--text-muted)] block mt-0.5 uppercase">{t('appSubtitle') || 'Apple Glass Architecture'}</span>
          </div>
        </div>

        {/* Top Right Header Controls */}
        <div className="flex items-center gap-4">
          {/* Active Network Channel Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--panel)] border border-[var(--border)] text-[10px] font-mono select-none">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${apiOnline ? 'bg-[var(--accent)] animate-pulse shadow-[0_0_8px_var(--accent-glow)]' : 'bg-amber-400 font-bold'}`} />
            <span className="text-[var(--text-muted)] uppercase">
              {apiOnline ? t('keyActive') : t('liteSimulation')}
            </span>
          </div>

          {/* Theme Selector (Dark | Light | Auto) */}
          <div className="flex items-center bg-[var(--panel)] border border-[var(--border)] rounded-lg p-0.5 font-mono text-[11px] font-bold" id="theme_switcher_control">
            <button
              onClick={() => setTheme('dark')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1.5 ${theme === 'dark' ? 'bg-[var(--accent)] text-black font-black' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
              title={lang === 'en' ? 'Dark Theme' : 'Giao diện tối'}
            >
              <span>🌙</span>
              <span className="hidden sm:inline">Dark</span>
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer flex items-[#center] gap-1.5 ${theme === 'light' ? 'bg-[var(--accent)] text-black font-black' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
              title={lang === 'en' ? 'Light Theme' : 'Giao diện sáng'}
            >
              <span>☀️</span>
              <span className="hidden sm:inline">Light</span>
            </button>
            <button
              onClick={() => setTheme('auto')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1.5 ${theme === 'auto' ? 'bg-[var(--accent)] text-black font-black' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
              title={lang === 'en' ? 'System theme' : 'Tự động'}
            >
              <span>🌗</span>
              <span className="hidden sm:inline">Auto</span>
            </button>
          </div>

          {/* Bilingual Selector */}
          <div className="flex items-center bg-[var(--panel)] border border-[var(--border)] rounded-lg p-0.5 font-mono text-[11px] font-bold" id="bilingual_language_switcher">
            <button
              onClick={() => setLang('vn')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${lang === 'vn' ? 'bg-[var(--accent)] text-black font-black' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
            >
              VN
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${lang === 'en' ? 'bg-[var(--accent)] text-black font-black' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
            >
              EN
            </button>
          </div>

          {/* Project Settings Permanent Trigger */}
          {activeProject && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--panel)] hover:bg-[var(--accent-glass)] hover:text-[var(--accent)] transition-all text-[11px] font-mono font-bold text-[var(--text-muted)] cursor-pointer"
              title={lang === 'en' ? 'Open Project Settings' : 'Mở thiết lập dự án'}
            >
              <span>⚙</span>
              <span>{lang === 'en' ? 'Settings' : 'Thiết Lập'}</span>
            </button>
          )}

          {activeProject && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveProject(null)}
                className="px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--panel)] hover:bg-[var(--accent-glass)] text-xs font-semibold hover:text-[var(--accent)] transition text-[var(--text-muted)] font-mono cursor-pointer flex items-center gap-1.5"
              >
                <span>← Dashboard</span>
              </button>
              <button
                onClick={handleClearActive}
                className="text-[10px] font-mono tracking-wider border border-red-500/20 px-3 py-1.5 bg-red-500/5 hover:bg-red-500/15 text-red-400 rounded-full transition-colors uppercase cursor-pointer"
              >
                {t('closeProject')}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Primary Workspace Fluid Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-8 relative">
        {!activeProject ? (
          <div className="my-10">
            <ProjectWizard
              onProjectCreated={handleProjectCreated}
              activeProject={activeProject}
              onClearActive={() => setIsWizardOpen(false)}
              forceOpen={true}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Dynamic Project Meta details card */}
            <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in" id="project_ribbon_details">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">{t('activeMatrix')}</span>
                  {(activeProject.imageModel || activeProject.videoModel) && (
                    <span className="text-[9px] font-mono bg-[#66FF99]/10 text-[#66FF99] border border-[#66FF99]/20 px-2 py-0.5 rounded-md font-bold select-none uppercase">
                      ENGINES: {activeProject.imageModel} // {activeProject.videoModel}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-display font-extrabold text-white tracking-tight">{activeProject.name}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3.5 text-xs text-gray-400">
                <span className="bg-white/5 px-2.5 py-1 rounded text-white font-mono">{activeProject.type}</span>
                <span className="text-gray-700">|</span>
                <span className="bg-white/5 px-2.5 py-1 rounded text-white font-mono">{activeProject.platform}</span>
                <span className="text-gray-700">|</span>
                <span className="bg-white/5 px-2.5 py-1 rounded text-[#66FF99] border border-white/5 font-mono font-medium">{activeProject.sceneCount} {t('sceneCountLabel')}</span>
                <span className="text-gray-700">|</span>
                <span className="bg-[#66FF99]/10 text-[#66FF99] border border-[#66FF99]/20 px-2.5 py-1 rounded font-mono font-medium">Est. {activeProject.targetDuration}s</span>
                <span className="text-gray-700">|</span>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-2.5 py-1 rounded bg-[#4DA6FF]/10 text-[#4DA6FF] border border-[#4DA6FF]/20 hover:bg-[#4DA6FF]/20 transition-all font-mono text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer"
                  title="⚙ Project Settings"
                >
                  <span>⚙</span>
                  <span>{lang === 'en' ? 'Settings' : 'Cấu hình'}</span>
                </button>
              </div>
            </div>

            {/* Stepper Navigation tabs */}
            <div className="flex bg-[#0D0D0D] p-1.5 rounded-2xl border border-white/5 overflow-x-auto gap-1 main-scrollbar justify-start" id="pipeline_timeline_breadcrumb">
              {[
                { id: 'assets', label: tabLabelMap.assets },
                { id: 'director', label: tabLabelMap.director },
                { id: 'script', label: tabLabelMap.script },
                { id: 'visuals', label: tabLabelMap.visuals },
                { id: 'motion', label: tabLabelMap.motion },
                { id: 'mastering', label: tabLabelMap.mastering },
                { id: 'inspector', label: tabLabelMap.inspector },
              ].map((tab) => {
                const locked = isStepLocked(tab.id);
                const isActive = activeTab === tab.id;
                const tabStyle = getTabStyleClass(tab.id, locked, isActive);
                
                // Retrieve custom visual indicator
                const visualIndicatorText = getTabLabelAndBadge(tab.id, locked);

                return (
                  <button
                    key={tab.id}
                    disabled={locked}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3 px-4.5 text-nowrap rounded-xl text-xs font-mono tracking-wider font-bold uppercase transition-all flex flex-col items-start gap-1 justify-center cursor-pointer ${tabStyle}`}
                    id={`btn_tab_${tab.id}`}
                  >
                    <span className="text-[9px] font-mono text-gray-500 font-bold select-none">{visualIndicatorText}</span>
                    <span className="font-sans font-bold text-xs tracking-tight">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Auto-invalidation warnings */}
            {hasDnaChanged() && (
              <div 
                className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-5 animate-fade-in"
                id="dna_invalidation_warning_box"
              >
                <div className="flex gap-3.5 items-start">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-0.5">
                      {lang === 'vn' ? '⚠️ DỮ LIỆU DNA THAY ĐỔI' : '⚠️ DNA MODEL DETECTED OUT-OF-SYNC'}
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-sans font-medium">
                      {lang === 'vn' 
                        ? 'Dữ liệu Assets mô tả DNA đã có phiên bản cập nhật mới. Kịch bản phân cảnh và hình ảnh cảnh phim hiện tại của bạn có thể không còn đồng bộ phong cách hoặc đối tượng.'
                        : 'Your brand assets and DNA profiles have been updated on step 1. The existing scenes, screenplay, and image generations may no longer match the current style.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                  <button
                    onClick={() => handleDismissOrRegenerateDNA('keep')}
                    className="px-3 py-2 rounded-lg bg-white/[0.04] text-white border border-white/5 text-[10px] font-mono font-bold tracking-wider uppercase hover:bg-white/[0.08]"
                  >
                    {lang === 'vn' ? 'Giữ Nguyên' : 'Keep Stale DNA'}
                  </button>
                  <button
                    onClick={() => handleDismissOrRegenerateDNA('regenerate')}
                    className="px-3 py-2 rounded-lg bg-amber-500 text-black text-[10px] font-mono font-black tracking-wider uppercase hover:bg-amber-450 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  >
                    {lang === 'vn' ? 'Cập Nhật & Phục Hồi' : 'Sync & Smart Reset'}
                  </button>
                </div>
              </div>
            )}

            {/* Step Action Control Center Bar */}
            {activeProject && (
              <div 
                className="p-5 rounded-2xl bg-[#0D0D0D]/90 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in"
                id="step_workflow_actions_bar"
              >
                {/* Left: Step indicator and status pill */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-bold bg-[#4DA6FF]/10 text-[#4DA6FF] border border-[#4DA6FF]/20 px-3 py-1 rounded-md uppercase tracking-wider select-none">
                    {lang === 'vn' ? `BƯỚC ${['assets', 'director', 'script', 'visuals', 'motion', 'mastering', 'inspector'].indexOf(activeTab) + 1}` : `STEP ${['assets', 'director', 'script', 'visuals', 'motion', 'mastering', 'inspector'].indexOf(activeTab) + 1}`}
                  </span>
                  <div>
                    <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                      {lang === 'vn' ? 'Trạng Thái Quy Trình:' : 'Workflow Status:'}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      {(() => {
                        const status = getStepStatus(activeTab);
                        switch (status) {
                          case 'locked':
                            return (
                              <>
                                <Lock className="w-3.5 h-3.5 text-gray-500" />
                                <span className="text-xs font-sans font-black text-gray-500 uppercase">{lang === 'vn' ? 'Đã Khóa' : 'Locked'}</span>
                              </>
                            );
                          case 'processing':
                            return (
                              <div className="flex items-center gap-1 text-amber-400 font-medium">
                                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                                <span className="text-xs font-sans font-black uppercase ml-1 animate-pulse">{lang === 'vn' ? 'Đang Xử Lý...' : 'Processing...'}</span>
                              </div>
                            );
                          case 'completed':
                            return (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#66FF99]" />
                                <span className="text-xs font-sans font-black text-[#66FF99] uppercase">{lang === 'vn' ? 'Đã Hoàn Thành' : 'Completed'}</span>
                              </>
                            );
                          case 'error':
                            return (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                                <span className="text-xs font-sans font-black text-rose-500 uppercase">{lang === 'vn' ? 'Bị Lỗi' : 'Error'}</span>
                              </>
                            );
                          case 'not_started':
                          default:
                            return (
                              <>
                                <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0 select-none animate-pulse" />
                                <span className="text-xs font-sans font-black text-blue-400 uppercase ml-1.5">{lang === 'vn' ? 'Chưa Bắt Đầu' : 'Not Started'}</span>
                              </>
                            );
                        }
                      })()}
                    </div>
                  </div>
                </div>

                {/* Right: The 3 Buttons */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {/* RUN / CHẠY */}
                  <button
                    disabled={isStepLocked(activeTab) || getStepStatus(activeTab) === 'processing' || activeTab === 'inspector'}
                    onClick={() => handleRunStep(activeTab)}
                    className="px-4.5 py-2.5 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer bg-[#66FF99] hover:bg-[#66FF99]/90 text-black shadow-[0_0_15px_rgba(102,255,153,0.15)] hover:scale-[1.02] disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed disabled:shadow-none"
                    id="btn_step_run"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-black" />
                    <span>{lang === 'vn' ? 'CHẠY' : 'RUN'}</span>
                  </button>

                  {/* REGENERATE / CHẠY LẠI */}
                  <button
                    disabled={isStepLocked(activeTab) || getStepStatus(activeTab) === 'processing' || getStepStatus(activeTab) === 'not_started' || activeTab === 'inspector'}
                    onClick={() => handleRegenerateStep(activeTab)}
                    className="px-4.5 py-2.5 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer bg-white/[0.04] text-white border border-white/5 hover:bg-white/[0.08] hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    id="btn_step_regenerate"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-white animate-normal" />
                    <span>{lang === 'vn' ? 'CHẠY LẠI' : 'REGENERATE'}</span>
                  </button>

                  {/* RESET */}
                  <button
                    disabled={isStepLocked(activeTab) || getStepStatus(activeTab) === 'not_started' || activeTab === 'inspector'}
                    onClick={() => setResetConfirmModal(activeTab)}
                    className="px-4.5 py-2.5 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer bg-[#e11d48]/10 text-[#f43f5e] border border-[#f43f5e]/10 hover:bg-[#e11d48]/20 hover:border-[#f43f5e]/25 disabled:opacity-30 disabled:cursor-not-allowed"
                    id="btn_step_reset"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#f43f5e]" />
                    <span>{lang === 'vn' ? 'RESET' : 'RESET'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Stage content renders */}
            <div className="p-8 rounded-[24px] bg-[#0D0D0D]/40 border border-white/5 backdrop-blur-[24px] relative overflow-hidden">
              {activeTab === 'assets' && (
                <AssetsManager
                  project={activeProject}
                  onUpdateAssets={handleUpdateAssets}
                  onAdvanceStep={() => setActiveTab('director')}
                  onAssetsAnalyzed={handleAssetsAnalyzed}
                />
              )}

              {activeTab === 'director' && (
                <AIDirector
                  project={activeProject}
                  onUpdateDirectorData={handleUpdateDirectorData}
                  onAdvanceStep={() => setActiveTab('script')}
                  onDirectorCompleted={handleDirectorCompleted}
                />
              )}

              {activeTab === 'script' && (
                <ScriptingWorkspace
                  project={activeProject}
                  onUpdateScenes={handleUpdateScenes}
                  onAdvanceStep={() => setActiveTab('visuals')}
                  onScriptingCompleted={handleScriptingCompleted}
                />
              )}

              {activeTab === 'visuals' && (
                <VisualsQueue
                  project={activeProject}
                  onUpdateSceneSingle={handleUpdateSceneSingle}
                  onUpdateAllScenes={handleUpdateAllScenes}
                  onAdvanceStep={() => setActiveTab('motion')}
                  onVisualsCompleted={handleVisualsCompleted}
                />
              )}

              {activeTab === 'motion' && (
                <VideoModule
                  project={activeProject}
                  onAdvanceStep={() => setActiveTab('mastering')}
                  onMotionCompleted={handleMotionCompleted}
                />
              )}

              {activeTab === 'mastering' && (
                <ChoosingMasteringModule
                  project={activeProject}
                  onCloseProject={handleClearActive}
                />
              )}

              {activeTab === 'inspector' && (
                <PromptInspector
                  project={activeProject}
                  onUpdateProject={setActiveProject}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Reset Confirmation Dialog popup */}
      {resetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-[32px] animate-fade-in" id="reset_pipeline_step_dialog">
          <div className="w-full max-w-xl bg-[#0D0D0D] border border-red-500/20 rounded-3xl p-8 space-y-6 text-left shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <div className="flex items-center gap-3 pb-3 border-b border-white/5">
              <div className="p-2 rounded-xl bg-red-950/20 border border-red-500/20 text-red-500">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-mono font-black text-white uppercase tracking-widest leading-none mb-1">
                  {lang === 'vn' ? 'XÁC NHẬN RESET' : 'RESET PIPELINE CORE STEP?'}
                </h3>
                <p className="text-[11px] text-gray-500 font-mono text-xs uppercase">
                  {lang === 'vn' ? `Khởi tạo sạch lỗi bước: ${activeTab}` : `Destructive action targeting Step: ${resetConfirmModal}`}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              {lang === 'vn'
                ? 'Hành động này không thể hoàn tác. Nó sẽ xóa sạch dữ liệu của bước hiện tại và buộc khóa lại (reset) toàn bộ dữ liệu, hàng đợi, tệp tải của tất cả bước phía sau trong pipeline:'
                : 'Warning. This action is irreversible. It will wipe all local data pertaining to this tab, and forcefully rollback and lock all down-stream stages:'}
            </p>

            <ul className="space-y-2 pl-4 border-l-2 border-red-500/30 py-1">
              {getResetStepBulletPoints(resetConfirmModal).map((bullet, idx) => (
                <li key={idx} className="text-[11px] text-gray-400 font-mono flex items-start gap-2 leading-relaxed">
                  <span className="text-red-500 select-none">-</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => setResetConfirmModal(null)}
                className="w-full py-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.06] text-xs font-semibold tracking-wider font-mono uppercase transition-all cursor-pointer font-bold"
              >
                {lang === 'vn' ? 'HỦY BỎ' : 'CANCEL'}
              </button>
              <button
                onClick={() => handleResetStep(resetConfirmModal)}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold tracking-wider font-mono uppercase transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:scale-102 cursor-pointer font-bold font-black"
                id="btn_confirm_reset_step_action"
              >
                {lang === 'vn' ? 'XÁC NHẬN RESET' : 'CONFIRM RESET'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guided Auto-Navigation Success Dialog Modal popup */}
      {successModal && successModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-[24px] animate-fade-in" id="workflow_success_dialog">
          <div className="w-full max-w-lg bg-[#0D0D0D] border border-[#66FF99]/20 rounded-3xl p-8 space-y-6 text-center shadow-[0_0_50px_rgba(102,255,153,0.1)]">
            <div className="w-16 h-16 rounded-full bg-[#66FF99]/10 border border-[#66FF99]/30 flex items-center justify-center mx-auto text-[#66FF99] animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-display font-extrabold text-white tracking-tight leading-none uppercase">
                {successModal.title}
              </h3>
              <p className="text-sm text-gray-400 font-sans leading-relaxed">
                {successModal.message}
              </p>
            </div>

            <button
              onClick={() => {
                setActiveTab(successModal.targetTab);
                setSuccessModal(null);
              }}
              className="w-full py-4 rounded-xl bg-[#66FF99] hover:bg-[#66FF99]/90 text-black font-semibold tracking-wider font-mono text-xs uppercase transition-all shadow-[0_0_20px_rgba(102,255,153,0.2)] hover:scale-102 cursor-pointer font-bold"
              id="btn_success_dialog_continue"
            >
              {successModal.actionLabel}
            </button>
          </div>
        </div>
      )}

      {activeProject && (
        <ProjectSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          project={activeProject}
          onUpdateProject={(updatedProj) => {
            setActiveProject(updatedProj);
          }}
        />
      )}

      {activeProject && (
        <div className="max-w-7xl w-full mx-auto px-6 md:px-12 mb-6 animate-fade-in" id="system-debug-panel-wrapper">
          <div className="rounded-3xl border border-white/15 overflow-hidden bg-[#0A0A0A] backdrop-blur-xl shadow-2xl transition-all duration-300">
            {/* Debug Panel Accordion Trigger Header */}
            <button
              onClick={() => setIsDebugPanelOpen(!isDebugPanelOpen)}
              className="w-full flex items-center justify-between p-4 px-6 text-xs font-mono font-bold tracking-widest text-[#D9FF1F] hover:bg-white/[0.02] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D9FF1F] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D9FF1F]"></span>
                </span>
                <span>🔧 {lang === 'vn' ? 'HỆ THỐNG DEBUG PANEL (REAL-TIME)' : 'SYSTEM ENGINE DEBUG PANEL (REAL-TIME)'}</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#D9FF1F]/10 text-[#D9FF1F] text-[9px] uppercase font-bold">
                {isDebugPanelOpen ? (lang === 'vn' ? 'THU GỌN' : 'COLLAPSE') : (lang === 'vn' ? 'MỞ RỘNG' : 'EXPAND')}
              </span>
            </button>

            {/* Collapsible Content */}
            {isDebugPanelOpen && (
              <div className="p-6 border-t border-white/5 space-y-6 text-xs font-mono text-gray-400">
                {/* 1. Workflow States Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {[
                    { state: 'READY', desc: lang === 'vn' ? 'Sẵn sàng khởi tác' : 'Ready' },
                    { state: 'RUNNING', desc: lang === 'vn' ? 'Đang thực thi nền' : 'Running' },
                    { state: 'WAITING', desc: lang === 'vn' ? 'Chờ trong hàng xử lý' : 'Waiting' },
                    { state: 'COMPLETED', desc: lang === 'vn' ? 'Đã hoàn tất pha' : 'Completed' },
                    { state: 'ERROR', desc: lang === 'vn' ? 'Bị lỗi hệ thống' : 'Error' },
                    { state: 'RESET_REQUIRED', desc: lang === 'vn' ? 'Yêu cầu đặt lại' : 'Reset req.' },
                  ].map((s) => {
                    // Decide if this state is currently active in the workspace
                    let isStateActive = false;
                    const anyJobRunning = jobs.some(j => j.status === 'running' || j.status === 'pending');
                    const anyJobFailed = jobs.some(j => j.status === 'failed');
                    
                    if (s.state === 'RUNNING' && (anyJobRunning || isMotionProcessing || isMasteringProcessing)) {
                      isStateActive = true;
                    } else if (s.state === 'ERROR' && anyJobFailed) {
                      isStateActive = true;
                    } else if (s.state === 'COMPLETED' && activeProject.masteringCompleted) {
                      isStateActive = true;
                    } else if (s.state === 'RESET_REQUIRED' && hasDnaChanged()) {
                      isStateActive = true;
                    } else if (s.state === 'READY' && !anyJobRunning && !anyJobFailed && !activeProject.masteringCompleted && !hasDnaChanged()) {
                      isStateActive = true;
                    }

                    return (
                      <div
                        key={s.state}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isStateActive
                            ? 'bg-[#D9FF1F]/10 border-[#D9FF1F] text-[#D9FF1F] scale-102 shadow-[0_0_15px_rgba(217,255,31,0.15)]'
                            : 'bg-white/[0.01] border-white/5 text-gray-600'
                        }`}
                      >
                        <div className="font-extrabold text-[10px]">{s.state}</div>
                        <div className="text-[8px] mt-0.5 opacity-80">{s.desc}</div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. Step Status & Lock Rules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Steps & Lock matrixes */}
                  <div className="space-y-3.5 bg-black/40 p-4 rounded-2xl border border-white/5">
                    <h4 className="text-white text-[10px] tracking-wide font-bold border-b border-white/5 pb-2 flex justify-between items-center">
                      <span>📊 {lang === 'vn' ? 'MA TRẬN TRẠNG THÁI & KHÓA (LOCKS)' : 'STEP & LOCK MATRIX'}</span>
                      <span className="text-[8px] text-gray-500 font-normal">Auto-validating</span>
                    </h4>

                    <div className="space-y-2">
                      {['assets', 'director', 'script', 'visuals', 'motion', 'mastering', 'inspector'].map((tabId) => {
                        const status = getStepStatus(tabId);
                        const isLocked = isStepLocked(tabId);

                        return (
                          <div key={tabId} className="flex justify-between items-center text-[10px] p-2 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">#{['assets', 'director', 'script', 'visuals', 'motion', 'mastering', 'inspector'].indexOf(tabId) + 1}</span>
                              <span className="text-gray-300 font-bold uppercase">{tabId}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* STATUS BADGE */}
                              <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold select-none ${
                                status === 'completed'
                                  ? 'bg-green-500/10 text-[#61ff8f]'
                                  : status === 'processing'
                                  ? 'bg-amber-500/10 text-amber-400 animate-pulse'
                                  : status === 'error'
                                  ? 'bg-red-500/10 text-rose-400'
                                  : 'bg-white/5 text-gray-500'
                              }`}>
                                {status.toUpperCase()}
                              </span>

                              {/* LOCK STATUS */}
                              <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold flex items-center gap-1 ${
                                isLocked
                                  ? 'bg-red-950/20 text-rose-500 border border-red-500/10'
                                  : 'bg-[#D9FF1F]/10 text-[#D9FF1F] border border-[#D9FF1F]/10'
                              }`}>
                                {isLocked ? '🔒 LOCKED' : '🔓 UNLOCKED'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Active Jobs Queue list */}
                  <div className="space-y-3.5 bg-black/40 p-4 rounded-2xl border border-white/5">
                    <h4 className="text-white text-[10px] tracking-wide font-bold border-b border-white/5 pb-2 flex justify-between items-center">
                      <span>⏳ {lang === 'vn' ? 'HÀNG ĐỢI SẢN XUẤT NỀN (BACKGROUND QUEUE)' : 'ACTIVE RENDER JOBS QUEUE'}</span>
                      <span className="text-[#D9FF1F] text-[9px]">{jobs.length} jobs queue</span>
                    </h4>

                    {jobs.length === 0 ? (
                      <div className="h-44 flex flex-col items-center justify-center text-center text-gray-600 gap-2 border border-dashed border-white/5 rounded-xl">
                        <span>😴 </span>
                        <span>{lang === 'vn' ? 'Không có tác vụ nền nào đang chờ xử lý' : 'All jobs idle. Queue asleep.'}</span>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[185px] overflow-y-auto pr-1">
                        {jobs.map((job) => (
                          <div key={job.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-[10px] space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-black">{job.title}</span>
                              <span className={`text-[8px] font-mono px-2 py-0.5 rounded ${
                                job.status === 'running'
                                  ? 'bg-amber-400 text-black animate-pulse font-extrabold'
                                  : job.status === 'completed'
                                  ? 'bg-[#61ff8f]/20 text-[#61ff8f]'
                                  : job.status === 'failed'
                                  ? 'bg-red-500/10 text-red-400'
                                  : 'bg-white/5 text-gray-500'
                              }`}>
                                {job.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-500 text-[9px] font-sans leading-tight">{job.description}</p>
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-1.5">
                              <div
                                className="h-full bg-[#D9FF1F] transition-all duration-300"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Live Active Project State JSON Dump */}
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                  <h4 className="text-white text-[10px] font-bold border-b border-white/5 pb-2">
                    ⚡ {lang === 'vn' ? 'CHI TIẾT TRẠNG THÁI REAL-TIME (DỮ LIỆU ĐANG HOẠT ĐỘNG)' : 'LIVE ACTIVE PROJECT STATE RECORD'}
                  </h4>
                  <pre className="p-4 bg-black/60 rounded-xl border border-white/5 text-[9px] text-[#61ff8f] overflow-x-auto max-h-[180px] scrollbar-thin select-text font-mono leading-relaxed">
                    {JSON.stringify(
                      {
                        id: activeProject.id,
                        name: activeProject.name,
                        type: activeProject.type,
                        platform: activeProject.platform,
                        aiDirectorCompleted: activeProject.aiDirectorCompleted,
                        scriptingCompleted: activeProject.scriptingCompleted,
                        visualsCompleted: activeProject.visualsCompleted,
                        motionCompleted: activeProject.motionCompleted,
                        masteringCompleted: activeProject.masteringCompleted,
                        sceneCount: activeProject.scenes?.length || 0,
                        hasDnaChanged: hasDnaChanged(),
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeProject && <ProductionCenter />}
      {activeProject && <ProjectRecoveryPopup />}

      {/* Global Terminal Grid Footer */}
      <footer className="p-5 border-t border-white/5 px-6 md:px-12 text-center text-[10px] font-mono text-gray-400 bg-[#050505]">
        <div className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-2.5">
          <span>{t('secureTransfer') || 'HIDRO AI STUDIO NETWORK VER 2.0.47 // DESIGNED WITH SECURE TRANSFERS'}</span>
          <span className="flex items-center gap-1.5 text-gray-650">
            <span>{t('footerStatus') || 'PLATFORM: VITE+EXPRESS CLOUD RUN CONTAINER'}</span>
            <span>●</span>
            <span className="text-[#66FF99] uppercase font-bold">{t('activeMatrix') || 'Active Matrix Ready'}</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
