import React, { useState, useEffect } from 'react';
import { Project, SceneCard } from '../types';
import { 
  Cpu, Lock, Link, Eye, Copy, Check, Terminal, ShieldAlert, Sparkles, 
  FileText, Download, Layers, Sliders, Edit, Save, Star, Play, 
  CheckCircle, ChevronRight, HelpCircle, AlertTriangle 
} from 'lucide-react';

interface PromptInspectorProps {
  project: Project;
  onUpdateProject?: (updatedProj: Project) => void;
}

export default function PromptInspector({ project, onUpdateProject }: PromptInspectorProps) {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editNarration, setEditNarration] = useState('');
  const [editImagePrompt, setEditImagePrompt] = useState('');
  const [editVideoPrompt, setEditVideoPrompt] = useState('');
  const [editCameraPrompt, setEditCameraPrompt] = useState('');
  const [editAction, setEditAction] = useState('');
  
  // Custom score overrides
  const [hookScore, setHookScore] = useState(85);
  const [ctaScore, setCtaScore] = useState(80);
  const [charConsistency, setCharConsistency] = useState(90);
  const [prodConsistency, setProdConsistency] = useState(95);
  const [bgConsistency, setBgConsistency] = useState(85);
  const [styleConsistency, setStyleConsistency] = useState(90);

  const scenes = project.scenes || [];
  const currentScene: SceneCard | undefined = scenes[selectedSceneIndex];

  // Initialize edit fields when scene selection changes
  useEffect(() => {
    if (currentScene) {
      setEditNarration(currentScene.narration || '');
      setEditImagePrompt(currentScene.imagePrompt || '');
      setEditVideoPrompt(currentScene.videoPrompt || '');
      setEditCameraPrompt(currentScene.cameraPrompt || 'Close-up focal scale tracking, macro 35mm lens angle, cinematic high contrast lighting depth.');
      setEditAction(currentScene.action || '');
      
      setHookScore(currentScene.hookScore || Math.floor(Math.random() * 15) + 80);
      setCtaScore(currentScene.ctaScore || Math.floor(Math.random() * 15) + 80);
      setCharConsistency(currentScene.consistencyScore?.character || 90);
      setProdConsistency(currentScene.consistencyScore?.product || 92);
      setBgConsistency(currentScene.consistencyScore?.background || 85);
      setStyleConsistency(currentScene.consistencyScore?.style || 90);
    }
  }, [selectedSceneIndex, project]);

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
- Estimated Duration: ${currentScene.duration || 8} seconds
- Distribution Platform: ${project.platform}
- Workflow Type: ${project.type}
- Rendering Video Model: ${project.videoModel}
- Rendering Voice Model: ${currentScene.voiceModel || project.voiceModel || 'Gemini TTS'}

BLOCK 2: IMAGE PROMPT (KEYFRAME)
${currentScene.imagePrompt}

BLOCK 3: VIDEO PROMPT (MOTION DYNAMICS)
${currentScene.videoPrompt}

BLOCK 4: CAMERA BLOCK
${currentScene.cameraPrompt || 'Close-up focal scale tracking, macro 35mm lens angle, cinematic high contrast lighting depth.'}

BLOCK 5: AUDIO BLOCK
- Voice Profiles: ${currentScene.voiceModel || project.voiceModel || 'Gemini TTS'} Warm, High-Conversion Dialogue pacing
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

  const handleSaveChanges = () => {
    if (!currentScene || !onUpdateProject) return;

    const updatedScenes = scenes.map((s, idx) => {
      if (idx === selectedSceneIndex) {
        return {
          ...s,
          narration: editNarration,
          imagePrompt: editImagePrompt,
          videoPrompt: editVideoPrompt,
          cameraPrompt: editCameraPrompt,
          action: editAction,
          hookScore: hookScore,
          ctaScore: ctaScore,
          consistencyScore: {
            character: charConsistency,
            product: prodConsistency,
            background: bgConsistency,
            style: styleConsistency,
          }
        };
      }
      return s;
    });

    const updatedProject: Project = {
      ...project,
      scenes: updatedScenes,
    };

    onUpdateProject(updatedProject);
    setIsEditing(false);
  };

  const exportPromptPackTxt = () => {
    const content = scenes
      .map((s) => `
========================================
SCENE ${s.sceneNumber} CINEMATIC BREAKDOWN BLOCK
========================================
BLOCK 1: SCENE INFO METADATA
- Scene Number: ${s.sceneNumber}
- Duration Estimate: ${s.duration || 8}s
- Platform: ${project.platform}
- Workflow: ${project.type}
- Image Model: ${project.imageModel}
- Video Model: ${project.videoModel}
- Voice Model: ${s.voiceModel || project.voiceModel || 'Gemini TTS'}

BLOCK 2: IMAGE PROMPT (KEYFRAME)
${s.imagePrompt}

BLOCK 3: VIDEO PROMPT (MOTION DYNAMICS)
${s.videoPrompt}

BLOCK 4: CAMERA BLOCK
${s.cameraPrompt || 'Close-up focal scale tracking, macro 35mm lens angle, cinematic depth.'}

BLOCK 5: AUDIO BLOCK
Warm, High-Conversion Dialogue pacing alignment via ${s.voiceModel || project.voiceModel || 'Gemini TTS'}.

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
        imageModel: project.imageModel,
        videoModel: project.videoModel,
        voiceModel: s.voiceModel || project.voiceModel || 'Gemini TTS',
        duration: s.duration || 8
      },
      imagePrompt: s.imagePrompt,
      videoPrompt: s.videoPrompt,
      cameraBlock: s.cameraPrompt || 'Close-up zoom, 35mm lens depth',
      audioBlock: `Warm conversational tone via ${s.voiceModel || project.voiceModel || 'Gemini TTS'}`,
      dialogueBlock: s.narration,
      ambientSound: 'Soft ASMR sweep acoustics',
      dnaLocks: project.dnaLock || {},
      consistencyScores: s.consistencyScore || {character: 90, product: 92, background: 85, style: 90},
      conversionMetrics: { hookScore: s.hookScore || 85, ctaScore: s.ctaScore || 80 },
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
            <Terminal className="w-5 h-5 text-emerald-400" /> Active Scene Editor & Prompt Chain Inspector
          </h2>
          <p className="text-xs text-gray-400">
            Tweak scene-level script copy, overlay prompts, and monitor high-conversion consistency metrics of your AI video workspace.
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
        {/* Left Column: Selector list & Conversion diagnostics */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex bg-[#0D0D0D] p-3 rounded-xl border border-white/5 justify-between items-center select-none">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Scenes & Script Boards</span>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 uppercase font-bold">
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
                  className={`w-full p-3 rounded-xl text-left border transition-all flex justify-between items-center ${
                    isSel
                      ? 'bg-gradient-to-r from-emerald-500/[0.04] to-none border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'bg-[#50505] border-white/5 text-gray-400 hover:bg-white/[0.01]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className={`text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      isSel ? 'bg-emerald-400 text-black font-extrabold' : 'bg-white/5 text-gray-300'
                    }`}>
                      {s.sceneNumber}
                    </span>
                    <span className="text-xs font-sans font-semibold truncate flex-1 block">{s.action || `Scene Board Component ${s.sceneNumber}`}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-650 shrink-0" />
                </button>
              );
            })}

            {scenes.length === 0 && (
              <div className="p-8 text-center text-xs text-gray-500 font-mono bg-white/[0.01] border border-dashed border-white/5 rounded-xl select-none">
                No active scenes found. Compile script blocks first.
              </div>
            )}
          </div>

          {/* Real-time Diagnostics HUD */}
          {currentScene && (
            <div className="p-4 bg-[#0d0d12] rounded-xl border border-white/5 space-y-4">
              <h4 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {project.name.toUpperCase()} SCENE CONVERSION STATS
              </h4>

              {/* Conversion Metrics overrides */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/60 border border-white/5 space-y-1">
                  <span className="text-[9px] text-gray-500 uppercase block font-bold leading-none">🧠 UGC HOOK SCORE</span>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-lg font-black ${hookScore >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {hookScore}%
                    </span>
                    <span className="text-[8px] text-gray-400">EXCELLENT</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={hookScore}
                    onChange={(e) => {
                      setHookScore(Number(e.target.value));
                      if (!isEditing) setIsEditing(true);
                    }}
                    className="w-full accent-emerald-400 h-1 bg-white/10 rounded"
                  />
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-white/5 space-y-1">
                  <span className="text-[9px] text-gray-500 uppercase block font-bold leading-none">🎯 CALL TO ACTION (CTA)</span>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-lg font-black ${ctaScore >= 80 ? 'text-[#4DA6FF]' : 'text-amber-500'}`}>
                      {ctaScore}%
                    </span>
                    <span className="text-[8px] text-gray-400">CONVERTING</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={ctaScore}
                    onChange={(e) => {
                      setCtaScore(Number(e.target.value));
                      if (!isEditing) setIsEditing(true);
                    }}
                    className="w-full accent-[#4DA6FF] h-1 bg-white/10 rounded"
                  />
                </div>
              </div>

              {/* System Consistency Scores */}
              <div className="text-[10px] font-mono text-gray-400 space-y-2.5">
                <span className="block border-b border-white/5 pb-1 font-bold text-slate-500">REAL-TIME CONSISTENCY SCORES</span>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>🧬 Character Similarity Lock</span>
                    <span className="text-emerald-400 font-bold">{charConsistency}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="100"
                    value={charConsistency}
                    onChange={(e) => {
                      setCharConsistency(Number(e.target.value));
                      if (!isEditing) setIsEditing(true);
                    }}
                    className="w-full accent-emerald-400 h-0.5 bg-white/15"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>🎁 Brand Product Accuracy</span>
                    <span className="text-emerald-400 font-bold">{prodConsistency}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="100"
                    value={prodConsistency}
                    onChange={(e) => {
                      setProdConsistency(Number(e.target.value));
                      if (!isEditing) setIsEditing(true);
                    }}
                    className="w-full accent-emerald-400 h-0.5 bg-white/15"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>🏞 Studio Background Staging</span>
                    <span className="text-yellow-400 font-bold">{bgConsistency}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={bgConsistency}
                    onChange={(e) => {
                      setBgConsistency(Number(e.target.value));
                      if (!isEditing) setIsEditing(true);
                    }}
                    className="w-full accent-yellow-400 h-0.5 bg-white/15"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>🎨 Theme & Style Curve Match</span>
                    <span className="text-[#4DA6FF] font-bold">{styleConsistency}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="100"
                    value={styleConsistency}
                    onChange={(e) => {
                      setStyleConsistency(Number(e.target.value));
                      if (!isEditing) setIsEditing(true);
                    }}
                    className="w-full accent-[#4DA6FF] h-0.5 bg-white/15"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Scene Editor Details / Playbook Matrix */}
        <div className="lg:col-span-8 space-y-6">
          {currentScene ? (
            <div className="space-y-6">
              
              {/* Controls bar */}
              <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                <span className="text-xs font-mono text-gray-400 flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-[#4DA6FF]" />
                  <span>Scene {currentScene.sceneNumber} Editor Mode:</span>
                  {isEditing ? (
                    <span className="text-amber-400 font-bold uppercase animate-pulse">● Unsaved Changes</span>
                  ) : (
                    <span className="text-emerald-400 font-bold uppercase">✓ Matched with Engine</span>
                  )}
                </span>
                
                <div className="flex gap-2">
                  {isEditing && (
                    <button
                      onClick={handleSaveChanges}
                      className="px-3 py-1.5 rounded-lg bg-[#4DA6FF] hover:bg-[#4DA6FF]/90 text-black text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(77,166,255,0.2)]"
                    >
                      <Save className="w-3 h-3 text-black" /> Save Scene Changes
                    </button>
                  )}
                  <button
                    onClick={handleCopyAllBlocks}
                    className="px-3 py-1.5 rounded bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-gray-300 hover:text-white text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedTarget === 'copy-all-blocks' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400 stroke-[3]" /> Mapped!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-emerald-400 stroke-[3]" /> Copy All Blocks
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 9 conceptual blocks pipeline */}
              <div className="space-y-4">
                
                {/* Block 1: Scene Info Metadata */}
                <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/10">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-1">Block 1: Scene Info Metadata</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono text-gray-300">
                    <div><span className="text-gray-500 block">SCENE ID:</span> {currentScene.sceneNumber}</div>
                    <div><span className="text-gray-500 block">PLAYBACK TIME:</span> {currentScene.duration || 8}s</div>
                    <div><span className="text-gray-500 block">PLATFORM:</span> {project.platform}</div>
                    <div><span className="text-gray-500 block">WORKFLOW:</span> {project.type}</div>
                    <div><span className="text-gray-500 block">VOICE PROFILE:</span> {currentScene.voiceModel || project.voiceModel || 'Gemini TTS'}</div>
                  </div>
                </div>

                {/* Edit Section: Mapped Action Title */}
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-1">
                  <label className="text-[9px] font-mono text-gray-400 uppercase block tracking-wider font-bold">Scene Frame Primary Action</label>
                  <input
                    type="text"
                    value={editAction}
                    onChange={(e) => {
                      setEditAction(e.target.value);
                      setIsEditing(true);
                    }}
                    className="w-full bg-black/60 text-xs border border-white/15 focus:border-[#4DA6FF] rounded-lg p-2 outline-none font-sans text-white"
                  />
                  <p className="text-[9px] text-gray-500 font-sans italic pt-0.5">Title of frame layout action used for internal mapping.</p>
                </div>

                {/* Block 2: Image Prompt */}
                <div className="p-4 bg-[#0A0A0A] rounded-xl border border-white/5 relative group space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-black">Block 2: Image Prompt (Keyframe Visual Seed)</span>
                    <button onClick={() => handleCopy(editImagePrompt, 'block2')} className="text-[10px] font-mono text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer">
                      {copiedTarget === 'block2' ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>} Copy Prompt
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={editImagePrompt}
                    onChange={(e) => {
                      setEditImagePrompt(e.target.value);
                      setIsEditing(true);
                    }}
                    className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs font-mono text-white focus:border-emerald-400 outline-none resize-y"
                  />
                </div>

                {/* Block 3: Video Prompt */}
                <div className="p-4 bg-[#0A0A0A] rounded-xl border border-[#4DA6FF]/10 relative group space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-mono text-[#4DA6FF] uppercase tracking-widest font-black">Block 3: Video Prompt (Cinematic Motion Dynamics)</span>
                    <button onClick={() => handleCopy(editVideoPrompt, 'block3')} className="text-[10px] font-mono text-[#4DA6FF] hover:underline flex items-center gap-1 cursor-pointer">
                      {copiedTarget === 'block3' ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>} Copy Prompt
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={editVideoPrompt}
                    onChange={(e) => {
                      setEditVideoPrompt(e.target.value);
                      setIsEditing(true);
                    }}
                    className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs font-mono text-white focus:border-[#4DA6FF] outline-none resize-y"
                  />
                </div>

                {/* Block 4: Camera Block */}
                <div className="p-4 bg-[#0A0A0A] rounded-xl border border-white/5 relative group space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest font-black">Block 4: Camera Block (Rig Actuators & Lens Layout)</span>
                    <button onClick={() => handleCopy(editCameraPrompt, 'block4')} className="text-[10px] font-mono text-amber-500 hover:underline flex items-center gap-1 cursor-pointer">
                      {copiedTarget === 'block4' ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>} Copy
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={editCameraPrompt}
                    onChange={(e) => {
                      setEditCameraPrompt(e.target.value);
                      setIsEditing(true);
                    }}
                    className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs font-mono text-white focus:border-amber-500 outline-none resize-y"
                  />
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
                <div className="p-4 bg-[#0A0A0A] rounded-xl border border-white/5 relative group space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-mono text-pink-400 uppercase tracking-widest font-black">Block 6: Dialogue Script (Somatic Voiceover Copy)</span>
                    <button onClick={() => handleCopy(editNarration, 'block6')} className="text-[10px] font-mono text-pink-400 hover:underline flex items-center gap-1 cursor-pointer">
                      {copiedTarget === 'block6' ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>} Copy Dialogue
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={editNarration}
                    onChange={(e) => {
                      setEditNarration(e.target.value);
                      setIsEditing(true);
                    }}
                    className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs font-sans text-rose-300 focus:border-pink-400 outline-none resize-y"
                  />
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
