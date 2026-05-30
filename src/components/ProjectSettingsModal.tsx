import React, { useState, useEffect } from 'react';
import { Project, ProjectType, ImageModel, VideoModel, SceneCard } from '../types';
import { X, Settings, Cpu, ShieldAlert, Sparkles, Sliders, DollarSign, Users, Check } from 'lucide-react';
import { useLanguage } from '../utils/i18n';


interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateProject: (updatedProj: Project) => void;
}

const WORKFLOW_TYPES: ProjectType[] = [
  'Affiliate Marketing',
  'Product TVC',
  'Marketing Ads',
  'TikTok Viral',
  'YouTube Automation',
  'AI Documentary',
  'Business Insight',
  'Custom Workflow',
];

const PLATFORMS = [
  'TikTok',
  'Shopee Video',
  'Facebook',
  'Instagram',
  'YouTube Shorts',
  'YouTube Longform',
  'Multi Platform',
];

const IMAGE_MODELS_DATA = [
  { id: 'Nano Banana Pro', efficiency: 'Consistency ★★★★★ (Locks characters)', purpose: 'Maximum consistency' },
  { id: 'Nano Banana 2', efficiency: 'Speed ★★★★★', purpose: 'Balanced quality and speed' },
  { id: 'Imagen 4', efficiency: 'Commercial ★★★★★', purpose: 'Commercial photography' },
] as const;

const VIDEO_MODELS_DATA = [
  { id: 'Omni Flash', pace: '8s/scene', multiplier: 8, description: 'Fast generator' },
  { id: 'Veo 3.1 Lite', pace: '5s/scene', multiplier: 5, description: 'Budget generation' },
  { id: 'Veo 3.1 Fast', pace: '8s/scene', multiplier: 8, description: 'Balanced speed' },
  { id: 'Veo 3.1 Quality', pace: '10s/scene', multiplier: 10, description: 'Cinema quality' },
] as const;

const SCRIPT_MODELS_DATA = [
  { id: 'Gemini 2.5 Flash', desc: 'Fast UGC scripts' },
  { id: 'Gemini 2.5 Pro', desc: 'Commercial TVC scripts' },
  { id: 'GPT-5', desc: 'Next-gen viral triggers' },
];

const VOICE_MODELS_DATA = [
  { id: 'Gemini TTS', desc: 'Fluent native voiceover' },
  { id: 'ElevenLabs', desc: 'Premium voice cloned' },
  { id: 'OpenAI Voice', desc: 'Natural conversations' },
];

export default function ProjectSettingsModal({ isOpen, onClose, project, onUpdateProject }: ProjectSettingsModalProps) {
  const { lang, t } = useLanguage();
  const [name, setName] = useState(project.name);
  const [type, setType] = useState<ProjectType>(project.type);
  const [platform, setPlatform] = useState<string>(project.platform || 'TikTok');
  const [sceneCount, setSceneCount] = useState<number>(project.sceneCount || 8);
  const [videoLengthMode, setVideoLengthMode] = useState<string>(project.videoLengthMode || 'Auto');
  const [customLength, setCustomLength] = useState<number>(project.customVideoLength || 60);
  const [projLang, setProjLang] = useState<string>(project.targetLanguage || 'Vietnamese');
  const [imageModel, setImageModel] = useState<ImageModel>(project.imageModel || 'Nano Banana Pro');
  const [videoModel, setVideoModel] = useState<VideoModel>(project.videoModel || 'Omni Flash');
  const [scriptModel, setScriptModel] = useState<string>(project.scriptModel || 'Gemini 2.5 Pro');
  const [voiceModel, setVoiceModel] = useState<string>(project.voiceModel || 'Gemini TTS');
  const [workspaceMode, setWorkspaceMode] = useState<'SOLO' | 'TEAM'>(project.workspaceMode || 'SOLO');

  // Interactive settings state keys from project settings
  const [renderQueueStrategy, setRenderQueueStrategy] = useState<string>(project.settings?.renderQueueStrategy || 'Sequential');
  const [promptArchitecture, setPromptArchitecture] = useState<string>(project.settings?.promptArchitecture || 'Standard');
  const [isAutoAiRouter, setIsAutoAiRouter] = useState<boolean>(project.settings?.isAutoAiRouter ?? true);
  const [outputQuality, setOutputQuality] = useState<string>(project.settings?.outputQuality || '1080p');
  const [fpsSetting, setFpsSetting] = useState<string>(project.settings?.fpsSetting || '30');
  const [aspectRatioSetting, setAspectRatioSetting] = useState<string>(project.settings?.aspectRatioSetting || '16:9');
  
  // Advanced parameters
  const [advancedSeed, setAdvancedSeed] = useState<string>(project.settings?.advancedSeed || '42');
  const [advancedConsistency, setAdvancedConsistency] = useState<number>(project.settings?.advancedConsistency || 85);
  const [advancedCharLock, setAdvancedCharLock] = useState<number>(project.settings?.advancedCharLock || 90);
  const [advancedProductLock, setAdvancedProductLock] = useState<number>(project.settings?.advancedProductLock || 75);
  const [advancedMotion, setAdvancedMotion] = useState<number>(project.settings?.advancedMotion || 60);
  const [advancedCameraFreedom, setAdvancedCameraFreedom] = useState<number>(project.settings?.advancedCameraFreedom || 50);
  const [advancedPhysics, setAdvancedPhysics] = useState<number>(project.settings?.advancedPhysics || 40);
  
  // Backups
  const [isAutoSave30s, setIsAutoSave30s] = useState<boolean>(project.settings?.isAutoSave30s ?? true);
  const [isLocalStorageBackup, setIsLocalStorageBackup] = useState<boolean>(project.settings?.isLocalStorageBackup ?? true);
  const [isGoogleDriveBackupSync, setIsGoogleDriveBackupSync] = useState<boolean>(project.settings?.isGoogleDriveBackupSync ?? false);

  // DNA profile details
  const [brandName, setBrandName] = useState(project.dnaProfile?.brandName || '');
  const [videoType, setVideoType] = useState<'Affiliate' | 'TVC' | 'TikTok Viral' | 'Ads' | 'Documentary'>(project.dnaProfile?.videoType || 'Affiliate');
  const [gender, setGender] = useState<'Male' | 'Female' | 'All'>(project.dnaProfile?.gender || 'All');
  const [ageGroup, setAgeGroup] = useState(project.dnaProfile?.ageGroup || '18-35');
  const [country, setCountry] = useState(project.dnaProfile?.country || 'Vietnam');
  const [videoStyle, setVideoStyle] = useState(project.dnaProfile?.videoStyle || 'Commercial UGC');

  // Load latest settings on project change
  useEffect(() => {
    if (project) {
      setName(project.name);
      setType(project.type);
      setPlatform(project.platform);
      setSceneCount(project.sceneCount);
      setVideoLengthMode(project.videoLengthMode || 'Auto');
      setCustomLength(project.customVideoLength || project.targetDuration || 60);
      setProjLang(project.targetLanguage || 'Vietnamese');
      setImageModel(project.imageModel || 'Nano Banana Pro');
      setVideoModel(project.videoModel || 'Omni Flash');
      setScriptModel(project.scriptModel || 'Gemini 2.5 Pro');
      setVoiceModel(project.voiceModel || 'Gemini TTS');
      setWorkspaceMode(project.workspaceMode || 'SOLO');
      setBrandName(project.dnaProfile?.brandName || '');
      setVideoType(project.dnaProfile?.videoType || 'Affiliate');
      setGender(project.dnaProfile?.gender || 'All');
      setAgeGroup(project.dnaProfile?.ageGroup || '18-35');
      setCountry(project.dnaProfile?.country || 'Vietnam');
      setVideoStyle(project.dnaProfile?.videoStyle || 'Commercial UGC');

      // Sync inner states
      setRenderQueueStrategy(project.settings?.renderQueueStrategy || 'Sequential');
      setPromptArchitecture(project.settings?.promptArchitecture || 'Standard');
      setIsAutoAiRouter(project.settings?.isAutoAiRouter ?? true);
      setOutputQuality(project.settings?.outputQuality || '1080p');
      setFpsSetting(project.settings?.fpsSetting || '30');
      setAspectRatioSetting(project.settings?.aspectRatioSetting || '16:9');
      setAdvancedSeed(project.settings?.advancedSeed || '42');
      setAdvancedConsistency(project.settings?.advancedConsistency || 85);
      setAdvancedCharLock(project.settings?.advancedCharLock || 90);
      setAdvancedProductLock(project.settings?.advancedProductLock || 75);
      setAdvancedMotion(project.settings?.advancedMotion || 60);
      setAdvancedCameraFreedom(project.settings?.advancedCameraFreedom || 50);
      setAdvancedPhysics(project.settings?.advancedPhysics || 40);
      setIsAutoSave30s(project.settings?.isAutoSave30s ?? true);
      setIsLocalStorageBackup(project.settings?.isLocalStorageBackup ?? true);
      setIsGoogleDriveBackupSync(project.settings?.isGoogleDriveBackupSync ?? false);
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  // Real-time calculated duration
  const activeVideoModel = VIDEO_MODELS_DATA.find(vm => vm.id === videoModel) || VIDEO_MODELS_DATA[0];
  const modelPaceMultiplier = activeVideoModel.multiplier;
  const calculatedDuration = videoLengthMode === 'Auto' ? sceneCount * modelPaceMultiplier : customLength;

  // Real-time cost estimator
  const numScenes = sceneCount;
  const resolvedDuration = videoLengthMode === 'Auto' ? sceneCount * modelPaceMultiplier : customLength;
  const singleImageCost = imageModel === 'Imagen 4' ? 0.08 : 0.04;
  const singleVideoCostPerSec = videoModel === 'Veo 3.1 Quality' ? 0.15 : (videoModel === 'Veo 3.1 Lite' ? 0.04 : 0.08);
  const singleVoiceCostPerSec = voiceModel === 'ElevenLabs' ? 0.015 : (voiceModel === 'OpenAI Voice' ? 0.010 : 0.003);

  const imageTotalCost = singleImageCost * numScenes;
  const videoTotalCost = singleVideoCostPerSec * resolvedDuration;
  const voiceTotalCost = singleVoiceCostPerSec * resolvedDuration;
  const grandTotalCost = parseFloat((imageTotalCost + videoTotalCost + voiceTotalCost).toFixed(2));

  // Handlers
  const handleSave = () => {
    const modelPace = VIDEO_MODELS_DATA.find(vm => vm.id === videoModel)?.multiplier || 8;
    const resolvedDuration = videoLengthMode === 'Auto' ? sceneCount * modelPace : customLength;

    // SCENE SYNCHRONIZATION ALGORITHM
    let resScenes = [...(project.scenes || [])];
    const targetCount = Math.max(1, Math.min(100, sceneCount));

    if (resScenes.length < targetCount) {
      // Append missing scenes
      const gap = targetCount - resScenes.length;
      for (let i = 0; i < gap; i++) {
        const nextIdx = resScenes.length + 1;
        
        // Form DNA parts safely
        const c_dna = project.dnaLock?.CHARACTER_DNA || 'consistent main character';
        const p_dna = project.dnaLock?.PRODUCT_DNA || 'consistent brand product';
        const b_dna = project.dnaLock?.BACKGROUND_DNA || 'cinematic showroom background';
        const s_dna = project.dnaLock?.STYLE_DNA || 'premium Liquid Glass glass reflection';

        resScenes.push({
          id: `sc-sync-${nextIdx}-${Math.random().toString(36).substr(2, 4)}`,
          sceneNumber: nextIdx,
          narration: `Brand details & high-conversion narrative for Scene ${nextIdx}.`,
          action: `Main subject/product in aesthetic presentation.`,
          visualDirection: `Macro focus with pristine emerald accent reflections.`,
          imagePrompt: `Stable representation: [DNA_LOCKS] CH: ${c_dna} | PRO: ${p_dna} | BG: ${b_dna} | STYLE: ${s_dna}. Content details: Main subject/product in aesthetic presentation, premium commercial framing.`,
          videoPrompt: `Slow cinema motion tracking: [DNA_LOCKS] CH: ${c_dna} | PRO: ${p_dna} | BG: ${b_dna} | STYLE: ${s_dna}. Motion dynamics: Dolly camera glides slowly, highlighting high-gloss material surfaces.`,
          negativePrompt: 'warped items, abnormal faces, low quality render, texts on screen, noisy lens',
          cameraPrompt: 'Dolly close-up zoom, 35mm lens angle',
          motionPrompt: 'Slick refraction movement with emerald accents',
          voicePrompt: 'Deep cinematic whisper pacing',
          status: 'idle',
          attempts: 0,
          duration: Math.round(resolvedDuration / targetCount),
          voiceModel,
          hookScore: Math.floor(Math.random() * 20) + 75, // pre-calculate decent UGC mock scores
          ctaScore: Math.floor(Math.random() * 20) + 75,
          consistencyScore: {
            character: Math.floor(Math.random() * 10) + 88,
            product: Math.floor(Math.random() * 10) + 90,
            background: Math.floor(Math.random() * 15) + 80,
            style: Math.floor(Math.random() * 10) + 90,
          }
        });
      }
    } else if (resScenes.length > targetCount) {
      // Truncate to size
      resScenes = resScenes.slice(0, targetCount);
    }

    // Keep sceneNumber indices sequential
    resScenes = resScenes.map((sc, i) => ({
      ...sc,
      sceneNumber: i + 1,
      duration: sc.duration || Math.round(resolvedDuration / targetCount),
      voiceModel: sc.voiceModel || voiceModel,
      hookScore: sc.hookScore || Math.floor(Math.random() * 20) + 75,
      ctaScore: sc.ctaScore || Math.floor(Math.random() * 20) + 75,
      consistencyScore: sc.consistencyScore || {
        character: Math.floor(Math.random() * 10) + 88,
        product: Math.floor(Math.random() * 10) + 90,
        background: Math.floor(Math.random() * 15) + 80,
        style: Math.floor(Math.random() * 10) + 90,
      }
    }));

    const updatedProject: Project = {
      ...project,
      name: name.trim() || project.name,
      type,
      platform: platform as any,
      sceneCount: targetCount,
      targetDuration: resolvedDuration,
      imageModel,
      videoModel,
      scriptModel,
      voiceModel,
      workspaceMode,
      videoLengthMode: videoLengthMode as any,
      customVideoLength: customLength,
      targetLanguage: projLang as any,
      scenes: resScenes,
      costCalculator: {
        imageCost: parseFloat(imageTotalCost.toFixed(2)),
        videoCost: parseFloat(videoTotalCost.toFixed(2)),
        voiceCost: parseFloat(voiceTotalCost.toFixed(2)),
        totalCost: grandTotalCost
      },
      dnaProfile: {
        brandName,
        videoType,
        targetPlatform: platform as any,
        gender,
        ageGroup,
        country,
        language: projLang,
        videoStyle,
        targetDuration: resolvedDuration
      },
      settings: {
        imageModel,
        videoModel,
        voiceEngine: voiceModel,
        promptArchitecture,
        renderQueueStrategy,
        workspacePreset: project.settings?.workspacePreset || 'Standard',
        isAutoAiRouter,
        costScenes: targetCount,
        costDuration: resolvedDuration,
        outputQuality,
        fpsSetting,
        aspectRatioSetting,
        advancedSeed,
        advancedConsistency,
        advancedCharLock,
        advancedProductLock,
        advancedMotion,
        advancedCameraFreedom,
        advancedPhysics,
        isAutoSave30s,
        isLocalStorageBackup,
        isGoogleDriveBackupSync
      }
    };

    onUpdateProject(updatedProject);
    onClose();
  };

  // Model Intelligence system analysis feedback
  const getModelIntelligenceReport = () => {
    let pacingReport = `${lang === 'en' ? 'Pacing' : 'Tốc độ nhịp'} ${modelPaceMultiplier}s/${lang === 'en' ? 'scene' : 'cảnh'}.`;
    let structureReport = '';
    let cameraReport = '';

    if (videoModel === 'Omni Flash') {
      structureReport = lang === 'en' 
        ? 'Prompt structure tuned for FAST inference, using brief focal attributes.' 
        : 'Cấu trúc prompt tối ưu cho tốc độ cực nhanh, sử dụng các tiêu chí tiêu cự cô đọng.';
      cameraReport = lang === 'en'
        ? 'Dolly tracks and vertical transitions pre-aligned for Shopee/TikTok scroll pacing.'
        : 'Chuyển động dolly và chuyển cảnh dọc tối ưu hóa cho nhịp lướt Shopee/TikTok.';
    } else if (videoModel === 'Veo 3.1 Quality') {
      structureReport = lang === 'en'
        ? 'Hyper-detailed scene descriptors injected, maximizing refractive lighting details.'
        : 'Tự động bơm nhiều mô tả chi tiết quang học, phản chiếu và khúc xạ ánh sáng kính.';
      cameraReport = lang === 'en'
        ? 'Stabilized cinematic pans, slow slider glides, and anamorphic depth presets.'
        : 'Góc lia máy slow-pan điện ảnh, thanh trượt slider cực êm và độ sâu trường ảnh anamorphic.';
    } else {
      structureReport = lang === 'en'
        ? 'Balanced prompt weights, matching consistent character lock presets.'
        : 'Độ cân bằng trọng số prompt tốt, khớp hoàn hảo với các thiết lập khóa nhân vật.';
      cameraReport = lang === 'en'
        ? 'Clean standard dolly and focal tracking movements.'
        : 'Chuyển động tịnh tiến tiêu chuẩn sạch sẽ và lấy nét mượt mà.';
    }

    return { pacingReport, structureReport, cameraReport };
  };

  const report = getModelIntelligenceReport();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" id="project_settings_dialog">
      <div className="w-full max-w-2xl bg-[#090909] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(77,166,255,0.15)] flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white/[0.02] border-b border-white/5 py-4.5 px-6 shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#4DA6FF] animate-pulse" />
            <h3 className="text-base font-display font-extrabold text-white tracking-widest uppercase">
              {lang === 'en' ? '⚙ HIDRO AI PRODUCTION OPERATING SYSTEM - CONFIG' : '⚙ HỆ ĐIỀU HÀNH SẢN XUẤT HIDRO AI - CẤU HÌNH'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-white/10 flex-1 text-slate-300">
          
          {/* Section 1: Workspace & General */}
          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
            <h4 className="text-xs font-display font-black text-[#66FF99] tracking-wider uppercase flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Users className="w-3.5 h-3.5" />
              {lang === 'en' ? 'GENERAL & WORKSPACE ENVIRONMENT' : 'MÔI TRƯỜNG LÀM VIỆC & THIẾT LẬP CHUNG'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                  {lang === 'en' ? 'Project Name' : 'Tên dự án'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:border-[#4DA6FF] outline-none font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                  {lang === 'en' ? 'Workspace Mode' : 'Chế độ Workspace'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWorkspaceMode('SOLO')}
                    className={`py-2 px-3 text-xs rounded-xl border transition-all uppercase font-mono ${
                      workspaceMode === 'SOLO'
                        ? 'bg-[#4DA6FF]/10 border-[#4DA6FF] text-[#4DA6FF] font-bold'
                        : 'bg-black border-white/5 text-gray-400 hover:bg-white/[0.02]'
                    }`}
                  >
                    👤 SOLO MODE
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkspaceMode('TEAM')}
                    className={`py-2 px-3 text-xs rounded-xl border transition-all uppercase font-mono ${
                      workspaceMode === 'TEAM'
                        ? 'bg-purple-500/10 border-purple-500 text-purple-400 font-bold'
                        : 'bg-black border-white/5 text-gray-400 hover:bg-white/[0.02]'
                    }`}
                  >
                    👥 TEAM MODE
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: PROJECT DNA PROFILE */}
          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
            <h4 className="text-xs font-display font-black text-[#4DA6FF] tracking-wider uppercase flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {lang === 'en' ? 'PROJECT PRODUCTION DNA PROFILE' : 'HỒ SƠ DNA DỰ ÁN SẢN XUẤT'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                  {lang === 'en' ? 'Brand Name / Product' : 'Tên thương hiệu / Sản phẩm'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'en' ? 'e.g. Luxury Blender V10, White Glow Cream' : 'Ví dụ: Máy xay Luxury, Kem dưỡng trắng'}
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:border-[#4DA6FF] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                  {lang === 'en' ? 'UGC Video Type' : 'Loại hình video'}
                </label>
                <select
                  value={videoType}
                  onChange={(e) => setVideoType(e.target.value as any)}
                  className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:border-[#4DA6FF] outline-none"
                >
                  <option value="Affiliate">UGC Affiliate</option>
                  <option value="TVC">Product TVC</option>
                  <option value="TikTok Viral">TikTok Viral</option>
                  <option value="Ads">High-Conversion Ads</option>
                  <option value="Documentary">AI Documentary</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 uppercase block">
                  {lang === 'en' ? 'Target Audience Gender' : 'Giới tính khách hàng'}
                </label>
                <div className="flex gap-1 bg-black p-1 rounded-xl border border-white/5">
                  {(['All', 'Male', 'Female'] as const).map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`flex-1 py-1 text-[10px] rounded transition-all uppercase font-mono ${
                        gender === g ? 'bg-white/10 text-white font-bold' : 'text-gray-500 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 uppercase block">
                  {lang === 'en' ? 'Target Age Group' : 'Độ tuổi khách hàng'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 18-35, Mid-career"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full p-1.5 bg-black border border-white/10 rounded-xl text-xs text-white text-center font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 uppercase block">
                  {lang === 'en' ? 'Target Country' : 'Quốc gia mục tiêu'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vietnam, USA, JP"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-1.5 bg-black border border-white/10 rounded-xl text-xs text-white text-center font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                  {lang === 'en' ? 'Video Style Concept' : 'Phong cách nghệ thuật Video'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Warm minimal kitchen, Apple style cinematic studio"
                  value={videoStyle}
                  onChange={(e) => setVideoStyle(e.target.value)}
                  className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:border-[#4DA6FF] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                  {lang === 'en' ? 'Target Platform' : 'Nền tảng truyền thông'}
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:border-[#4DA6FF] outline-none cursor-pointer"
                >
                  {PLATFORMS.map(pf => (
                    <option key={pf} value={pf}>{pf}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: ADVANCED 4-TIER MODEL REGISTRY */}
          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
            <h4 className="text-xs font-display font-black text-[#FFCC00] tracking-wider uppercase flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Cpu className="w-3.5 h-3.5" />
              {lang === 'en' ? 'AI PRODUCTION ENGINE MODEL REGISTRY (4-TIER)' : 'ĐĂNG KÝ MÔ HÌNH SẢN XUẤT 4 LỚP'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* IMAGE MODEL */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-emerald-400 block uppercase font-bold tracking-wider">
                  🖼 IMAGE MODEL (THIẾT KẾ)
                </label>
                <select
                  value={imageModel}
                  onChange={(e) => setImageModel(e.target.value as any)}
                  className="w-full p-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:border-emerald-400 outline-none"
                >
                  <option value="Nano Banana Pro">Nano Banana Pro [Character Lock]</option>
                  <option value="Nano Banana 2">Nano Banana 2 [Speed Optimize]</option>
                  <option value="Imagen 4">Imagen 4 [Commercial Photography]</option>
                </select>
                <p className="text-[9px] text-gray-500 font-sans italic">Defines consistent character and product representation.</p>
              </div>

              {/* VIDEO MODEL */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-[#4DA6FF] block uppercase font-bold tracking-wider">
                  ⚡ VIDEO MODEL (CHUYỂN ĐỘNG)
                </label>
                <select
                  value={videoModel}
                  onChange={(e) => setVideoModel(e.target.value as any)}
                  className="w-full p-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:border-[#4DA6FF] outline-none"
                >
                  <option value="Omni Flash">Omni Flash [Fast 8s rendering]</option>
                  <option value="Veo 3.1 Lite">Veo 3.1 Lite [Budget 5s rendering]</option>
                  <option value="Veo 3.1 Fast">Veo 3.1 Fast [Balanced 8s rendering]</option>
                  <option value="Veo 3.1 Quality">Veo 3.1 Quality [Premium TVC 10s]</option>
                </select>
                <p className="text-[9px] text-gray-500 font-sans italic">Defines frame rate, movement stability, and cinematic dolly tracks.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SCRIPT MODEL */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-indigo-400 block uppercase font-bold tracking-wider">
                  ✍ SCRIPT MODEL (KỊCH BẢN)
                </label>
                <select
                  value={scriptModel}
                  onChange={(e) => setScriptModel(e.target.value)}
                  className="w-full p-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:border-indigo-400 outline-none"
                >
                  {SCRIPT_MODELS_DATA.map(sm => (
                    <option key={sm.id} value={sm.id}>{sm.id} ({sm.desc})</option>
                  ))}
                </select>
              </div>

              {/* VOICE MODEL */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-purple-400 block uppercase font-bold tracking-wider">
                  🗣 VOICE MODEL (THUYẾT MINH)
                </label>
                <select
                  value={voiceModel}
                  onChange={(e) => setVoiceModel(e.target.value)}
                  className="w-full p-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:border-purple-400 outline-none"
                >
                  {VOICE_MODELS_DATA.map(vm => (
                    <option key={vm.id} value={vm.id}>{vm.id} ({vm.desc})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: PACING & SCENE TIMINGS */}
          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
            <h4 className="text-xs font-display font-black text-white tracking-wider uppercase flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Sliders className="w-3.5 h-3.5 text-[#66FF99]" />
              {lang === 'en' ? 'SCENE TIMINGS & AUTO-SYNC PACING' : 'THIẾT LẬP CẢNH & NHỊP ĐỘ ĐỒNG BỘ'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Scene Count Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400">{lang === 'en' ? 'Scene Count' : 'Số lượng cảnh'} (1-100)</span>
                  <span className="text-white font-bold bg-[#66FF99]/10 border border-[#66FF99]/20 px-2 py-0.5 rounded text-[10px]">
                    {sceneCount} {lang === 'en' ? 'Scenes' : 'Cảnh'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={sceneCount}
                    onChange={(e) => setSceneCount(Number(e.target.value))}
                    className="flex-1 accent-[#66FF99] bg-white/10 h-1 rounded-lg"
                  />
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={sceneCount}
                    onChange={(e) => setSceneCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                    className="w-16 p-1.5 bg-black border border-white/10 rounded-lg text-center text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Video Length Mode Selector */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-[#4DA6FF] block font-bold uppercase tracking-wider">
                  {lang === 'en' ? 'Video Length Duration' : 'Độ dài video'}
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {['Auto', '15s', '30s', '45s'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setVideoLengthMode(m);
                        if (m !== 'Auto') setCustomLength(parseInt(m));
                      }}
                      className={`py-1.5 text-[10px] rounded border font-mono transition-all uppercase ${
                        videoLengthMode === m
                          ? 'bg-[#4DA6FF]/15 border-[#4DA6FF] text-[#4DA6FF] font-bold'
                          : 'bg-black border-white/5 text-gray-500 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {['60s', '90s', '120s', 'Custom'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setVideoLengthMode(m);
                        if (m !== 'Custom' && m !== 'Auto') setCustomLength(parseInt(m));
                      }}
                      className={`py-1.5 text-[10px] rounded border font-mono transition-all uppercase ${
                        videoLengthMode === m
                          ? 'bg-[#4DA6FF]/15 border-[#4DA6FF] text-[#4DA6FF] font-bold'
                          : 'bg-black border-white/5 text-gray-500 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {videoLengthMode === 'Custom' && (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      min="5"
                      max="600"
                      value={customLength}
                      onChange={(e) => setCustomLength(Math.max(5, Number(e.target.value) || 5))}
                      className="w-20 p-2 bg-black border border-white/10 rounded-lg text-center text-xs text-white font-mono"
                    />
                    <span className="text-[10px] text-gray-500 font-mono">seconds (giây)</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-[11px] text-gray-400 font-mono flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span>{lang === 'en' ? 'Resolved Playback:' : 'Tính toán phát lại thực tế:'} </span>
              <span className="text-[#64ffda] font-bold">{calculatedDuration} giây (seconds) {videoLengthMode === 'Auto' && ` [Auto: ${sceneCount} x ${modelPaceMultiplier}s]`}</span>
            </div>
          </div>

          {/* Section 4b: ADVANCED RENDERING SETTINGS */}
          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4 font-sans text-slate-300">
            <h4 className="text-xs font-display font-black text-[#4DA6FF] tracking-wider uppercase flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Cpu className="w-3.5 h-3.5" />
              {lang === 'en' ? 'ADVANCED VIDEO RENDERING & COMPILER CONFIG' : 'CẤU HÌNH KẾT XUẤT SẢN PHẨM & BIÊN DỊCH'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                  {lang === 'en' ? 'Output Resolution' : 'Độ phân giải đầu ra'}
                </label>
                <select
                  value={outputQuality}
                  onChange={(e) => setOutputQuality(e.target.value)}
                  className="w-full p-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:border-[#4DA6FF] outline-none"
                >
                  <option value="720p">720p (HD Ready)</option>
                  <option value="1080p">1080p (Full HD - Production)</option>
                  <option value="4K">4K (Ultra HD - Cinematic)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                  {lang === 'en' ? 'Frames Per Second (FPS)' : 'Tốc độ khung hình (FPS)'}
                </label>
                <select
                  value={fpsSetting}
                  onChange={(e) => setFpsSetting(e.target.value)}
                  className="w-full p-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:border-[#4DA6FF] outline-none"
                >
                  <option value="24">24 FPS (Cinematic Cinematic)</option>
                  <option value="30">30 FPS (Standard Social)</option>
                  <option value="60">60 FPS (Ultra Smooth Motion)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                  {lang === 'en' ? 'Aspect Ratio' : 'Tỉ lệ khung hình'}
                </label>
                <select
                  value={aspectRatioSetting}
                  onChange={(e) => setAspectRatioSetting(e.target.value)}
                  className="w-full p-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:border-[#4DA6FF] outline-none"
                >
                  <option value="16:9">16:9 (Landscape - YouTube)</option>
                  <option value="9:16">9:16 (Portrait - TikTok/Reels)</option>
                  <option value="1:1">1:1 (Square - Instagram)</option>
                  <option value="21:9">21:9 (Ultrawide - Movie)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                  {lang === 'en' ? 'Render Queue Strategy' : 'Chiến dịch hàng đợi Render'}
                </label>
                <select
                  value={renderQueueStrategy}
                  onChange={(e) => setRenderQueueStrategy(e.target.value)}
                  className="w-full p-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:border-[#4DA6FF] outline-none"
                >
                  <option value="Sequential">{lang === 'en' ? 'Sequential (Safe)' : 'Tuần tự (An toàn)'}</option>
                  <option value="Parallel">{lang === 'en' ? 'Parallel (Fast)' : 'Song song (Tốc độ)'}</option>
                  <option value="Maximum Speed">{lang === 'en' ? 'Maximum Speed' : 'Cực đại (Tối đa)'}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                  {lang === 'en' ? 'Prompt Blueprint' : 'Kiến trúc Prompt'}
                </label>
                <select
                  value={promptArchitecture}
                  onChange={(e) => setPromptArchitecture(e.target.value)}
                  className="w-full p-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:border-[#4DA6FF] outline-none"
                >
                  <option value="Standard">Standard Matrix</option>
                  <option value="Commercial">Commercial UGC Boost</option>
                  <option value="TikTok">Viral TikTok Hooks</option>
                  <option value="UGC">Interactive UGC Style</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                  {lang === 'en' ? 'AI Router Engine' : 'Trình định tuyến AI Router'}
                </label>
                <button
                  type="button"
                  onClick={() => setIsAutoAiRouter(!isAutoAiRouter)}
                  className={`w-full py-2 px-3 text-xs rounded-xl border transition-all uppercase font-mono ${
                    isAutoAiRouter
                      ? 'bg-[#66FF99]/10 border-[#66FF99] text-[#66FF99] font-bold'
                      : 'bg-black border-white/5 text-gray-400 hover:bg-white/[0.02]'
                  }`}
                >
                  🤖 {isAutoAiRouter ? (lang === 'en' ? 'ACTIVE (Smart Routing)' : 'ĐANG CHẠY (Tự động)') : (lang === 'en' ? 'DISABLED (Manual)' : 'TẮT (Thủ công)')}
                </button>
              </div>
            </div>
          </div>

          {/* Section 4c: CUSTOM DNA SLIDERS & ACTIVE BACKUPS */}
          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4 text-slate-300">
            <h4 className="text-xs font-display font-black text-[#66FF99] tracking-wider uppercase flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              {lang === 'en' ? 'DEEP CELL DNA PROMPT PARAMETERS & DISASTER RECOVERY' : 'THÔNG SỐ DNA PROMPT CHUYÊN SÂU & SAO LƯU'}
            </h4>

            {/* Slider parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              {/* Seed */}
              <div className="space-y-1.5">
                <label className="text-gray-400 block">{lang === 'en' ? 'Randomization Seed' : 'Hạt giống ngẫu nhiên (Seed)'}</label>
                <input
                  type="text"
                  value={advancedSeed}
                  onChange={(e) => setAdvancedSeed(e.target.value)}
                  className="w-full p-2 bg-black border border-white/10 rounded-xl text-xs text-center text-white"
                />
              </div>

              {/* Consistency Lock */}
              <div className="space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>{lang === 'en' ? 'Refractive Consistency' : 'Độ nhất quán quang học (Visual consistency)'}</span>
                  <span className="text-[#64ffda]">{advancedConsistency}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={advancedConsistency}
                  onChange={(e) => setAdvancedConsistency(Number(e.target.value))}
                  className="w-full accent-[#66FF99] bg-white/10 h-1 rounded"
                />
              </div>

              {/* Character Lock */}
              <div className="space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>{lang === 'en' ? 'Character Lock Strength' : 'Độ khóa nhân vật (Character consistency)'}</span>
                  <span className="text-[#64ffda]">{advancedCharLock}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={advancedCharLock}
                  onChange={(e) => setAdvancedCharLock(Number(e.target.value))}
                  className="w-full accent-[#66FF99] bg-white/10 h-1 rounded"
                />
              </div>

              {/* Product Lock */}
              <div className="space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>{lang === 'en' ? 'Product Lock Strength' : 'Độ khóa sản phẩm (Product consistency)'}</span>
                  <span className="text-[#64ffda]">{advancedProductLock}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={advancedProductLock}
                  onChange={(e) => setAdvancedProductLock(Number(e.target.value))}
                  className="w-full accent-[#66FF99] bg-white/10 h-1 rounded"
                />
              </div>

              {/* Motion Dynamics */}
              <div className="space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>{lang === 'en' ? 'Motion Vector Pacing' : 'Tốc độ chuyển động (Motion speed)'}</span>
                  <span className="text-[#64ffda]">{advancedMotion}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={advancedMotion}
                  onChange={(e) => setAdvancedMotion(Number(e.target.value))}
                  className="w-full accent-[#66FF99] bg-white/10 h-1 rounded"
                />
              </div>

              {/* Camera Freedom */}
              <div className="space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>{lang === 'en' ? 'Camera Motion Freedom' : 'Tự do góc camera (Camera tracking angles)'}</span>
                  <span className="text-[#64ffda]">{advancedCameraFreedom}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={advancedCameraFreedom}
                  onChange={(e) => setAdvancedCameraFreedom(Number(e.target.value))}
                  className="w-full accent-[#66FF99] bg-white/10 h-1 rounded relative"
                />
              </div>
            </div>

            {/* Backups section */}
            <div className="border-t border-white/5 pt-4 space-y-2 font-mono">
              <label className="text-[11px] text-gray-400 uppercase tracking-wider block font-bold">
                💾 {lang === 'en' ? 'HYBRID STORAGE & PRODUCTION STRATEGIES' : 'CƠ CHẾ ĐỒNG BỘ & SAO LƯU HYBRID'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => setIsAutoSave30s(!isAutoSave30s)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isAutoSave30s ? 'bg-[#66FF99]/5 border-[#66FF99]/30 text-[#66FF99]' : 'bg-black border-white/5 text-gray-500'
                  }`}
                >
                  <span className="font-bold font-mono">⏱ AUTO-SAVE (30S)</span>
                  <span className="text-[9px] text-gray-400 mt-1">{isAutoSave30s ? (lang === 'en' ? 'Auto saving background threads active' : 'Tự động lưu ngầm đang chạy') : (lang === 'en' ? 'Disabled manual actions only' : 'Đã tắt tự động lưu')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLocalStorageBackup(!isLocalStorageBackup)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isLocalStorageBackup ? 'bg-[#66FF99]/5 border-[#66FF99]/30 text-[#66FF99]' : 'bg-black border-white/5 text-gray-500'
                  }`}
                >
                  <span className="font-bold font-mono">🖥 LOCAL HARD STATE HYBRID</span>
                  <span className="text-[9px] text-gray-400 mt-1">{isLocalStorageBackup ? (lang === 'en' ? 'Sync local storage fallback key' : 'Đồng bộ khóa dự phòng cục bộ') : (lang === 'en' ? 'No browser storage fallback' : 'Không có bộ nhớ dự phòng')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsGoogleDriveBackupSync(!isGoogleDriveBackupSync)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isGoogleDriveBackupSync ? 'bg-[#4DA6FF]/5 border-[#4DA6FF]/30 text-[#4DA6FF]' : 'bg-black border-white/5 text-gray-500'
                  }`}
                >
                  <span className="font-bold font-mono">☁ GOOGLE DRIVE SECURE SYNC</span>
                  <span className="text-[9px] text-gray-400 mt-1">{isGoogleDriveBackupSync ? (lang === 'en' ? 'Continuous cloud sync active' : 'Đồng bộ hóa đám mây đang chạy') : (lang === 'en' ? 'Cloud saves disabled' : 'Không đồng bộ đám mây')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: PRODUCTION COST CALCULATOR */}
          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3">
            <h4 className="text-xs font-display font-black text-amber-400 tracking-wider uppercase flex items-center justify-between border-b border-amber-500/10 pb-2">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                {lang === 'en' ? 'COMPREHENSIVE BUDGET COST CALCULATOR' : 'BẢNG DỰ TOÁN CHI PHÍ SẢN XUẤT'}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono">ESTIMATED PROMPT RATES</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-black/50 border border-white/5 rounded-xl space-y-1">
                <span className="text-[10px] text-gray-500 block uppercase font-bold select-none">{lang === 'en' ? 'Image Prompt Cost' : 'Chi phí hình ảnh'}</span>
                <span className="text-white font-extrabold block text-sm">${imageTotalCost.toFixed(2)}</span>
                <span className="text-[9px] text-gray-400 block leading-tight">{numScenes} slides × ${singleImageCost.toFixed(2)} ({imageModel})</span>
              </div>

              <div className="p-3 bg-black/50 border border-white/5 rounded-xl space-y-1">
                <span className="text-[10px] text-gray-500 block uppercase font-bold select-none">{lang === 'en' ? 'Video Motion Cost' : 'Chi phí chuyển động'}</span>
                <span className="text-white font-extrabold block text-sm">${videoTotalCost.toFixed(2)}</span>
                <span className="text-[9px] text-gray-400 block leading-tight">{resolvedDuration}s runtime × ${singleVideoCostPerSec.toFixed(3)} ({videoModel})</span>
              </div>

              <div className="p-3 bg-black/50 border border-white/5 rounded-xl space-y-1">
                <span className="text-[10px] text-gray-500 block uppercase font-bold select-none">{lang === 'en' ? 'Voice Synthesizer Cost' : 'Chi phí thuyết minh'}</span>
                <span className="text-white font-extrabold block text-sm">${voiceTotalCost.toFixed(2)}</span>
                <span className="text-[9px] text-gray-400 block leading-tight">{resolvedDuration}s runtime × ${singleVoiceCostPerSec.toFixed(3)} ({voiceModel})</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/10 text-xs font-mono">
              <span className="font-extrabold text-[#FFD700] uppercase select-none">{lang === 'en' ? 'estimated grand total production cost:' : 'TỔNG CHI PHÍ DỰ TOÁN DỰ ÁN:'}</span>
              <span className="text-xl font-black text-amber-300">${grandTotalCost.toFixed(2)}</span>
            </div>
          </div>

          {/* Section 6: Model Intelligence Override Report */}
          <div className="p-4.5 rounded-2xl bg-[#0F0F1A]/40 border border-indigo-500/10 space-y-2 text-xs font-mono">
            <h5 className="text-[10px] tracking-wider text-indigo-400 font-bold uppercase flex items-center gap-1.5 leading-none">
              <Cpu className="w-4 h-4" />
              {lang === 'en' ? 'MODEL INTELLIGENCE OVERRIDE REPORT' : 'BÁO CÁO TRÍ TUỆ MÔ HÌNH TỰ ĐỘNG'}
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 border-t border-white/5 text-[9px] text-gray-400 leading-relaxed">
              <div>
                <span className="text-gray-550 block font-bold">{lang === 'en' ? 'SCENE PACING:' : 'NHỊP ĐỘ CẢNH:'}</span>
                <span className="text-white">{report.pacingReport}</span>
              </div>
              <div>
                <span className="text-gray-550 block font-bold">{lang === 'en' ? 'PROMPT TIMELINES:' : 'CẤU TRÚC PROMPT:'}</span>
                <span className="text-white">{report.structureReport}</span>
              </div>
              <div>
                <span className="text-gray-550 block font-bold">{lang === 'en' ? 'CAMERA & MOTION:' : 'MÁY & CHUYỂN ĐỘNG:'}</span>
                <span className="text-white">{report.cameraReport}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/5"
          >
            {lang === 'en' ? 'Close' : 'Hủy bỏ'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-xl text-xs font-mono font-bold bg-[#4DA6FF] text-black hover:bg-[#4DA6FF]/90 transition-all cursor-pointer"
          >
            {lang === 'en' ? 'Apply Settings' : 'Áp dụng thiết lập'}
          </button>
        </div>

      </div>
    </div>
  );
}
