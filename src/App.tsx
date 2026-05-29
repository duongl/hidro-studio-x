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
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from './utils/i18n';
import { useBackgroundQueue } from './context/BackgroundQueueContext';
import ProductionCenter from './components/ProductionCenter';
import ProjectRecoveryPopup from './components/ProjectRecoveryPopup';
import { ProjectDashboard } from './components/ProjectDashboard';

export default function App() {
  const { lang, t, setLang } = useLanguage();
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [inspectorSceneIndex, setInspectorSceneIndex] = useState<number>(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // PROJECT MEMORY & STATE CONSTRAINTS (Loaded from storage if present)
  const { activeProject, setActiveProject } = useBackgroundQueue();

  const [activeTab, setActiveTab] = useState<'assets' | 'director' | 'script' | 'visuals' | 'motion' | 'mastering' | 'inspector'>(() => {
    const storedTab = localStorage.getItem('hidro_studio_active_tab');
    if (storedTab && ['assets', 'director', 'script', 'visuals', 'motion', 'mastering', 'inspector'].includes(storedTab)) {
      return storedTab as any;
    }
    return 'assets';
  });

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

  // STEP SEQUENCING LOCKING MECHANISMS
  const hasAssets = !!activeProject?.assetsAnalyzed;
  const hasDNA = !!activeProject?.aiDirectorCompleted;
  const hasScript = !!activeProject?.scriptingCompleted;
  const hasVisuals = !!activeProject?.visualsCompleted;
  const hasMotion = !!activeProject?.motionCompleted;

  // TAB DICTIONARY FOR LOCALES
  const tabLabelMap = {
    assets: t('tabAssets') || '1. Brand Assets',
    director: t('tabDirector') || '2. AI Director',
    script: t('tabScripting') || '3. Scripting',
    visuals: t('tabVisuals') || '4. Visuals (Render)',
    motion: t('tabMotion') || '5. Motion (Beta)',
    mastering: t('tabMastering') || '6. Mastering (Beta)',
    inspector: t('tabInspector') || 'Prompt Inspector',
  };

  const getTabLabelAndBadge = (id: string, isTabLocked: boolean) => {
    const base = tabLabelMap[id as keyof typeof tabLabelMap] || '';
    if (isTabLocked) {
      return `Locked`; // Fallback for locking visualization
    }
    switch (id) {
      case 'assets': return hasAssets ? `✓ Brand Assets` : `⟳ Brand Assets`;
      case 'director': return hasDNA ? `✓ AI Director` : `⟳ AI Director`;
      case 'script': return hasScript ? `✓ Scripting` : `⟳ Scripting`;
      case 'visuals': return hasVisuals ? `✓ Visuals Complete` : `⟳ Visuals Running`;
      case 'motion': return hasMotion ? `✓ Motion Complete` : `⟳ Motion Beta`;
      default: return `⟳ ${base}`;
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
      title: t('dnaChecklistHeader') || 'Asset Analysis Completed',
      message: t('assetSuccessMsg') || 'Asset analysis deconstructed successfully. Consistent DNA locked.',
      actionLabel: t('continueToDirector') || 'Continue to AI Director',
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
      title: t('directorTitle') || 'AI Director Complete',
      message: t('directorSuccessMsg') || 'AI Director complete. Marketing and voice variables locked successfully.',
      actionLabel: t('generateScriptBtn') || 'Generate Script',
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
      title: t('scriptingTitle') || 'Scripting Deconstructed',
      message: t('scriptSuccessMsg') || 'Scripting deconstruction complete. All scenes synchronized.',
      actionLabel: t('startImageGenerationBtn') || 'Start Image Generation',
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
      title: t('visualsPipelineTitle') || 'Visual Rendering Complete',
      message: t('visualSuccessMsg') || 'Visual rendering pipeline completed. All scene cards formatted successfully.',
      actionLabel: t('continueToVideoBtn') || 'Continue to Video',
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
      title: t('motionTitle') || 'Camera Presets Frozen',
      message: t('motionSuccessMsg') || 'Camera angles and motion settings frozen for mastering compilation.',
      actionLabel: t('continueToMasteringBtn') || 'Continue to Mastering',
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
    
    switch (id) {
      case 'assets':
        return hasAssets 
          ? 'text-gray-300 hover:text-white hover:bg-white/[0.01] border hover:border-white/10 border-[#66FF99]/20'
          : 'text-[#4DA6FF] hover:text-white hover:bg-white/[0.01] border hover:border-white/10 border-[#4DA6FF]/10 animate-pulse';
      case 'director':
        return hasDNA
          ? 'text-gray-300 hover:text-white hover:bg-white/[0.01] border hover:border-white/10 border-[#66FF99]/20'
          : 'text-[#4DA6FF] hover:text-white hover:bg-white/[0.01] border border-[#4DA6FF]/10';
      case 'script':
        return hasScript
          ? 'text-gray-300 hover:text-white hover:bg-white/[0.01] border hover:border-white/10 border-[#66FF99]/20'
          : 'text-[#4DA6FF] hover:text-white hover:bg-white/[0.01] border border-[#4DA6FF]/10';
      case 'visuals':
        return hasVisuals
          ? 'text-gray-300 hover:text-white hover:bg-white/[0.01] border hover:border-white/10 border-[#66FF99]/20'
          : 'text-[#4DA6FF] hover:text-white hover:bg-white/[0.01] border border-[#4DA6FF]/10';
      case 'motion':
        return hasMotion
          ? 'text-gray-300 hover:text-white hover:bg-white/[0.01] border hover:border-white/10 border-[#66FF99]/20'
          : 'text-[#4DA6FF] hover:text-white hover:bg-white/[0.01] border border-[#4DA6FF]/10';
      default:
        return 'text-gray-400 hover:text-white hover:bg-white/[0.01] border border-transparent';
    }
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
    <div className="min-h-screen bg-[#050505] text-[#e5e5e5] relative font-sans flex flex-col justify-between" id="app_viewport">
      {/* Liquid Ambient Blurred Backdrop Blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-[#66FF99]/[0.025] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full bg-[#4DA6FF]/[0.025] blur-[180px] pointer-events-none" />

      {/* Global Top Glass Hub Header */}
      <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="p-2 bg-[#66FF99]/5 border border-[#66FF99]/20 rounded-xl">
            <Sparkles className="w-5 h-5 text-[#66FF99] animate-pulse" />
          </div>
          <div>
            <span className="text-sm font-display font-black tracking-widest text-white">{t('appTitle') || 'HIDRO STUDIO 2.0'}</span>
            <span className="text-[9px] font-mono tracking-widest text-[#66FF99] block mt-0.5 uppercase">{t('appSubtitle') || 'Apple Glass Architecture'}</span>
          </div>
        </div>

        {/* Top Right Header Controls */}
        <div className="flex items-center gap-4">
          {/* Active Network Channel Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5 text-[10px] font-mono select-none">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${apiOnline ? 'bg-[#66FF99] animate-pulse' : 'bg-amber-400 font-bold'}`} />
            <span className="text-gray-400 uppercase">
              {apiOnline ? t('keyActive') : t('liteSimulation')}
            </span>
          </div>

          {/* Bilingual Selector */}
          <div className="flex items-center bg-white/[0.03] border border-white/5 rounded-lg p-0.5 font-mono text-[11px] font-bold" id="bilingual_language_switcher">
            <button
              onClick={() => setLang('vn')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${lang === 'vn' ? 'bg-[#66FF99] text-black font-black' : 'text-gray-400 hover:text-white'}`}
            >
              VN
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${lang === 'en' ? 'bg-[#66FF99] text-black font-black' : 'text-gray-400 hover:text-white'}`}
            >
              EN
            </button>
          </div>

          {/* Project Settings Permanent Trigger */}
          {activeProject && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] hover:bg-[#4DA6FF]/10 hover:text-[#4DA6FF] transition-all text-[11px] font-mono font-bold text-gray-300 cursor-pointer"
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
                className="px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] text-xs font-semibold hover:text-emerald-400 transition text-slate-300 font-mono cursor-pointer flex items-center gap-1.5"
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
                { id: 'assets', label: tabLabelMap.assets, locked: false },
                { id: 'director', label: tabLabelMap.director, locked: false },
                { id: 'script', label: tabLabelMap.script, locked: false },
                { id: 'visuals', label: tabLabelMap.visuals, locked: false },
                { id: 'motion', label: tabLabelMap.motion, locked: false },
                { id: 'mastering', label: tabLabelMap.mastering, locked: false },
                { id: 'inspector', label: tabLabelMap.inspector, locked: false },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const tabStyle = getTabStyleClass(tab.id, tab.locked, isActive);
                
                // Retrieve custom visual indicator
                const visualIndicatorText = getTabLabelAndBadge(tab.id, tab.locked);

                return (
                  <button
                    key={tab.id}
                    disabled={tab.locked}
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
                />
              )}
            </div>
          </div>
        )}
      </main>

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
