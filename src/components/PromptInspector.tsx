import React, { useState } from 'react';
import { Project, SceneCard } from '../types';
import { Cpu, Lock, Link, Eye, Copy, Check, Terminal, ShieldAlert, Sparkles, FileText, Download, Layers } from 'lucide-react';

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

  const handleCopyAllBlocks = () => {
    if (!currentScene) return;
    const blockText = `
========================================
SCENE ${currentScene.sceneNumber} CINEMATIC BREAKDOWN BLOCK
========================================
BLOCK 1: SCENE INFO METADATA
- Scene Number: ${currentScene.sceneNumber}
- Estimated Duration: ${project.targetDuration ? Math.round(project.targetDuration / scenes.length) : 8} seconds
- Distribution Platform: ${project.platform}
- Workflow Type: ${project.type}
- Rendering Video Model: ${project.videoModel}

BLOCK 2: IMAGE PROMPT (KEYFRAME)
${currentScene.imagePrompt}

BLOCK 3: VIDEO PROMPT (MOTION DYNAMICS)
${currentScene.videoPrompt}

BLOCK 4: CAMERA BLOCK
${currentScene.cameraPrompt || 'Close-up focal scale tracking, macro 35mm lens angle, cinematic high contrast lighting depth.'}

BLOCK 5: AUDIO BLOCK
- Voice Profiles: Warm, High-Conversion Dialogue pacing
- Sample Resolution: 48kHz Dolby Master broadcast alignment

BLOCK 6: DIALOGUE BLOCK
"${currentScene.narration}"

BLOCK 7: AMBIENT SOUND DESIGNS
- Sweep acoustics / Premium commercial ASMR cues

BLOCK 8: DNA LOCKED CHROMOSOMES
- Character DNA: ${project.dnaLock?.CHARACTER_DNA || 'Consistent brand subject'}
- Product DNA: ${project.dnaLock?.PRODUCT_DNA || 'Prismatic product wrap'}
- Background Staging: ${project.dnaLock?.BACKGROUND_DNA || 'Cinematic glass reflections'}
- Style Curve: ${project.dnaLock?.STYLE_DNA || 'Liquid Glass reflections'}

BLOCK 9: SUFFIX INJECTION DIRECTIVES
- Preserve character dimensions, product structure, environment layouts, and brand aesthetics.
========================================
`;
    handleCopy(blockText, 'copy-all-blocks');
  };

  const exportPromptPackTxt = () => {
    const content = scenes
      .map((s) => `
========================================
SCENE ${s.sceneNumber} CINEMATIC BREAKDOWN BLOCK
========================================
BLOCK 1: SCENE INFO METADATA
- Scene Number: ${s.sceneNumber}
- Duration Estimate: ${project.targetDuration ? Math.round(project.targetDuration / scenes.length) : 8}s
- Platform: ${project.platform}
- Workflow: ${project.type}
- Model: ${project.videoModel}

BLOCK 2: IMAGE PROMPT (KEYFRAME)
${s.imagePrompt}

BLOCK 3: VIDEO PROMPT (MOTION DYNAMICS)
${s.videoPrompt}

BLOCK 4: CAMERA BLOCK
${s.cameraPrompt || 'Close-up focal scale tracking, macro 35mm lens angle, cinematic depth.'}

BLOCK 5: AUDIO BLOCK
Warm, High-Conversion Dialogue pacing alignment.

BLOCK 6: DIALOGUE BLOCK
"${s.narration}"

BLOCK 7: AMBIENT ENVIRONMENT
Studio ASMR textures.

BLOCK 8: DNA LOCKED CHROMOSOMES
- Character DNA: ${project.dnaLock?.CHARACTER_DNA || 'N/A'}
- Product DNA: ${project.dnaLock?.PRODUCT_DNA || 'N/A'}
- Background Staging: ${project.dnaLock?.BACKGROUND_DNA || 'N/A'}
- Style Curve: ${project.dnaLock?.STYLE_DNA || 'N/A'}

BLOCK 9: SUFFIX INJECTION DIRECTIVES
- Strict alignment to locked stable presets. Prevents drift.
`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${project.name.replace(/\s+/g, '_')}_cinematics_playbook.txt`;
    link.click();
  };

  const exportPromptPackJson = () => {
    const formatted = scenes.map((s) => ({
      sceneNumber: s.sceneNumber,
      info: {
        platform: project.platform,
        workflow: project.type,
        model: project.videoModel,
        duration: project.targetDuration ? Math.round(project.targetDuration / scenes.length) : 8
      },
      imagePrompt: s.imagePrompt,
      videoPrompt: s.videoPrompt,
      cameraBlock: s.cameraPrompt || 'Close-up zoom, 35mm lens depth',
      audioBlock: 'Warm, Conversational tone, High conversion energy',
      dialogueBlock: s.narration,
      ambientSound: 'Soft ASMR sweep acoustics',
      dnaLocks: project.dnaLock || {},
      suffixInjections: 'Preserve identity, product shape, environment context'
    }));

    const blob = new Blob([JSON.stringify(formatted, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${project.name.replace(/\s+/g, '_')}_production_matrix.json`;
    link.click();
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
      <div className="pb-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-medium text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" /> Consistent Prompt Chain Inspector
          </h2>
          <p className="text-xs text-gray-400">
            Trace how the DNA Lock System overlays visual descriptors to prevent character drift and product hallucinations across your production.
          </p>
        </div>

        {scenes.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={exportPromptPackTxt}
              className="px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-[#66FF99]/30 hover:bg-white/[0.06] text-xs font-mono text-gray-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
              title="Export complete script breakdown as TXT"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" /> Export TXT Playbook
            </button>
            <button
              onClick={exportPromptPackJson}
              className="px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-[#4DA6FF]/30 hover:bg-white/[0.06] text-xs font-mono text-gray-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
              title="Export formatted scene matrix as JSON"
            >
              <Layers className="w-3.5 h-3.5 text-[#4DA6FF]" /> Export JSON Matrix
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Selector list */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex bg-[#0D0D0D] p-3 rounded-xl border border-white/5 justify-between items-center select-none">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Active Scene List</span>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 uppercase font-bold">
              {scenes.length} Scenes Loaded
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 main-scrollbar">
            {scenes.map((s, idx) => {
              const isSel = selectedSceneIndex === idx;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSceneIndex(idx)}
                  className={`w-full p-3.5 rounded-xl text-left border transition-all flex justify-between items-center ${
                    isSel
                      ? 'bg-gradient-to-r from-emerald-500/[0.04] to-none border-emerald-400 text-white'
                      : 'bg-[#50505] border-white/5 text-gray-400 hover:bg-white/[0.01]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                      isSel ? 'bg-emerald-400 text-black font-extrabold' : 'bg-white/5 text-gray-300'
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
                No active scenes found. Compile script blocks first.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Immersive 9-Block DNA Screenplay Tracer */}
        <div className="lg:col-span-8 space-y-6">
          {currentScene ? (
            <div className="space-y-6">
              
              {/* Copy all helper row */}
              <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                <span className="text-xs font-mono text-gray-400">
                  ⚡ Trace Complete Script Breakdown for <strong className="text-white">Scene {currentScene.sceneNumber}</strong>
                </span>
                <button
                  onClick={handleCopyAllBlocks}
                  className="px-3 py-1.5 rounded bg-emerald-400 hover:bg-emerald-500 text-black text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedTarget === 'copy-all-blocks' ? (
                    <>
                      <Check className="w-3 h-3 text-black stroke-[3]" /> COPIED!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-black stroke-[3]" /> Copy All Blocks
                    </>
                  )}
                </button>
              </div>

              {/* 9 conceptual blocks pipeline */}
              <div className="space-y-4">
                
                {/* Block 1: Scene Info Metadata */}
                <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/10">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-1">Block 1: Scene Info Metadata</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono text-gray-300">
                    <div><span className="text-gray-500 block">SCENE ID:</span> {currentScene.sceneNumber}</div>
                    <div><span className="text-gray-500 block">DURATION:</span> {project.targetDuration ? Math.round(project.targetDuration / scenes.length) : 8}s</div>
                    <div><span className="text-gray-500 block">PLATFORM:</span> {project.platform}</div>
                    <div><span className="text-gray-500 block">WORKFLOW:</span> {project.type}</div>
                    <div><span className="text-gray-500 block">VIDEO ENGINE:</span> {project.videoModel}</div>
                  </div>
                </div>

                {/* Block 2: Image Prompt */}
                <div className="p-4 bg-[#0A0A0A] rounded-xl border border-white/5 relative group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-black">Block 2: Image Prompt (Keyframe Visual)</span>
                    <button onClick={() => handleCopy(currentScene.imagePrompt, 'block2')} className="text-[10px] font-mono text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer">
                      {copiedTarget === 'block2' ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>} Copy Prompt
                    </button>
                  </div>
                  <p className="text-xs text-white font-mono leading-relaxed pt-1 select-all">{currentScene.imagePrompt}</p>
                </div>

                {/* Block 3: Video Prompt */}
                <div className="p-4 bg-[#0A0A0A] rounded-xl border border-[#4DA6FF]/10 relative group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-mono text-[#4DA6FF] uppercase tracking-widest font-black">Block 3: Video Prompt (Cinematic Motion Dynamics)</span>
                    <button onClick={() => handleCopy(currentScene.videoPrompt, 'block3')} className="text-[10px] font-mono text-[#4DA6FF] hover:underline flex items-center gap-1 cursor-pointer">
                      {copiedTarget === 'block3' ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>} Copy Prompt
                    </button>
                  </div>
                  <p className="text-xs text-white font-mono leading-relaxed pt-1 select-all">{currentScene.videoPrompt}</p>
                </div>

                {/* Block 4: Camera Block */}
                <div className="p-4 bg-[#0A0A0A] rounded-xl border border-white/5 relative group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest font-black">Block 4: Camera Block (Rig Actuators & Lens Layout)</span>
                    <button onClick={() => handleCopy(currentScene.cameraPrompt || 'Pan zoom focal movement, anamorphic depth.', 'block4')} className="text-[10px] font-mono text-amber-500 hover:underline flex items-center gap-1 cursor-pointer">
                      {copiedTarget === 'block4' ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>} Copy
                    </button>
                  </div>
                  <p className="text-xs text-white font-sans leading-relaxed pt-1">
                    {currentScene.cameraPrompt || 'Close-up focal scale tracking, macro 35mm lens angle, cinematic high contrast lighting depth.'}
                  </p>
                </div>

                {/* Block 5: Audio Block */}
                <div className="p-4 bg-[#0A0A0A] rounded-xl border border-white/5 relative group">
                  <span className="text-[9px] font-mono text-violet-400 uppercase tracking-widest font-black block mb-1">Block 5: Mastering Audio Profile (Ducking Dynamics)</span>
                  <div className="grid grid-cols-2 text-[10px] font-mono text-gray-300 gap-2">
                    <div><span className="text-gray-500">VOICE SPECS:</span> Warm, Premium Accent, High-Conversion Conversational energy</div>
                    <div><span className="text-gray-500">SAMPLE RESOLUTION:</span> 48kHz Dolby Master Broadcast audio alignment</div>
                  </div>
                </div>

                {/* Block 6: Dialogue Block */}
                <div className="p-4 bg-[#0A0A0A] rounded-xl border border-white/5 relative group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-mono text-pink-400 uppercase tracking-widest font-black">Block 6: Dialogue Script (Somatic Voiceover Copy)</span>
                    <button onClick={() => handleCopy(currentScene.narration, 'block6')} className="text-[10px] font-mono text-pink-400 hover:underline flex items-center gap-1 cursor-pointer">
                      {copiedTarget === 'block6' ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>} Copy Dialogue
                    </button>
                  </div>
                  <p className="text-xs text-[#66FF99] font-sans font-medium italic pt-1">&quot;{currentScene.narration}&quot;</p>
                </div>

                {/* Block 7: Ambient Sound */}
                <div className="p-4 bg-[#0A0A0A] rounded-xl border border-white/5 relative group">
                  <span className="text-[9px] font-mono text-yellow-500 uppercase tracking-widest font-black block mb-1">Block 7: Sound Design (Ambient Soundscape FX)</span>
                  <p className="text-xs text-gray-400 font-sans leading-relaxed">
                    {project.type === 'Affiliate Marketing' || project.type === 'TikTok Viral' ? 'Soft futuristic high-tech sweep, ambient liquid drops ASMR acoustics' : 'Clean corporate soundscapes, pristine echo studio reverberations.'}
                  </p>
                </div>

                {/* Block 8: DNA Lock Block */}
                <div className="p-4 bg-[#0A0A0A]/80 rounded-xl border border-emerald-500/20 relative group">
                  <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-black block mb-1">Block 8: DNA Locked Genomic Presets</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono text-gray-300">
                    <div className="p-2.5 bg-black/50 rounded-lg"><strong className="text-gray-500 text-[8px] block uppercase mb-0.5">Character Lock:</strong> {dna.CHARACTER_DNA}</div>
                    <div className="p-2.5 bg-black/50 rounded-lg"><strong className="text-gray-500 text-[8px] block uppercase mb-0.5">Product Lock:</strong> {dna.PRODUCT_DNA}</div>
                    <div className="p-2.5 bg-black/50 rounded-lg"><strong className="text-gray-500 text-[8px] block uppercase mb-0.5">Background Light Lock:</strong> {dna.BACKGROUND_DNA}</div>
                    <div className="p-2.5 bg-black/50 rounded-lg"><strong className="text-gray-500 text-[8px] block uppercase mb-0.5">Style Lock Curve:</strong> {dna.STYLE_DNA}</div>
                  </div>
                </div>

                {/* Block 9: Prompt Injection Layer */}
                <div className="p-4 bg-gradient-to-r from-amber-500/[0.03] to-indigo-500/[0.03] rounded-xl border border-amber-500/15 text-[10px] font-mono text-gray-350">
                  <span className="text-[#66FF99] text-[9px] font-bold uppercase block tracking-wider mb-1">Block 9: Consistent Suffix Injection Directives (Armed)</span>
                  <ul className="list-disc pl-4 space-y-1 text-gray-450 text-[9px] leading-relaxed">
                    <li><strong>PRESERVE CHARACTER DETAILS:</strong> Ensure character genomic locks override speculative render structures.</li>
                    <li><strong>PRESERVE BRAND VALUE:</strong> Lock high-contrast shadows to avoid product drift/geometric shift.</li>
                    <li><strong>PRESERVE ENVIRONMENT STABILITY:</strong> Tie viewport anchors to the background staging preset.</li>
                    <li><strong>PRESERVE BRAND AESTHETICS:</strong> Inject premium Liquid Glass reflection curves.</li>
                  </ul>
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
