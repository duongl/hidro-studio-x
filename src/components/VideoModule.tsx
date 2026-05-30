import React, { useState, useEffect, useRef } from 'react';
import { Project, SceneCard } from '../types';
import { 
  Sparkles, 
  Info, 
  Compass, 
  Sliders, 
  Check, 
  Copy, 
  ChevronRight, 
  Play, 
  Pause, 
  RefreshCw, 
  Zap, 
  Video, 
  Film, 
  Cpu, 
  Gauge, 
  Activity, 
  AlertTriangle 
} from 'lucide-react';
import { useLanguage } from '../utils/i18n';
import { generateSyntheticCinematicSvg } from '../utils';

interface VideoModuleProps {
  project: Project;
  onAdvanceStep: () => void;
  onMotionCompleted: () => void;
}

type MotionEngine = 'Kling' | 'Veo' | 'Runway' | 'Hailuo' | 'Seedance';

export default function VideoModule({ project, onAdvanceStep, onMotionCompleted }: VideoModuleProps) {
  const { lang, t } = useLanguage();
  const [engine, setEngine] = useState<MotionEngine>('Veo');
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);

  // RENDER PIPELINE STATES (Sequential Render Simulation)
  const [isQueueRunning, setIsQueueRunning] = useState(false);
  const [currentRenderingId, setCurrentRenderingId] = useState<string | null>(null);
  const [renderProgress, setRenderProgress] = useState<Record<string, number>>({});
  const [tickerText, setTickerText] = useState<string>('');
  
  // Local state for fully completed scene videos (loaded on mount or successfully rendered)
  const [completedSceneVideos, setCompletedSceneVideos] = useState<Set<string>>(() => {
    // If project is already marked motion completed, treat all as rendered
    if (project.motionCompleted && project.scenes) {
      return new Set(project.scenes.map(s => s.id));
    }
    return new Set<string>();
  });

  const renderTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTarget(identifier);
    setTimeout(() => {
      setCopiedTarget(null);
    }, 1500);
  };

  const handleFinishMotion = () => {
    onMotionCompleted();
    onAdvanceStep();
  };

  const enginesList: { name: MotionEngine; desc: string; resolution: string; engineAccent: string }[] = [
    { name: 'Veo', desc: 'Google DeepMind spatial cinematic fluid model.', resolution: '4K hyper-clarity', engineAccent: '#D9FF1F' },
    { name: 'Kling', desc: 'Superior multi-axial camera-rig physics simulation.', resolution: '1080p high', engineAccent: '#66FF99' },
    { name: 'Runway', desc: 'High motion fidelity with custom depth-graded vectors.', resolution: '1080p 60fps', engineAccent: '#4DA6FF' },
    { name: 'Hailuo', desc: 'Dynamic physics engine & fast fluid transformations.', resolution: '720p velocity', engineAccent: '#FF9E2A' },
    { name: 'Seedance', desc: 'Slick stylized micro-focus transitions.', resolution: '1080p artistic', engineAccent: '#FF7CC4' },
  ];

  // REALTIME PROGRESSION TICKERS
  const getRenderTicker = (percent: number) => {
    if (lang === 'vn') {
      if (percent < 25) return `[${percent}%] Khởi động vi xử lý đồ họa, phân tích ma trận khung sườn...`;
      if (percent < 50) return `[${percent}%] Nội suy vector máy quay Dolly, tính toán chiều sâu ống kính...`;
      if (percent < 75) return `[${percent}%] Đúc bề mặt phản chiếu vân kính Liquid Glass, bù đắp hạt nhuyễn...`;
      if (percent < 95) return `[${percent}%] Nội suy chuyển động luồng chất lỏng, khử răng cưa AI...`;
      return `[${percent}%] Kết hợp màu thông minh, xuất bản video 4K tuyệt hảo...`;
    } else {
      if (percent < 25) return `[${percent}%] Contacting AI supercluster, parsing video structural metadata...`;
      if (percent < 50) return `[${percent}%] Synthesizing Dolly kinetic motion vectors and camera focal lengths...`;
      if (percent < 75) return `[${percent}%] Baking Liquid Glass refraction grids and ambient volumetric haze...`;
      if (percent < 95) return `[${percent}%] Compulating fluid dynamic physics multipliers and neural framewritting...`;
      return `[${percent}%] Finalizing 4K cinematic video assembly and color grading...`;
    }
  };

  // SEQUENTIAL SIMULATION CONTROLLER
  const startMotionCompilation = () => {
    if (!project.scenes || project.scenes.length === 0) return;
    setIsQueueRunning(true);

    const pendingScenes = project.scenes.filter(s => !completedSceneVideos.has(s.id));
    if (pendingScenes.length === 0) {
      // Re-compile all
      setCompletedSceneVideos(new Set());
      setRenderProgress({});
      executeSequentialCompile(project.scenes, 0);
    } else {
      // Pick up where we left off
      const firstPendingIdx = project.scenes.findIndex(s => !completedSceneVideos.has(s.id));
      executeSequentialCompile(project.scenes, firstPendingIdx);
    }
  };

  const stopMotionCompilation = () => {
    setIsQueueRunning(false);
    setCurrentRenderingId(null);
    if (renderTimerRef.current) {
      clearInterval(renderTimerRef.current);
    }
  };

  const executeSequentialCompile = (scenes: SceneCard[], currentIndex: number) => {
    if (currentIndex >= scenes.length) {
      // Finished all scenes!
      setIsQueueRunning(false);
      setCurrentRenderingId(null);
      // Mark all scenes fully compiled
      const allIds = new Set(scenes.map(s => s.id));
      setCompletedSceneVideos(allIds);
      // Trigger context finish
      setTimeout(() => {
        handleFinishMotion();
      }, 500);
      return;
    }

    const scene = scenes[currentIndex];
    setCurrentRenderingId(scene.id);
    setRenderProgress(prev => ({ ...prev, [scene.id]: 5 }));
    setTickerText(getRenderTicker(5));

    let currentProg = 5;
    
    if (renderTimerRef.current) {
      clearInterval(renderTimerRef.current);
    }

    renderTimerRef.current = setInterval(() => {
      currentProg += Math.floor(Math.random() * 12) + 6;
      if (currentProg >= 100) {
        currentProg = 100;
        setRenderProgress(prev => ({ ...prev, [scene.id]: 100 }));
        setCompletedSceneVideos(prev => {
          const updated = new Set(prev);
          updated.add(scene.id);
          return updated;
        });

        clearInterval(renderTimerRef.current!);
        
        // Brief success pause, then move to next scene
        setTimeout(() => {
          if (isQueueRunning) {
            executeSequentialCompile(scenes, currentIndex + 1);
          }
        }, 1000);
      } else {
        setRenderProgress(prev => ({ ...prev, [scene.id]: currentProg }));
        setTickerText(getRenderTicker(currentProg));
      }
    }, 350);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (renderTimerRef.current) {
        clearInterval(renderTimerRef.current);
      }
    };
  }, []);

  // Listen to outer queue state
  useEffect(() => {
    if (!isQueueRunning) {
      if (renderTimerRef.current) clearInterval(renderTimerRef.current);
      setCurrentRenderingId(null);
    }
  }, [isQueueRunning]);

  const isAllVideosDone = project.scenes && project.scenes.length > 0 && completedSceneVideos.size === project.scenes.length;

  return (
    <div className="space-y-6 animate-fade-in text-[#e5e5e5]" id="video_module_panel">
      {/* CSS Injection containing our gorgeous cinematic panning keyframe animations */}
      <style>{`
        @keyframes cinematicZoomPan {
          0% { transform: scale(1.0) translate(0px, 0px); }
          25% { transform: scale(1.08) translate(-1.5%, 1%); }
          50% { transform: scale(1.15) translate(1%, -1.5%); }
          75% { transform: scale(1.08) translate(-0.5%, -1%); }
          100% { transform: scale(1.0) translate(0px, 0px); }
        }
        .animate-cinematic-viewport {
          animation: cinematicZoomPan 20s ease-in-out infinite;
        }
        @keyframes scanOverlay {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-laser-scan {
          animation: scanOverlay 2.5s linear infinite;
        }
      `}</style>

      {/* Header and Engine Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-display font-black text-white tracking-tight flex items-center gap-2">
              🎬 {t('motionTitle')}
            </h2>
            <span className="bg-[#D9FF1F]/10 text-[#D9FF1F] border border-[#D9FF1F]/30 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full select-none">
              {t('motionBetaBadge')}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {t('motionSubtitle')}
          </p>
        </div>

        {project.scenes?.length > 0 && (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => {
                if (isQueueRunning) {
                  stopMotionCompilation();
                } else {
                  startMotionCompilation();
                }
              }}
              className={`px-6 py-3 rounded-full text-xs font-mono font-black uppercase flex items-center gap-2 tracking-wider shadow-md transition-all cursor-pointer ${
                isQueueRunning
                  ? 'bg-amber-400 text-black hover:bg-amber-450 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                  : 'bg-[#D9FF1F] text-black hover:bg-[#C7F018] shadow-[0_0_20px_rgba(217,255,31,0.35)]'
              }`}
              id="btn_toggle_motion_render"
            >
              {isQueueRunning ? (
                <>
                  <Pause className="w-4 h-4 text-black fill-black" />
                  <span>{lang === 'vn' ? 'DỪNG KẾT XUẤT' : 'STOP VIDEO RENDERING'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-black fill-black animate-pulse" />
                  <span>{lang === 'vn' ? 'KẾT XUẤT CHUYỂN ĐỘNG HÀNG LOẠT' : 'START CINEMATIC RENDER PIPELINE'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Engine selection cards */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">
          {lang === 'vn' ? 'ĐỘNG CƠ CHUYỂN ĐỘNG AI TÙY CHỌN' : 'SELECT MOTION MODEL ENGINES'}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {enginesList.map((eng) => {
            const isSel = engine === eng.name;
            return (
              <button
                key={eng.name}
                type="button"
                onClick={() => setEngine(eng.name)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isSel
                    ? 'bg-white/[0.04] border-white/20 shadow-md scale-102'
                    : 'bg-[#0E0E0E] border-white/5 text-gray-400 hover:bg-white/[0.01]'
                }`}
                style={{
                  boxShadow: isSel ? `0 6px 20px rgba(255,255,255,0.03)` : undefined
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-mono font-extrabold tracking-wider uppercase ${isSel ? 'text-white' : 'text-gray-400'}`}>
                    {eng.name}
                  </span>
                  <span className="text-[8px] font-mono text-gray-500">{eng.resolution}</span>
                </div>
                <p className="text-[9.5px] text-gray-400 leading-normal line-clamp-2">
                  {eng.desc}
                </p>
                {isSel && (
                  <div className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-[#D9FF1F] m-2 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Status Banner */}
      {isQueueRunning && (
        <div className="p-4 rounded-2xl bg-amber-400/5 border border-amber-400/20 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400"></span>
            </span>
            <div className="text-xs font-mono text-gray-300">
              <span className="text-amber-400 uppercase font-black mr-2">
                {lang === 'vn' ? 'ĐANG KẾT XUẤT PHÂN CẢNH VEO:' : 'RENDERING SECTOR PIPELINE:'}
              </span>
              <span className="text-gray-200">{tickerText}</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-amber-400/60 font-medium">
            🧬 {lang === 'vn' ? 'Tiêm màng lọc DNA chuyển động tự động' : 'Automatically binding physical dynamic vectors'}
          </div>
        </div>
      )}

      {/* Render completion state banner */}
      {isAllVideosDone && (
        <div className="p-6 rounded-[24px] bg-[#66FF99]/5 border border-[#66FF99]/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_35px_rgba(102,255,153,0.06)]" id="rendering_completion_footer">
          <div className="flex items-center gap-3 text-sm font-sans font-bold text-white">
            <Check className="w-5 h-5 text-[#66FF99] shrink-0" />
            <div>
              <h4 className="text-xs font-mono uppercase text-[#66FF99] font-black">{lang === 'vn' ? 'KẾT XUẤT HOÀN TẤT' : 'CHRONOCORPSE COMPILATION FINISHED'}</h4>
              <p className="text-[11px] text-gray-400 font-medium font-sans mt-0.5">{lang === 'vn' ? 'Toàn bộ mô phỏng chuyển động và camera rig đã đông băng.' : 'All scenes fully mapped and baked successfully into moving frames.'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleFinishMotion}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#66FF99] text-black text-xs font-mono font-black uppercase tracking-wider transition-all hover:scale-103 hover:bg-[#66FF99]/90 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(102,255,153,0.25)] cursor-pointer"
            >
              {t('continueToMasteringBtn')} <ChevronRight className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      )}

      {/* Warning Box */}
      {!isQueueRunning && !isAllVideosDone && (
        <div className="p-4 rounded-2xl bg-[#4DA6FF]/5 border border-[#4DA6FF]/15 flex items-start gap-3.5">
          <Info className="w-5 h-5 text-[#4DA6FF] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-mono text-white font-bold mb-0.5">{t('directorAdvisory')}</h4>
            <p className="text-[11px] text-gray-450 leading-relaxed">
              {t('motionSimulatedBetaDesc', { engine })}
            </p>
          </div>
        </div>
      )}

      {/* Grid of Cinematic Moving Scene Viewports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {project.scenes?.map((scene, scIdx) => {
          const isRendering = currentRenderingId === scene.id;
          const isReady = completedSceneVideos.has(scene.id);
          const progress = renderProgress[scene.id] || 0;
          const previewSrc = scene.imageUrl || generateSyntheticCinematicSvg(scene.narration, scene.action, scene.sceneNumber);

          return (
            <div
              key={scene.id}
              className={`rounded-3xl border overflow-hidden flex flex-col justify-between bg-[#0E0E0E] relative transition-all duration-300 ${
                isRendering
                  ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.08)] bg-amber-400/[0.01]'
                  : isReady
                  ? 'border-white/10 shadow-lg shadow-black/80'
                  : 'border-white/5 opacity-70'
              }`}
            >
              
              {/* Cinematic Viewport Canvas */}
              <div className="relative aspect-[16/9] w-full bg-black/90 overflow-hidden group">
                
                {/* 1. SCENE IMAGE DISPLAY WITH CINEMATIC KEN BURNS MOTION */}
                <img
                  src={previewSrc}
                  alt={`Scene ${scene.sceneNumber}`}
                  className={`w-full h-full object-cover select-none transition-filter duration-700 ${
                    isReady 
                      ? 'animate-cinematic-viewport opacity-95 filter saturate-105' 
                      : isRendering 
                      ? 'opacity-40 blur-[1px]' 
                      : 'opacity-50 grayscale contrast-125 saturate-50'
                  }`}
                  referrerPolicy="no-referrer"
                />

                {/* 2. GLOWING GRIDS & RADIAL GRADIENT GLIDE VENEER (HIGH END GLASS LOOK) */}
                <div className={`absolute inset-0 bg-gradient-to-t pointer-events-none transition-all ${
                  isReady 
                    ? 'from-black/75 via-transparent to-black/30' 
                    : 'from-black/90 via-black/40 to-black/50'
                }`} />

                {/* Ambient Shimmer Light effect for rendered clips */}
                {isReady && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                )}

                {/* 3. SCENE METADATA TOP BAR */}
                <span className="absolute top-4 left-4 bg-black/85 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-wider text-white">
                  SCENE {scene.sceneNumber}
                </span>

                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  {isRendering && (
                    <span className="bg-amber-400 text-black text-[9px] font-mono font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> {lang === 'vn' ? 'ĐAN CHẠY...' : 'BAKING...'}
                    </span>
                  )}
                  {isReady && (
                    <span 
                      className="bg-black/90 border border-[#D9FF1F]/30 text-[#D9FF1F] text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ textShadow: '0 0 5px rgba(217,255,31,0.2)' }}
                    >
                      <Zap className="w-2.5 h-2.5 fill-current animate-pulse text-[#D9FF1F]" /> 4K {engine}
                    </span>
                  )}
                  {!isRendering && !isReady && (
                    <span className="bg-black/80 backdrop-blur-sm border border-white/5 text-gray-500 text-[9px] font-mono uppercase px-2.5 py-1 rounded-full">
                      {lang === 'vn' ? 'CHỜ KẾT XUẤT' : 'QUEUED'}
                    </span>
                  )}
                </div>

                {/* 4. REALTIME RADAR SCANNING LASER PULSE FOR PROCESSING ITEMS */}
                {isRendering && (
                  <>
                    {/* Horizontal Scanning laser bar */}
                    <div className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#fbbf24] animate-laser-scan" />
                    
                    {/* Full viewport center progress bar spinner radial loader */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center p-4">
                      <div className="relative mb-2.5 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full border border-dashed border-amber-400/30 animate-spin" style={{ animationDuration: '6s' }} />
                        <div className="w-11 h-11 rounded-full border border-t-2 border-amber-400 animate-spin absolute" />
                        <Film className="w-4 h-4 text-amber-400 absolute animate-pulse" />
                      </div>
                      <span className="text-[14px] font-mono text-white font-extrabold">{progress}%</span>
                      <span className="text-[8px] font-mono text-gray-400 tracking-widest uppercase mt-0.5">{lang === 'vn' ? 'KHỞI TẠO FRAME...' : 'COMPILING FRAMES'}</span>
                    </div>
                  </>
                )}

                {/* Pending Overlay */}
                {!isRendering && !isReady && (
                  <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex flex-col items-center justify-center p-4">
                    <span className="p-2 border border-white/5 bg-white/[0.02] rounded-full text-gray-500 mb-1">
                      <Compass className="w-4 h-4 text-gray-500" />
                    </span>
                    <span className="text-[9.5px] font-mono text-gray-400 uppercase tracking-widest">{lang === 'vn' ? 'ỐNG KÍNH ĐÃ KHÓA' : 'UNRENDERED VIEWPORT'}</span>
                    <span className="text-[8px] font-mono text-gray-600 mt-0.5">{lang === 'vn' ? 'Bắt đầu render để lấp đầy ống kính' : 'Activate motion camera solver'}</span>
                  </div>
                )}

                {/* 5. AUDIO WAVE WATERMARK AT BOTTOM OF CINEMATIC CLIPS */}
                {isReady && (
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md py-1 px-2.5 rounded-md border border-white/5">
                      <Activity className="w-3 h-3 text-[#D9FF1F] animate-pulse" />
                      <span className="text-[8px] font-mono text-white tracking-widest">ACTIVE LENS SYNCHRONIZER</span>
                    </div>
                    {/* Simulated visual sound frequency waves */}
                    <div className="flex items-end gap-[1.5px] h-3 opacity-70">
                      <div className="w-[1.5px] bg-[#D9FF1F] animate-pulse" style={{ height: '30%', animationDelay: '0.1s' }} />
                      <div className="w-[1.5px] bg-[#D9FF1F] animate-pulse" style={{ height: '80%', animationDelay: '0.3s' }} />
                      <div className="w-[1.5px] bg-[#D9FF1F] animate-pulse" style={{ height: '50%', animationDelay: '0.5s' }} />
                      <div className="w-[1.5px] bg-[#D9FF1F] animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }} />
                      <div className="w-[1.5px] bg-[#D9FF1F] animate-pulse" style={{ height: '40%', animationDelay: '0.4s' }} />
                    </div>
                  </div>
                )}

              </div>

              {/* Card Meta Content Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                
                {/* Visual guidelines */}
                <div className="space-y-3.5">
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-1">
                      {lang === 'vn' ? 'PHÂN CẢNH VÀ VOICE thoại' : 'SCENE VOICEOVER NARRATION'}
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans font-medium line-clamp-2">
                      &quot;{scene.narration}&quot;
                    </p>
                  </div>

                  {/* Motion Prompt Text Box */}
                  <div className="p-3 bg-[#050505] rounded-xl border border-white/5 relative group">
                    <span className="text-[8px] font-mono text-gray-500 block mb-0.5">{lang === 'vn' ? 'PHÁT BIỂU CHUYỂN ĐỘNG AI' : 'AI MOTION INSTRUCTION'}</span>
                    <p className="text-[10.5px] text-gray-300 leading-relaxed font-mono line-clamp-3">
                      {scene.videoPrompt}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopy(scene.videoPrompt, `vp-${scene.id}`)}
                      className="absolute top-2 right-2 p-1 rounded bg-[#0E0E0E] text-gray-500 hover:text-white transition-opacity cursor-pointer border border-white/5 shadow-sm"
                    >
                      {copiedTarget === `vp-${scene.id}` ? (
                        <Check className="w-3 h-3 text-[#D9FF1F]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Camera & Physics configuration cards */}
                  <div className="grid grid-cols-2 gap-3.5 text-[10px] font-mono pt-1">
                    <div className="p-2.5 bg-[#050505] rounded-xl border border-white/5 flex flex-col justify-between">
                      <div>
                        <span className="text-gray-500 uppercase block mb-0.5 font-bold flex items-center gap-1 text-[8.5px]">
                          <Compass className="w-3 h-3 text-[#4DA6FF]" /> Camera Rig
                        </span>
                        <span className="text-gray-300 line-clamp-2 leading-normal">{scene.cameraPrompt || 'Cinematic Dolly pan view zoom'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(scene.cameraPrompt || 'Cinematic Dolly pan view zoom', `cam-${scene.id}`)}
                        className="text-left text-[8.5px] text-[#4DA6FF] hover:underline cursor-pointer pt-2 font-black select-none uppercase tracking-wider"
                      >
                        {copiedTarget === `cam-${scene.id}` ? t('copiedText') : t('copyActuator')}
                      </button>
                    </div>

                    <div className="p-2.5 bg-[#050505] rounded-xl border border-white/5 flex flex-col justify-between">
                      <div>
                        <span className="text-gray-500 uppercase block mb-0.5 font-bold flex items-center gap-1 text-[8.5px]">
                          <Sliders className="w-3 h-3 text-[#66FF99]" /> Physics Presets
                        </span>
                        <span className="text-gray-300 line-clamp-2 leading-normal">{scene.motionPrompt || 'Liquid water dynamic flow vectors'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(scene.motionPrompt || 'Liquid water dynamic flow vectors', `mot-${scene.id}`)}
                        className="text-left text-[8.5px] text-[#66FF99] hover:underline cursor-pointer pt-2 font-black select-none uppercase tracking-wider"
                      >
                        {copiedTarget === `mot-${scene.id}` ? t('copiedText') : t('copyPhysics')}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Sub-card actions */}
                <div className="border-t border-white/5 pt-3.5 flex justify-between items-center text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Gauge className="w-3.5 h-3.5 text-[#D9FF1F]" />
                    <span className="text-gray-400">ENGINE ASPECT:</span>
                    <span className="text-white">16:9 CINEMATIC</span>
                  </div>
                  
                  {isReady && (
                    <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-0.5 px-2 rounded-full font-bold flex items-center gap-1 uppercase select-none">
                      <Check className="w-3 h-3" /> Ready
                    </span>
                  )}
                  {isRendering && (
                    <span className="text-amber-400 font-black animate-pulse uppercase">
                      Baking...
                    </span>
                  )}
                  {!isReady && !isRendering && (
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentRenderingId(scene.id);
                        setRenderProgress(prev => ({ ...prev, [scene.id]: 5 }));
                        setTickerText(getRenderTicker(5));
                        executeSequentialCompile([scene], 0);
                      }}
                      className="px-2.5 py-1 rounded bg-[#D9FF1F]/10 border border-[#D9FF1F]/20 text-[#D9FF1F] hover:bg-[#D9FF1F]/20 text-[9px] transition-colors cursor-pointer"
                    >
                      SOLVE RIG
                    </button>
                  )}
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
