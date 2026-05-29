import React, { useState } from 'react';
import { Project } from '../types';
import { Sparkles, Info, Compass, Sliders, Check, Copy, ChevronRight } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

interface VideoModuleProps {
  project: Project;
  onAdvanceStep: () => void;
  onMotionCompleted: () => void;
}

type MotionEngine = 'Kling' | 'Veo' | 'Runway' | 'Hailuo' | 'Seedance';

export default function VideoModule({ project, onAdvanceStep, onMotionCompleted }: VideoModuleProps) {
  const { t } = useLanguage();
  const [engine, setEngine] = useState<MotionEngine>('Kling');
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);

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

  const enginesList: { name: MotionEngine; desc: string; resolution: string }[] = [
    { name: 'Kling', desc: 'Superior multi-axial camera-rig physics simulation.', resolution: '1080p high' },
    { name: 'Veo', desc: 'Google DeepMind spatial cinematic fluid model.', resolution: '4K hyper-clarity' },
    { name: 'Runway', desc: 'High motion fidelity with custom depth-graded vectors.', resolution: '1080p 60fps' },
    { name: 'Hailuo', desc: 'Dynamic physics engine & fast fluid transformations.', resolution: '720p velocity' },
    { name: 'Seedance', desc: 'Slick stylized micro-focus transitions.', resolution: '1080p artistic' },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-[#e5e5e5]" id="video_module_panel">
      {/* Header and Engine Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-display font-bold text-white tracking-tight">
              {t('motionTitle')}
            </h2>
            <span className="bg-[#4DA6FF]/10 text-[#4DA6FF] border border-[#4DA6FF]/30 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full select-none">
              {t('motionBetaBadge')}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {t('motionSubtitle')}
          </p>
        </div>

        <button
          onClick={handleFinishMotion}
          className="px-6 py-3 rounded-full bg-[#66FF99] text-black font-semibold text-xs tracking-widest uppercase transition-all flex items-center gap-2 hover:scale-[1.02] shadow-[0_0_20px_rgba(102,255,153,0.25)] cursor-pointer self-start sm:self-auto"
          id="btn_motion_advance"
        >
          {t('continueToMasteringBtn')} <ChevronRight className="w-4 h-4 text-black" />
        </button>
      </div>

      {/* Engine selection cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        {enginesList.map((eng) => {
          const isSel = engine === eng.name;
          return (
            <button
              key={eng.name}
              onClick={() => setEngine(eng.name)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isSel
                  ? 'bg-[#4DA6FF]/10 border-[#4DA6FF] text-[#4DA6FF] shadow-[0_0_15px_rgba(77,166,255,0.1)]'
                  : 'bg-[#0D0D0D] border-white/5 text-gray-400 hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-mono font-bold tracking-wider uppercase">{eng.name}</span>
                <span className="text-[8px] font-mono text-gray-500">{eng.resolution}</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal line-clamp-2">
                {eng.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Warning Box */}
      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3.5">
        <Info className="w-5 h-5 text-[#4DA6FF] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-mono text-white font-bold mb-0.5">{t('directorAdvisory')}</h4>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            {t('motionSimulatedBetaDesc', { engine })}
          </p>
        </div>
      </div>

      {/* List of active script scene motion cards */}
      <div className="space-y-4">
        {project.scenes?.map((scene) => (
          <div key={scene.id} className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-[#4DA6FF]">{t('sceneMotionDirectives', { number: scene.sceneNumber })}</span>
              <span className="text-[10px] font-mono text-gray-500">{t('mappedOnEngine')}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prompts column */}
              <div className="space-y-3">
                <div className="p-4 bg-[#050505] rounded-xl border border-white/5 relative group">
                  <span className="text-[9px] font-mono text-gray-500 block mb-1">{t('stableVideoPrompt')}</span>
                  <p className="text-xs text-white leading-relaxed font-mono">
                    {scene.videoPrompt}
                  </p>
                  <button
                    onClick={() => handleCopy(scene.videoPrompt, `vp-${scene.id}`)}
                    className="absolute top-4 right-4 p-1 rounded bg-[#0D0D0D] opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white cursor-pointer"
                  >
                    {copiedTarget === `vp-${scene.id}` ? (
                      <Check className="w-3.5 h-3.5 text-[#66FF99]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Rig configurations column */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Camera Rig Prompt */}
                <div className="p-4 bg-[#050505] rounded-xl border border-white/5 relative group flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 flex items-center gap-1 mb-1">
                      <Compass className="w-3 h-3 text-[#4DA6FF]" /> {t('cameraActuator')}
                    </span>
                    <p className="text-xs text-gray-300 font-sans leading-relaxed">
                      {scene.cameraPrompt || 'Zoom-in, 35mm lens, shallow focal grading.'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(scene.cameraPrompt || 'Zoom-in, 35mm lens', `cam-${scene.id}`)}
                    className="self-end text-[9px] font-mono text-[#4DA6FF] hover:underline cursor-pointer pt-2 font-bold"
                  >
                    {copiedTarget === `cam-${scene.id}` ? t('copiedText') : t('copyActuator')}
                  </button>
                </div>

                {/* Physics Motion scale */}
                <div className="p-4 bg-[#050505] rounded-xl border border-white/5 relative group flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 flex items-center gap-1 mb-1">
                      <Sliders className="w-3 h-3 text-[#66FF99]" /> {t('physicsStrength')}
                    </span>
                    <p className="text-xs text-gray-300 font-sans leading-relaxed">
                      {scene.motionPrompt || 'Ripple multipliers, custom gravity scale.'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(scene.motionPrompt || 'Ripple multiplier', `mot-${scene.id}`)}
                    className="self-end text-[9px] font-mono text-[#66FF99] hover:underline cursor-pointer pt-2 font-bold"
                  >
                    {copiedTarget === `mot-${scene.id}` ? t('copiedText') : t('copyPhysics')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
