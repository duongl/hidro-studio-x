import React, { useState } from 'react';
import { Project } from '../types';
import { useLanguage } from '../utils/i18n';

interface MasteringModuleProps {
  project: Project;
  onCloseProject: () => void;
}

export default function MasteringModule({ project, onCloseProject }: MasteringModuleProps) {
  const { t } = useLanguage();
  const [voiceModel, setVoiceModel] = useState('Adam (Deep Velvet Male)');
  const [ambientAudio, setAmbientAudio] = useState('Corporate Minimal Clean');

  return (
    <div className="space-y-6 animate-fade-in text-[#e5e5e5]" id="mastering_module_panel">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-display font-bold text-white tracking-tight">
              {t('masteringTitle')}
            </h2>
            <span className="bg-[#4DA6FF]/10 text-[#4DA6FF] border border-[#4DA6FF]/30 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full select-none">
              FUTURE EXPANSION (BETA)
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {t('masteringSubtitle')}
          </p>
        </div>

        <button
          onClick={onCloseProject}
          className="px-6 py-3 rounded-full bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-400 font-mono text-xs uppercase tracking-wider transition-all hover:scale-102 cursor-pointer self-start sm:self-auto"
        >
          {t('closeProject')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline Waveform Mockup */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#0D0D0D] border border-white/5 space-y-6">
          <div className="flex justify-between items-center text-xs font-mono text-gray-500 uppercase">
            <span>{t('timelineWaveformTitle')}</span>
            <span className="text-[#66FF99] font-bold">{t('previewAudioSynced')}</span>
          </div>

          {/* Graphical timeline panel */}
          <div className="bg-[#050505] p-5 rounded-xl border border-white/5 space-y-4">
            {/* Master Track */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-gray-400">
                <span>{t('masterNarratorTrack')}</span>
                <span>VOL: 0dB // COMPRESSED</span>
              </div>
              <div className="h-10 bg-white/[0.02] border border-white/5 rounded-lg relative overflow-hidden flex items-center justify-around px-4">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[2px] bg-[#66FF99] rounded-full transition-all"
                    style={{
                      height: `${Math.max(10, Math.sin(i * 0.4) * 35 + 10)}%`,
                      opacity: i % 4 === 0 ? 0.3 : 0.8,
                    }}
                  />
                ))}
                <span className="absolute left-4 top-1 text-[8px] font-mono text-gray-400">{t('voiceoverLabel')}</span>
              </div>
            </div>

            {/* Ambient track */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-gray-400">
                <span>{t('ambientMusicTrack')}</span>
                <span>VOL: -18dB // DUCKED ON SPOKEN VOICE</span>
              </div>
              <div className="h-10 bg-white/[0.02] border border-white/5 rounded-lg relative overflow-hidden flex items-center justify-around px-4">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[2px] bg-[#4DA6FF] rounded-full"
                    style={{
                      height: `${Math.max(5, Math.cos(i * 0.2) * 20 + 5)}%`,
                      opacity: 0.6,
                    }}
                  />
                ))}
                <span className="absolute left-4 top-1 text-[8px] font-mono text-gray-400">{t('ambientWaveBed')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 border border-dashed border-white/5 rounded-xl text-center text-xs text-gray-500 leading-normal">
            {t('audioAlignmentLocked')}
          </div>
        </div>

        {/* Configurations parameters side panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/5 space-y-5">
            <h3 className="text-xs font-mono font-bold tracking-widest text-[#66FF99] uppercase">{t('atmosTuning')}</h3>

            {/* Select voice models */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-gray-400 uppercase">{t('voiceProfilePresets')}</label>
              <select
                value={voiceModel}
                onChange={(e) => setVoiceModel(e.target.value)}
                className="w-full text-xs p-3 bg-black/40 border border-white/5 rounded-xl text-white outline-none cursor-pointer focus:border-neon-secondary"
              >
                <option value="Adam (Deep Velvet Male)">Adam (Deep Velvet Male)</option>
                <option value="Serena (Slick Corporate Female)">Serena (Slick Corporate Female)</option>
                <option value="Marcus (Dynamic Tech Male)">Marcus (Dynamic Tech Male)</option>
                <option value="Ella (Vivid Storyteller Female)">Ella (Vivid Storyteller Female)</option>
              </select>
            </div>

            {/* Select Ambient Audio */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-gray-400 uppercase">{t('backgroundAcoustics')}</label>
              <select
                value={ambientAudio}
                onChange={(e) => setAmbientAudio(e.target.value)}
                className="w-full text-xs p-3 bg-black/40 border border-white/5 rounded-xl text-white outline-none cursor-pointer focus:border-neon-secondary"
              >
                <option value="Corporate Minimal Clean">Corporate Minimal Clean</option>
                <option value="Lo-Fi Moody Chill">Lo-Fi Moody Chill</option>
                <option value="Synth Wave Midnight Ride">Synth Wave Midnight Ride</option>
                <option value="Cinematic Orchestral Rise">Cinematic Orchestral Rise</option>
              </select>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/5 text-[11px] text-gray-400 leading-normal font-mono">
              <div className="flex justify-between">
                <span>{t('stereoDepth')}:</span>
                <span className="font-mono text-white">94%</span>
              </div>
              <div className="flex justify-between">
                <span>{t('purityThreshold')}:</span>
                <span className="font-mono text-white">0.92</span>
              </div>
              <div className="flex justify-between">
                <span>{t('dynamicRangeLimit')}:</span>
                <span className="text-[#66FF99] font-mono font-bold">Dolby Mastering A1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
