import React, { useState, useEffect } from 'react';
import { Project, ProjectType, SocialPlatform, ImageModel, VideoModel } from '../types';
import { Sparkles, Plus, ChevronRight, ChevronLeft, Cpu } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

interface ProjectWizardProps {
  onProjectCreated: (project: Project) => void;
  activeProject: Project | null;
  onClearActive: () => void;
  forceOpen?: boolean;
}

const PROJECT_TYPES: ProjectType[] = [
  'Affiliate Marketing',
  'Product TVC',
  'Marketing Ads',
  'TikTok Viral',
  'YouTube Automation',
  'AI Documentary',
  'Business Insight',
  'Custom Workflow',
];

const PLATFORMS: SocialPlatform[] = [
  'TikTok',
  'Shopee',
  'Lazada',
  'Amazon',
  'YouTube',
  'Facebook',
];

const IMAGE_MODELS_DATA = [
  {
    id: 'Nano Banana Pro',
    name: 'Nano Banana Pro',
    efficiency: 'Consistency ★★★★★',
    badge: '🥇 Consistency Leader',
    purpose: 'Maximum consistency',
    bestFor: 'Affiliate, UGC, Character lock, Product lock',
  },
  {
    id: 'Nano Banana 2',
    name: 'Nano Banana 2',
    efficiency: 'Speed ★★★★★',
    badge: '🍌 Fast & Balanced',
    purpose: 'Balanced quality and speed',
    bestFor: 'Mass production, Large scene counts',
  },
  {
    id: 'Imagen 4',
    name: 'Imagen 4',
    efficiency: 'Commercial ★★★★★',
    badge: '🖼 Commercial Grade',
    purpose: 'Commercial photography',
    bestFor: 'Product TVC, Marketing Ads, Brand Content',
  },
] as const;

const VIDEO_MODELS_DATA = [
  {
    id: 'Omni Flash',
    name: 'Omni Flash',
    badge: '⚡ Fast Generation',
    paceText: '8s / scene',
    durationMultiplier: 8,
    purpose: 'Fast generation',
    bestFor: 'TikTok, Affiliate, UGC',
  },
  {
    id: 'Veo 3.1 Lite',
    name: 'Veo 3.1 Lite',
    badge: '🚀 Budget Option',
    paceText: '5s / scene',
    durationMultiplier: 5,
    purpose: 'Cheap generation',
    bestFor: 'Low cost runs',
  },
  {
    id: 'Veo 3.1 Fast',
    name: 'Veo 3.1 Fast',
    badge: '🚀 Balanced Speed',
    paceText: '8s / scene',
    durationMultiplier: 8,
    purpose: 'Balanced speed',
    bestFor: 'Social campaigns',
  },
  {
    id: 'Veo 3.1 Quality',
    name: 'Veo 3.1 Quality',
    badge: '👑 Premium TVC',
    paceText: '10s / scene',
    durationMultiplier: 10,
    purpose: 'Highest quality',
    bestFor: 'Premium TVC, Commercial Ads',
  },
] as const;

export default function ProjectWizard({ onProjectCreated, activeProject, onClearActive, forceOpen }: ProjectWizardProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(forceOpen || false);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [type, setType] = useState<ProjectType>('Affiliate Marketing');
  const [platform, setPlatform] = useState<SocialPlatform>('TikTok');
  const [imageModel, setImageModel] = useState<ImageModel>('Nano Banana Pro');
  const [videoModel, setVideoModel] = useState<VideoModel>('Omni Flash');
  const [sceneCount, setSceneCount] = useState<number>(8);
  const [duration, setDuration] = useState<number>(60);
  const [isManualScenes, setIsManualScenes] = useState(false);

  // Default models map according to requirement
  useEffect(() => {
    if (type === 'Affiliate Marketing') {
      setImageModel('Nano Banana Pro');
      setVideoModel('Omni Flash');
    } else if (type === 'TikTok Viral') {
      setImageModel('Nano Banana 2');
      setVideoModel('Omni Flash');
    } else if (type === 'Product TVC') {
      setImageModel('Imagen 4');
      setVideoModel('Veo 3.1 Quality');
    } else {
      setImageModel('Nano Banana Pro');
      setVideoModel('Omni Flash');
    }
  }, [type]);

  const currentVideoModelData = VIDEO_MODELS_DATA.find(vm => vm.id === videoModel) || VIDEO_MODELS_DATA[0];
  const videoModelDurationSec = currentVideoModelData.durationMultiplier;
  const suggestedScenes = Math.max(1, Math.round(duration / videoModelDurationSec));

  useEffect(() => {
    if (!isManualScenes) {
      setSceneCount(suggestedScenes);
    }
  }, [duration, videoModel, isManualScenes, suggestedScenes]);

  const handleSceneCountChange = (val: number) => {
    setIsManualScenes(true);
    setSceneCount(Math.max(1, Math.min(100, val || 1)));
  };

  const handleDurationChange = (val: number) => {
    const parsedDuration = Math.max(1, val || 1);
    setDuration(parsedDuration);
  };

  const handleResetToSuggested = () => {
    setIsManualScenes(false);
    setSceneCount(suggestedScenes);
  };

  const handleCreateProject = () => {
    if (!name.trim()) return;

    const singleImageCost = imageModel === 'Imagen 4' ? 0.08 : 0.04;
    const singleVideoCostPerSec = videoModel === 'Veo 3.1 Quality' ? 0.15 : (videoModel === 'Veo 3.1 Lite' ? 0.04 : 0.08);
    const singleVoiceCostPerSec = 0.003; // Gemini TTS

    const imageTotalCost = singleImageCost * sceneCount;
    const videoTotalCost = singleVideoCostPerSec * duration;
    const voiceTotalCost = singleVoiceCostPerSec * duration;
    const grandTotalCost = parseFloat((imageTotalCost + videoTotalCost + voiceTotalCost).toFixed(2));

    const newProj: Project = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      type,
      platform,
      sceneCount,
      targetDuration: duration,
      imageModel,
      videoModel,
      scriptModel: 'Gemini 2.5 Pro',
      voiceModel: 'Gemini TTS',
      workspaceMode: 'SOLO',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      scriptInputMode: 'ai',
      assets: {
        character: { prompt: '', items: [] },
        product: { prompt: '', items: [] },
        background: { prompt: '', items: [] },
        style: { prompt: '', items: [] },
      },
      scenes: [],
      assetsAnalyzed: false,
      aiDirectorCompleted: false,
      scriptingCompleted: false,
      visualsCompleted: false,
      motionCompleted: false,
      costCalculator: {
        imageCost: parseFloat(imageTotalCost.toFixed(2)),
        videoCost: parseFloat(videoTotalCost.toFixed(2)),
        voiceCost: parseFloat(voiceTotalCost.toFixed(2)),
        totalCost: grandTotalCost
      },
      dnaProfile: {
        brandName: '',
        videoType: 'Affiliate',
        targetPlatform: platform as any,
        gender: 'All',
        ageGroup: '18-35',
        country: 'Vietnam',
        language: 'Vietnamese',
        videoStyle: 'Commercial UGC',
        targetDuration: duration
      }
    };

    onProjectCreated(newProj);
    setIsOpen(false);
    
    // Reset wizard
    setName('');
    setType('Affiliate Marketing');
    setPlatform('TikTok');
    setImageModel('Nano Banana Pro');
    setVideoModel('Omni Flash');
    setSceneCount(8);
    setDuration(60);
    setStep(1);
    setIsManualScenes(false);
  };

  return (
    <div className="w-full relative" id="project_wizard_panel">
      {!activeProject && !isOpen && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#66FF99]/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-12 left-1/3 w-[300px] h-[300px] bg-[#4DA6FF]/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="mb-6 p-4 rounded-full bg-white/[0.02] border border-white/10 shadow-[0_0_50px_rgba(102,255,153,0.05)]">
            <Sparkles className="w-12 h-12 text-[#66FF99] animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-white mb-3">
            HIDRO <span className="text-[#66FF99]">AI STUDIO</span> 2.0
          </h1>
          <p className="text-gray-400 max-w-lg mb-8 text-sm md:text-base leading-relaxed">
            Rebuilt from scratch. Cinematic DNA locks, prompt consistency pipelines, and high-conversion automation workflows.
          </p>

          <button
            onClick={() => setIsOpen(true)}
            id="btn_new_project"
            className="px-8 py-4 rounded-full bg-gradient-to-r from-[#66FF99] to-[#4DA6FF] text-[#050505] font-bold text-sm tracking-widest uppercase shadow-[0_0_30px_rgba(102,255,153,0.3)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(102,255,153,0.5)] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            New Project
          </button>
        </div>
      )}

      {isOpen && (
        <div className="w-full max-w-3xl mx-auto bg-[#0D0D0D]/90 border border-white/5 rounded-3xl p-8 shadow-2xl relative z-10 transition-all duration-300 my-4" id="wizard_active_form_panel">
          {/* Active Wizard Steps Indicator */}
          <div className="flex justify-between items-center mb-8/5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono tracking-widest text-[#66FF99] uppercase">{t('initializePipeline')}</span>
              <span className="text-xs text-gray-500 font-mono">/ {t('stepIndicator', { step })}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-white text-xs font-mono transition-colors cursor-pointer"
            >
              {t('cancelBtn')}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/[0.03] h-1.5 rounded-full mb-8 relative overflow-hidden mt-3">
            <div
              className="bg-[#66FF99] h-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>

          <div className="min-h-[340px] flex flex-col justify-center">
            {/* Step 1: Project Name */}
            {step === 1 && (
              <div className="space-y-4">
                <label className="block text-xl font-display font-semibold text-white">
                  {t('cinematicProjectName')}
                </label>
                <p className="text-xs text-gray-400">{t('nameDesc')}</p>
                <input
                  id="wizard_input_name"
                  type="text"
                  placeholder={t('namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 bg-[#050505] border border-white/10 rounded-2xl text-white text-lg placeholder-gray-600 focus:border-[#66FF99]/40 outline-none font-sans"
                  autoFocus
                />
              </div>
            )}

            {/* Step 2: Project Type Dropdown */}
            {step === 2 && (
              <div className="space-y-4">
                <label className="block text-xl font-display font-semibold text-white">
                  {t('sysProductionType')}
                </label>
                <p className="text-xs text-gray-400">{t('typeDesc')}</p>
                <div className="relative">
                  <select
                    id="wizard_select_type"
                    value={type}
                    onChange={(e) => setType(e.target.value as ProjectType)}
                    className="w-full p-4 bg-[#050505] border border-white/10 rounded-2xl text-white text-base focus:border-[#66FF99] outline-none appearance-none cursor-pointer font-sans"
                  >
                    {PROJECT_TYPES.map((tItem) => (
                      <option key={tItem} value={tItem}>
                        {tItem} {tItem === 'Affiliate Marketing' ? ` ${t('recommendedOption')}` : ''}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                </div>
              </div>
            )}

            {/* Step 3: Platform */}
            {step === 3 && (
              <div className="space-y-4">
                <label className="block text-xl font-display font-semibold text-white">
                  {t('targetPlatform')}
                </label>
                <p className="text-xs text-gray-400">{t('platformDesc')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PLATFORMS.map((p) => {
                    const isSel = platform === p;
                    return (
                      <button
                        key={p}
                        onClick={() => setPlatform(p)}
                        type="button"
                        className={`p-4 rounded-2xl text-center border transition-all cursor-pointer ${
                          isSel
                            ? 'bg-[#66FF99]/10 border-[#66FF99] text-[#66FF99] font-bold'
                            : 'bg-white/[0.01] border-white/5 text-gray-400 hover:bg-[#050505]'
                        }`}
                      >
                        <span className="block font-medium text-sm font-sans">{p}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: AI Model Matrix Selector */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-display font-semibold text-white mb-1">
                    {t('configureEngines')}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {t('engineTypeDesc')} <span className="text-[#66FF99] font-semibold">{type}</span>.
                  </p>
                </div>

                {/* Image Models */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono tracking-widest text-[#66FF99] uppercase block font-black">
                    {t('imageModelLabel')}
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {IMAGE_MODELS_DATA.map((im) => {
                      const isSel = imageModel === im.id;
                      return (
                        <button
                          key={im.id}
                          type="button"
                          onClick={() => setImageModel(im.id)}
                          className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                            isSel
                              ? 'bg-[#66FF99]/10 border-[#66FF99] text-[#66FF99] shadow-[0_0_15px_rgba(102,255,153,0.1)]'
                              : 'bg-black/40 border-white/5 text-gray-450 hover:bg-black/60'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-1.5 plan-header">
                              <span className="text-xs font-mono font-bold uppercase text-white">{im.id}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-relaxed min-h-[30px] font-sans">
                              {im.purpose}
                            </p>
                          </div>
                          <div className="border-t border-white/5 pt-2 mt-2 w-full text-[9px] text-gray-500 font-mono">
                            {t('bestFor')}: {im.bestFor}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Video Models */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono tracking-widest text-[#4DA6FF] uppercase block font-black">
                    {t('movieModelLabel')}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {VIDEO_MODELS_DATA.map((vm) => {
                      const isSel = videoModel === vm.id;
                      return (
                        <button
                          key={vm.id}
                          type="button"
                          onClick={() => setVideoModel(vm.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                            isSel
                              ? 'bg-[#4DA6FF]/10 border-[#4DA6FF] text-[#4DA6FF] shadow-[0_0_15px_rgba(77,166,255,0.1)]'
                              : 'bg-black/40 border-white/5 text-gray-450 hover:bg-black/60'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-1.5 gap-1">
                              <span className="text-xs font-mono font-bold uppercase text-white leading-tight">{vm.name}</span>
                              <span className="text-[8px] bg-[#4DA6FF]/10 text-[#4DA6FF] px-1 py-0.5 rounded leading-none shrink-0 font-mono font-bold">{vm.paceText}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mb-2 leading-relaxed font-mono">
                              {vm.badge}
                            </p>
                          </div>
                          <div className="border-t border-white/5 pt-2 mt-1 w-full text-[9px] text-gray-550 font-sans">
                            {vm.bestFor}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Duration and Scene Count Setup */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-display font-semibold text-white mb-1">
                    {t('pacingScenes')}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {t('pacingDesc')} <span className="font-semibold text-[#4DA6FF]">{videoModel}</span> ({videoModelDurationSec}s / {t('sceneLabel').toLowerCase()}).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Duration input */}
                  <div className="p-6 rounded-2xl bg-[#050505] border border-white/5 space-y-4">
                    <span className="text-[10px] font-mono tracking-widest text-[#66FF99] uppercase block font-bold">
                      {t('expectedVideoDuration')}
                    </span>
                    <p className="text-xs text-gray-400">{t('durationLabelDesc')}</p>
                    
                    <div className="flex items-center gap-3">
                      <input
                        id="wizard_input_duration"
                        type="number"
                        min="5"
                        max="600"
                        value={duration}
                        onChange={(e) => handleDurationChange(Number(e.target.value))}
                        className="w-32 p-3 bg-black/40 border border-white/10 rounded-xl text-center text-white font-mono text-lg focus:border-[#66FF99]/45 outline-none"
                      />
                      <span className="text-gray-450 text-sm font-mono">{t('secondsLabel')}</span>
                    </div>

                    <div className="text-[10px] text-gray-500 font-mono leading-relaxed bg-[#66FF99]/5 p-3.5 rounded-xl border border-[#66FF99]/10">
                      🎯 {t('recommendedCalc')}:<br/>
                      {duration}s / {videoModelDurationSec}s ({videoModel}) = <span className="text-[#66FF99] font-bold">{suggestedScenes} {t('sceneLabel').toLowerCase()}</span>
                    </div>
                  </div>

                  {/* Scene count input with override option */}
                  <div className="p-6 rounded-2xl bg-[#050505] border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono tracking-widest text-[#4DA6FF] uppercase block font-bold">
                        {t('sceneCountLabel')} (1-100)
                      </span>
                      {isManualScenes && (
                        <span className="text-[8px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full font-mono font-bold uppercase select-none">
                          {t('manualOverride')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{t('sceneCountDesc')}</p>

                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={sceneCount}
                        onChange={(e) => handleSceneCountChange(Number(e.target.value))}
                        className="flex-1 accent-[#66FF99] bg-white/10 h-1 rounded-lg"
                      />
                      <input
                        id="wizard_input_scenes"
                        type="number"
                        min="1"
                        max="100"
                        value={sceneCount}
                        onChange={(e) => handleSceneCountChange(Number(e.target.value))}
                        className="w-20 p-2.5 bg-black/40 border border-white/10 rounded-xl text-center text-white font-mono text-base focus:border-[#4DA6FF] outline-none"
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-gray-500">{t('suggestedScenesLabel')}: {suggestedScenes}</span>
                      {isManualScenes && (
                        <button
                          type="button"
                          onClick={handleResetToSuggested}
                          className="text-[#66FF99] hover:underline uppercase cursor-pointer"
                        >
                          {t('resetToRecommend')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Wizard Navigation Actions Footer */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/5">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className={`px-5 py-2.5 rounded-xl text-xs font-mono flex items-center gap-2 border border-white/10 cursor-pointer ${
                step === 1 ? 'opacity-30 cursor-not-allowed text-gray-600' : 'text-gray-300 hover:bg-white/[0.04]'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" /> {t('previousBtn')}
            </button>

            {step < 5 ? (
              <button
                onClick={() => {
                  if (step === 1 && !name.trim()) return;
                  setStep((s) => s + 1);
                }}
                disabled={step === 1 && !name.trim()}
                className={`px-6 py-2.5 rounded-xl text-xs font-mono bg-white text-black hover:bg-white/95 flex items-center gap-2 font-bold cursor-pointer ${
                  step === 1 && !name.trim() ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                {t('nextBtn')} <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleCreateProject}
                className="px-6 py-2.5 rounded-xl text-xs font-mono bg-[#66FF99] text-black hover:bg-[#66FF99]/90 flex items-center gap-2 font-extrabold cursor-pointer"
              >
                {t('compileProjectBtn')} <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Meta Project details ribbon when active */}
      {activeProject && (
        <div className="w-full flex justify-between items-center px-4 py-3 bg-white/[0.02] border-b border-white/10 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#66FF99] animate-pulse" />
            <span className="text-white font-mono font-medium">{activeProject.name}</span>
            <span className="text-gray-600">|</span>
            <span className="bg-white/5 px-2 py-0.5 rounded text-gray-300">{activeProject.type}</span>
            <span className="text-gray-600">|</span>
            <span className="bg-white/5 px-2 py-0.5 rounded text-gray-300">{activeProject.platform}</span>
          </div>
          <button
            onClick={onClearActive}
            className="hover:text-red-400 flex items-center gap-1 font-mono hover:underline cursor-pointer"
          >
            {t('closeBoard')}
          </button>
        </div>
      )}
    </div>
  );
}
