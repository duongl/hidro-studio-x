import React, { useState, useEffect } from 'react';
import { Project, DNALock, AIDirectorInsight } from '../types';
import { Lock, Cpu, Sparkles, TrendingUp, Compass } from 'lucide-react';
import { useLanguage } from '../utils/i18n';
import { useBackgroundQueue } from '../context/BackgroundQueueContext';

interface AIDirectorProps {
  project: Project;
  onUpdateDirectorData: (dna: DNALock, insight: AIDirectorInsight) => void;
  onAdvanceStep: () => void;
  onDirectorCompleted: () => void;
}

export default function AIDirector({ project, onUpdateDirectorData, onAdvanceStep, onDirectorCompleted }: AIDirectorProps) {
  const { t } = useLanguage();
  const { jobs, triggerDirectorAnalysis } = useBackgroundQueue();
  const [analyzedThisSession, setAnalyzedThisSession] = useState(false);

  const activeJob = jobs.find(j => j.type === 'director_analysis' && (j.status === 'running' || j.status === 'pending'));
  const loading = !!activeJob;

  const getStatusText = () => {
    if (!activeJob) return '';
    const progress = activeJob.progress;
    if (progress < 20) return t('contactingDirector') || 'Contacting director...';
    if (progress < 40) return t('statesScanningVb') || 'Scanning assets...';
    if (progress < 60) return t('statesLockChar') || 'Extracting Character DNA...';
    if (progress < 80) return t('statesLockProd') || 'Extracting Product DNA...';
    return t('statesFormIntent') || 'Formulating Intent...';
  };
  const statusText = getStatusText();

  const runDirectorAnalysis = () => {
    setAnalyzedThisSession(true);
    triggerDirectorAnalysis();
  };

  const isLocked = !!project.dnaLock;

  useEffect(() => {
    if (project.aiDirectorCompleted && !isLocked && analyzedThisSession) {
      onDirectorCompleted();
      setAnalyzedThisSession(false);
    }
  }, [project.aiDirectorCompleted, analyzedThisSession]);

  return (
    <div className="space-y-8 animate-fade-in" id="ai_director_panel">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            {t('directorTitle')}
          </h2>
          <p className="text-xs text-gray-400">
            {t('directorSubtitle')}
          </p>
        </div>

        {isLocked && (
          <button
            onClick={onAdvanceStep}
            className="px-6 py-3 rounded-full bg-[#4DA6FF] hover:bg-[#4DA6FF]/90 text-black font-semibold text-xs tracking-widest uppercase transition-all flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
            id="btn_director_advance"
          >
            {t('generateScriptBtn')} <Cpu className="w-3.5 h-3.5 text-black" />
          </button>
        )}
      </div>

      {/* Lock simulation require module */}
      {!isLocked && !loading && (
        <div className="p-8 text-center space-y-6 max-w-xl mx-auto my-6 border border-dashed border-white/5 rounded-3xl" id="director_unlocked_pitch">
          <div className="w-12 h-12 rounded-full bg-[#66FF99]/5 flex items-center justify-center mx-auto border border-[#66FF99]/20 animate-pulse">
            <Cpu className="text-[#66FF99] w-6 h-6" />
          </div>
          <h3 className="text-base text-white font-mono uppercase tracking-wider">{t('dnaLockSequenceRequired')}</h3>
          <p className="text-xs text-gray-400">
            {t('directorDeepScanDesc')}
          </p>
          <button
            onClick={runDirectorAnalysis}
            className="px-6 py-3.5 rounded-full bg-[#66FF99] text-black font-extrabold text-xs uppercase tracking-widest hover:scale-102 transition-transform shadow-[0_0_25px_rgba(102,255,153,0.2)] cursor-pointer"
            id="btn_execute_scan"
          >
            {t('extractDnaAndAnalyze')}
          </button>
        </div>
      )}

      {/* Loading state rendering */}
      {loading && (
        <div className="p-12 text-center max-w-md mx-auto space-y-6 rounded-3xl bg-[#0D0D0D]/60 border border-white/5 shadow-md">
          <div className="inline-block relative">
            <div className="w-16 h-16 rounded-full border-t-2 border-[#66FF99] animate-spin" />
            <Lock className="w-5 h-5 absolute inset-0 m-auto text-[#66FF99] animate-pulse" />
          </div>
          <p className="text-xs font-mono tracking-widest text-[#66FF99] uppercase">{statusText}</p>
          <div className="w-full bg-[#050505] p-4 rounded-xl border border-white/5">
            <div className="text-[10px] text-gray-500 font-mono text-left space-y-1">
              <div>&gt; {t('safeseedSec')}</div>
              <div className="text-[#66FF99]">&gt; {t('safeInjectedChrome')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Finished Analysis Details Renders */}
      {isLocked && project.dnaLock && project.directorInsight && (
        <div className="space-y-8" id="director_insights_block">
          {/* DNA Lock Grid */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-[#66FF99]" />
              <h3 className="text-xs font-mono tracking-widest text-[#66FF99] uppercase">{t('lockedDnaChains')}</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'CHARACTER_DNA', val: project.dnaLock.CHARACTER_DNA, color: 'text-emerald-400' },
                { label: 'PRODUCT_DNA', val: project.dnaLock.PRODUCT_DNA, color: 'text-blue-400' },
                { label: 'BACKGROUND_DNA', val: project.dnaLock.BACKGROUND_DNA, color: 'text-violet-400' },
                { label: 'STYLE_DNA', val: project.dnaLock.STYLE_DNA, color: 'text-amber-400' },
              ].map((chain) => (
                <div key={chain.label} className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 relative group shadow-sm hover:border-white/10 transition-colors">
                  <div className="absolute top-4 right-4 text-[9px] font-mono select-none px-1.5 py-0.5 rounded bg-[#66FF99]/15 text-[#66FF99] flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-[#66FF99]" /> LOCK
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 block mb-2">{chain.label}</span>
                  <p className="text-xs text-white leading-relaxed font-mono font-medium">
                    {chain.val}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Marketing & Content Intelligence Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target & Strategy Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-gray-500 uppercase">
                <TrendingUp className="w-3.5 h-3.5" /> {t('audPlatformRes')}
              </div>

              <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/5 space-y-5">
                <div>
                  <h4 className="text-[10px] font-mono text-gray-500 uppercase mb-1">{t('audienceInsight')}</h4>
                  <p className="text-sm text-gray-300 leading-relaxed font-sans font-medium">{project.directorInsight.audience}</p>
                </div>
                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-[10px] font-mono text-gray-500 uppercase mb-1">{t('platformComp')}</h4>
                  <p className="text-sm text-gray-300 leading-relaxed font-sans font-medium">{project.directorInsight.competitorAngle}</p>
                </div>
                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-[10px] font-mono text-[#66FF99] uppercase mb-1 font-bold">{t('affiliateMarketingPriority')}</h4>
                  <p className="text-sm text-[#66FF99]/90 bg-[#66FF99]/5 p-3.5 rounded-xl border border-[#66FF99]/10 font-sans leading-relaxed">
                    {project.directorInsight.affiliateAngle}
                  </p>
                </div>
              </div>
            </div>

            {/* Cinematic & Structural Guidelines Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-gray-500 uppercase">
                <Compass className="w-3.5 h-3.5" /> {t('cinematicDnaRules')}
              </div>

              <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/5 space-y-5">
                <div>
                  <h4 className="text-[10px] font-mono text-gray-500 uppercase mb-1">{t('microHook')}</h4>
                  <p className="text-sm text-gray-300 leading-relaxed font-sans font-medium">{project.directorInsight.hookStrategy}</p>
                </div>
                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-[10px] font-mono text-gray-500 uppercase mb-1">{t('visualSpectrum')}</h4>
                  <p className="text-xs text-gray-300 leading-relaxed font-mono">{project.directorInsight.visualDNA}</p>
                </div>
                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-[10px] font-mono text-gray-500 uppercase mb-1">{t('soundVoiceNarrative')}</h4>
                  <p className="text-sm text-gray-300 leading-relaxed font-sans font-medium">{project.directorInsight.voiceDNA}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alignment Alert Banner */}
          <div className="p-5 rounded-2xl bg-[#66FF99]/5 border border-[#66FF99]/10 flex items-start gap-4">
            <Sparkles className="w-5 h-5 text-[#66FF99] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-mono text-white font-bold mb-1">{t('promptInjEngineArmed')}</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                {t('promptInjDesc')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
