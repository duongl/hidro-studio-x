import React, { useState, useEffect } from 'react';
import { Project, ProjectType, ImageModel, VideoModel, SceneCard } from '../types';
import { X, Settings, Cpu, ShieldAlert, Sparkles, Sliders } from 'lucide-react';
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
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  // Real-time calculated duration
  const activeVideoModel = VIDEO_MODELS_DATA.find(vm => vm.id === videoModel) || VIDEO_MODELS_DATA[0];
  const modelPaceMultiplier = activeVideoModel.multiplier;
  const calculatedDuration = videoLengthMode === 'Auto' ? sceneCount * modelPaceMultiplier : customLength;

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
        const fallbackText = `Automated scene ${nextIdx} for brand campaign context.`;
        
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
      videoLengthMode: videoLengthMode as any,
      customVideoLength: customLength,
      targetLanguage: projLang as any,
      scenes: resScenes,
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
      <div className="w-full max-w-2xl bg-[#090909] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(77,166,255,0.15)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white/[0.02] border-b border-white/5 py-4.5 px-6 shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#4DA6FF] animate-pulse" />
            <h3 className="text-base font-display font-extrabold text-white tracking-widest uppercase">
              {lang === 'en' ? '⚙ PROJECT SETTINGS & CONFIG' : '⚙ THIẾT LẬP DỰ ÁN'}
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
        <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-white/10 flex-1">
          
          {/* Section 1: Project Essentials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                {lang === 'en' ? 'Project Name' : 'Tên dự án'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white placeholder-gray-700 focus:border-[#4DA6FF] outline-none font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                {lang === 'en' ? 'Workflow Production Type' : 'Thể loại sản xuất'}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ProjectType)}
                className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:border-[#4DA6FF] outline-none cursor-pointer"
              >
                {WORKFLOW_TYPES.map(wt => (
                  <option key={wt} value={wt}>{wt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                {lang === 'en' ? 'Target Platform' : 'Nền tảng đích'}
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

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                {lang === 'en' ? 'Target Output Language' : 'Ngôn ngữ đầu ra'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProjLang('Vietnamese')}
                  className={`py-2 px-3 text-xs rounded-xl border transition-all ${
                    projLang === 'Vietnamese'
                      ? 'bg-[#66FF99]/10 border-[#66FF99] text-[#66FF99] font-bold'
                      : 'bg-black border-white/5 text-gray-400 hover:bg-white/[0.02]'
                  }`}
                >
                  Tiếng Việt
                </button>
                <button
                  type="button"
                  onClick={() => setProjLang('English')}
                  className={`py-2 px-3 text-xs rounded-xl border transition-all ${
                    projLang === 'English'
                      ? 'bg-[#66FF99]/10 border-[#66FF99] text-[#66FF99] font-bold'
                      : 'bg-black border-white/5 text-gray-400 hover:bg-white/[0.02]'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Pacing & Scenes */}
          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
            <h4 className="text-xs font-display font-bold text-white tracking-wider uppercase flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#66FF99]" />
              {lang === 'en' ? 'Scene Settings & Auto-Sync Engine' : 'Thiết lập cảnh & Cơ chế đồng bộ'}
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
                <span className="text-[10px] text-yellow-400/90 leading-tight block">
                  ⚠️ {lang === 'en' ? 'Automatic sync keeps AI Director & scenes intact.' : 'Hệ thống tự động thêm/bớt và giữ đồng bộ tất cả các bước.'}
                </span>
              </div>

              {/* Video Length Mode Selector */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 block">
                  {lang === 'en' ? 'Video Length Duration' : 'Độ dài video'}
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {['Auto', '15s', '30s', '60s'].map(m => (
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
                  {['90s', '120s', 'Custom'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setVideoLengthMode(m);
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
                  <div className="col-span-1" />
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

                <div className="text-[10px] text-gray-400 font-mono">
                  {lang === 'en' ? 'Resolved Playback:' : 'Tính toán phát lại:'}{' '}
                  <span className="text-[#66FF99] font-bold">{calculatedDuration} giây (seconds)</span>{' '}
                  {videoLengthMode === 'Auto' && ` (Auto calculated: ${sceneCount} × ${modelPaceMultiplier}s)`}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: AI Generation Engine Choices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
              <span className="text-xs font-mono text-[#66FF99] uppercase block font-bold">
                🖼 {lang === 'en' ? 'Image Prompt Model' : 'Mô hình thiết kế'}
              </span>
              <div className="space-y-2">
                {IMAGE_MODELS_DATA.map(im => (
                  <label 
                    key={im.id}
                    className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                      imageModel === im.id
                        ? 'bg-[#66FF99]/5 border-[#66FF99]/30 text-white'
                        : 'bg-black/50 border-white/5 text-gray-400 hover:bg-black/70'
                    }`}
                  >
                    <input
                      type="radio"
                      name="image_model_settings"
                      checked={imageModel === im.id}
                      onChange={() => setImageModel(im.id)}
                      className="mt-0.5 accent-[#66FF99]"
                    />
                    <div>
                      <div className="text-[10px] font-mono font-bold text-white">{im.id}</div>
                      <div className="text-[8px] text-gray-500 leading-tight font-sans">{im.efficiency}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
              <span className="text-xs font-mono text-[#4DA6FF] uppercase block font-bold">
                ⚡ {lang === 'en' ? 'Video Prompt Model' : 'Mô hình chuyển động'}
              </span>
              <div className="space-y-2">
                {VIDEO_MODELS_DATA.map(vm => (
                  <label 
                    key={vm.id}
                    className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                      videoModel === vm.id
                        ? 'bg-[#4DA6FF]/5 border-[#4DA6FF]/30 text-white'
                        : 'bg-black/50 border-white/5 text-gray-400 hover:bg-black/70'
                    }`}
                  >
                    <input
                      type="radio"
                      name="video_model_settings"
                      checked={videoModel === vm.id}
                      onChange={() => setVideoModel(vm.id)}
                      className="mt-0.5 accent-[#4DA6FF]"
                    />
                    <div>
                      <div className="text-[10px] font-mono font-bold text-white">{vm.id} - <span className="text-[#4DA6FF]">{vm.pace}</span></div>
                      <div className="text-[8px] text-gray-500 leading-tight font-sans">{vm.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Model Intelligence Report */}
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
