import React, { useState } from 'react';
import { Project, SceneCard } from '../types';
import { Cpu, Lock, Link, Eye, Copy, Check, Terminal, ShieldAlert, Sparkles } from 'lucide-react';

interface PromptInspectorProps {
  project: Project;
}

export default function PromptInspector({ project }: PromptInspectorProps) {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);

  const scenes = project.scenes || [];
  const currentScene: SceneCard | undefined = scenes[selectedSceneIndex];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTarget(id);
    setTimeout(() => {
      setCopiedTarget(null);
    }, 1500);
  };

  const dna = project.dnaLock || {
    CHARACTER_DNA: '[UNRESOLVED] Initiate AI Director Analysis first.',
    PRODUCT_DNA: '[UNRESOLVED] Initiate AI Director Analysis first.',
    BACKGROUND_DNA: '[UNRESOLVED] Initiate AI Director Analysis first.',
    STYLE_DNA: '[UNRESOLVED] Initiate AI Director Analysis first.',
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#e5e5e5]" id="prompt_inspector_panel">
      {/* Header */}
      <div className="pb-4 border-b border-white/5">
        <h2 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
          <Terminal className="w-5 h-5 text-neon-accent" /> Consistent Prompt Chain Inspector
        </h2>
        <p className="text-xs text-gray-400">
          Trace how the DNA Lock System overlays visual descriptors to prevent character drift and product hallucinations across your production.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Selector list */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex bg-[#0D0D0D] p-3 rounded-xl border border-white/5 justify-between items-center select-none">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Active Scene List</span>
            <span className="text-[9px] font-mono text-neon-accent bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 uppercase">
              {scenes.length} Scenes Loaded
            </span>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-2 main-scrollbar">
            {scenes.map((s, idx) => {
              const isSel = selectedSceneIndex === idx;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSceneIndex(idx)}
                  className={`w-full p-3.5 rounded-xl text-left border transition-all flex justify-between items-center ${
                    isSel
                      ? 'bg-gradient-to-r from-neon-accent/[0.04] to-none border-[#66FF99] text-white'
                      : 'bg-[#0D0D0D] border-white/5 text-gray-400 hover:bg-white/[0.01]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                      isSel ? 'bg-[#66FF99] text-black' : 'bg-white/5 text-gray-300'
                    }`}>
                      {s.sceneNumber}
                    </span>
                    <span className="text-xs font-sans font-semibold truncate max-w-[150px]">{s.action}</span>
                  </div>
                  <span className="text-[9px] font-mono text-gray-500">MAPPED</span>
                </button>
              );
            })}

            {scenes.length === 0 && (
              <div className="p-8 text-center text-xs text-gray-500 font-mono bg-white/[0.01] border border-dashed border-white/5 rounded-xl select-none">
                No active scenes found. Dispatch script blocks first.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: DNA Prompt Tracer */}
        <div className="lg:col-span-8 space-y-6">
          {currentScene ? (
            <div className="space-y-6">
              {/* Locked Core Chain Indicators */}
              <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#66FF99] uppercase select-none">
                  <Lock className="w-3.5 h-3.5" /> SECURE CHROMOSOME FEED
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'CHARACTER GENOMIC BLOCK', val: dna.CHARACTER_DNA, color: 'text-emerald-400 border-emerald-500/10' },
                    { label: 'PRODUCT POLYGON LOCK', val: dna.PRODUCT_DNA, color: 'text-blue-400 border-blue-500/10' },
                    { label: 'BACKGROUND LIGHTING BLOCK', val: dna.BACKGROUND_DNA, color: 'text-violet-400 border-violet-500/10' },
                    { label: 'AESTHETIC STYLE CURVE', val: dna.STYLE_DNA, color: 'text-amber-400 border-amber-500/10' },
                  ].map((block) => (
                    <div key={block.label} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">{block.label}</span>
                      <p className="text-xs text-white font-mono leading-relaxed line-clamp-3">
                        {block.val}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Concat logic visual representation */}
              <div className="relative flex justify-center py-2 select-none">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-[1px] bg-white/[0.04]" />
                </div>
                <span className="relative z-10 px-4 py-1.5 rounded-full bg-[#0D0D0D] border border-white/5 text-[9px] font-mono text-[#66FF99] flex items-center gap-1.5 font-bold uppercase tracking-widest shadow-sm">
                  <Cpu className="w-3 h-3 text-neon-accent animate-pulse" /> Suffix Prompt Injection Layer (Armed)
                </span>
              </div>

              {/* Outbound compiled prompts results */}
              <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Outbound Structured Compiles</span>
                  <span className="text-[10px] font-mono text-gray-500">[ TRACED ON CURRENT SCENE ]</span>
                </div>

                <div className="space-y-4">
                  {/* Final Image Prompt */}
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5 relative group">
                    <div className="flex justify-between items-center mb-1 bg-[#151515] p-1 rounded px-2">
                      <span className="text-[9px] font-mono text-[#66FF99] uppercase tracking-widest font-black">Final Image Generator Prompt</span>
                      <span className="text-[8px] font-mono text-gray-500">READY FOR RENDER MATRIX</span>
                    </div>
                    <p className="text-xs text-white font-mono leading-relaxed pr-8 pt-2">
                      {currentScene.imagePrompt}
                    </p>
                    <button
                      onClick={() => handleCopy(currentScene.imagePrompt, 'exp-img')}
                      className="absolute top-12 right-4 p-1 rounded bg-[#050505] opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                    >
                      {copiedTarget === 'exp-img' ? (
                        <Check className="w-3.5 h-3.5 text-neon-accent" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Final Video Prompt */}
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5 relative group">
                    <div className="flex justify-between items-center mb-1 bg-[#151515] p-1 rounded px-2">
                      <span className="text-[9px] font-mono text-[#4DA6FF] uppercase tracking-widest font-black">Final Video Prompt</span>
                      <span className="text-[8px] font-mono text-gray-500">READY FOR MOTION ENGINES</span>
                    </div>
                    <p className="text-xs text-white font-mono leading-relaxed pr-8 pt-2">
                      {currentScene.videoPrompt}
                    </p>
                    <button
                      onClick={() => handleCopy(currentScene.videoPrompt, 'exp-vid')}
                      className="absolute top-12 right-4 p-1 rounded bg-[#050505] opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                    >
                      {copiedTarget === 'exp-vid' ? (
                        <Check className="w-3.5 h-3.5 text-neon-accent" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Negative prompt */}
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5 relative group">
                    <div className="flex justify-between items-center mb-1 bg-[#151515] p-1 rounded px-2">
                      <span className="text-[9px] font-mono text-red-400 uppercase tracking-widest font-bold">Injected Negative Prompt</span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono leading-relaxed pt-2">
                      {currentScene.negativePrompt}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-gray-500 font-mono bg-[#0D0D0D] border border-white/5 rounded-2xl select-none">
              No scene selected to trace. Compile your script screenplay copy first.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
