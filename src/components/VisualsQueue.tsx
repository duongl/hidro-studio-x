import React, { useState, useEffect } from 'react';
import { Project, SceneCard } from '../types';
import { generateSyntheticCinematicSvg } from '../utils';
import { Play, Pause, RefreshCw, Copy, Download, FileText, Check, AlertTriangle, Layers, Zap, ChevronRight } from 'lucide-react';
import { useLanguage } from '../utils/i18n';
import { useBackgroundQueue } from '../context/BackgroundQueueContext';

interface VisualsQueueProps {
  project: Project;
  onUpdateSceneSingle: (index: number, updatedScene: SceneCard) => void;
  onUpdateAllScenes: (scenes: SceneCard[]) => void;
  onAdvanceStep: () => void;
  onVisualsCompleted: () => void;
}

export default function VisualsQueue({ project, onUpdateSceneSingle, onUpdateAllScenes, onAdvanceStep, onVisualsCompleted }: VisualsQueueProps) {
  const { lang, t } = useLanguage();
  const { 
    addJob, 
    startVisualProduction, 
    stopVisualProduction, 
    isVisualProductionRunning 
  } = useBackgroundQueue();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Helper notice triggered on copy clicks
  const triggerCopyNotice = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(identifier);
    setTimeout(() => {
      setCopiedText(null);
    }, 1500);
  };

  const toggleRenderQueue = () => {
    if (isVisualProductionRunning) {
      stopVisualProduction();
    } else {
      startVisualProduction();
    }
  };

  // Single card reruns enqueued to background queue
  const runSingleRerun = (index: number) => {
    const scene = project.scenes[index];
    
    // Enqueue single frame compile
    addJob({
      type: 'image_generation',
      sceneNumber: scene.sceneNumber,
      sceneId: scene.id,
      title: `Render Scheme: Scene ${scene.sceneNumber}`,
      description: `Reframing single scene DNA visual details and depth.`,
      maxAttempts: 1
    });
  };

  // Download logic for single image
  const triggerImageDownload = (url: string | undefined, sceneNum: number) => {
    const link = document.createElement('a');
    link.href = url || generateSyntheticCinematicSvg(`Scene ${sceneNum}`, 'Fluid design core', sceneNum);
    link.download = `hidro_scene_${sceneNum}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toolbar Export logic
  const exportTxt = () => {
    const content = project.scenes
      .map((s) => `SCENE ${s.sceneNumber}\nNarration: ${s.narration}\nAction: ${s.action}\nPrompt: ${s.imagePrompt}\n\n`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${project.name.replace(/\s+/g, '_')}_scripts.txt`;
    link.click();
  };

  const exportJson = () => {
    const content = JSON.stringify(project, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${project.name.replace(/\s+/g, '_')}_meta.json`;
    link.click();
  };

  const exportPromptPack = () => {
    const content = project.scenes
      .map((s) => `[SCENE ${s.sceneNumber} IMAGE PROMPT]\n${s.imagePrompt}\n\n[SCENE ${s.sceneNumber} VIDEO PROMPT]\n${s.videoPrompt}\n--------------------------------\n`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${project.name.replace(/\s+/g, '_')}_prompt_keys.txt`;
    link.click();
  };

  const exportCsv = () => {
    const headers = ['Scene Number', 'Duration', 'Narration', 'Action', 'Style', 'Image Prompt', 'Video Prompt'];
    const rows = project.scenes.map(s => [
      s.sceneNumber,
      s.duration || 8,
      `"${(s.narration || '').replace(/"/g, '""')}"`,
      `"${(s.action || '').replace(/"/g, '""')}"`,
      `"${(s.visualDirection || '').replace(/"/g, '""')}"`,
      `"${(s.imagePrompt || '').replace(/"/g, '""')}"`,
      `"${(s.videoPrompt || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${project.name.replace(/\s+/g, '_')}_master_sheet.csv`;
    link.click();
  };

  const exportMarkdown = () => {
    const content = `# ${project.name} - Cinematic Project Document\n\n` +
      `**Category**: ${project.type}\n` +
      `**Platform**: ${project.platform}\n` +
      `**Target Duration**: ${project.targetDuration} seconds\n` +
      `**Scenes**: ${project.scenes.length}\n\n` +
      `## DNA locks & Brand Guidelines\n` +
      `- **Character DNA**: ${project.dnaLock?.CHARACTER_DNA || 'N/A'}\n` +
      `- **Product DNA**: ${project.dnaLock?.PRODUCT_DNA || 'N/A'}\n` +
      `- **Background DNA**: ${project.dnaLock?.BACKGROUND_DNA || 'N/A'}\n` +
      `- **Style DNA**: ${project.dnaLock?.STYLE_DNA || 'N/A'}\n\n` +
      `## Storyboard Sequences\n\n` +
      project.scenes.map(s => 
        `### Scene ${s.sceneNumber} (${s.duration || 8}s)\n` +
        `- **Voiceover/Narration**: *"${s.narration || ''}"*\n` +
        `- **Action/Subject**: ${s.action || ''}\n` +
        `- **Visual style directions**: ${s.visualDirection || ''}\n` +
        `- **Injected Image Prompt**: \`${s.imagePrompt || ''}\`\n` +
        `- **Injected Video Motion Prompt**: \`${s.videoPrompt || ''}\`\n`
      ).join('\n---\n\n');
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${project.name.replace(/\s+/g, '_')}_storyboard.md`;
    link.click();
  };

  const downloadAllImages = () => {
    project.scenes.forEach((s) => {
      triggerImageDownload(s.imageUrl, s.sceneNumber);
    });
  };

  const handleFinishVisuals = () => {
    onVisualsCompleted();
    onAdvanceStep();
  };

  const isAllCompleted = project.scenes && project.scenes.length > 0 && project.scenes.every((s) => s.status === 'completed');

  return (
    <div className="space-y-6 animate-fade-in text-[#e5e5e5]" id="visuals_queue_panel">
      {/* Visual Header and Queue controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            {t('visualsPipelineTitle')}
          </h2>
          <p className="text-xs text-gray-400">
            {t('visualsPipelineDesc')}
          </p>
        </div>

        {project.scenes?.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={toggleRenderQueue}
              className={`px-6 py-3 rounded-full text-xs font-mono font-extrabold uppercase flex items-center gap-2 tracking-wider shadow-md transition-all cursor-pointer ${
                isVisualProductionRunning
                  ? 'bg-amber-400 text-black hover:bg-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                  : 'bg-[#66FF99] text-black hover:bg-[#66FF99]/90 shadow-[0_0_20px_rgba(102,255,153,0.3)]'
              }`}
            >
              {isVisualProductionRunning ? (
                <>
                  <Pause className="w-4 h-4 text-black fill-black" /> {t('stopRenderQueue')}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-black fill-black" /> {t('startRenderQueue')}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Top Export Bar */}
      {project.scenes?.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 bg-[#0D0D0D] p-3 rounded-xl border border-white/5 mt-2">
          <span className="text-[10px] font-mono text-gray-500 mr-2 uppercase tracking-widest">{t('exportSuite')}</span>
          
          <button
            onClick={downloadAllImages}
            id="btn_export_zip"
            className="px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-[#66FF99]/20 hover:bg-white/[0.05] text-xs font-mono text-gray-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> {t('downloadImagesPack')}
          </button>

          <button
            onClick={exportPromptPack}
            id="btn_export_pack"
            className="px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-[#4DA6FF]/20 hover:bg-white/[0.05] text-xs font-mono text-gray-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" /> {t('exportPromptPack')}
          </button>

          <button
            onClick={exportJson}
            id="btn_export_json"
            className="px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] text-xs font-mono text-gray-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" /> {t('exportJsonSchema')}
          </button>

          <button
            onClick={exportTxt}
            id="btn_export_txt"
            className="px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] text-xs font-mono text-gray-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" /> {t('exportTxtDraft')}
          </button>

          <button
            onClick={exportCsv}
            id="btn_export_csv"
            className="px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-[#66FF99]/20 hover:bg-white/[0.05] text-xs font-mono text-gray-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
            title="Export full scene master layout table to Excel/CSV"
          >
            <FileText className="w-3.5 h-3.5" /> CSV Sheet
          </button>

          <button
            onClick={exportMarkdown}
            id="btn_export_md"
            className="px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-[#4DA6FF]/20 hover:bg-white/[0.05] text-xs font-mono text-gray-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
            title="Export formatted Markdown Storyboard document"
          >
            <FileText className="w-3.5 h-3.5" /> Markdown Doc
          </button>
        </div>
      )}

      {/* Rendering Status Track Banner */}
      {isVisualProductionRunning && (
        <div className="p-4 rounded-xl bg-amber-400/5 border border-amber-400/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
            </span>
            <div className="text-xs font-mono">
              <span className="text-amber-400 uppercase font-black mr-2">{t('queueActive') || 'Pipeline Active'}:</span>
              <span>{lang === 'en' ? 'Automatic background rendering pipeline active' : 'Đang chạy tiến trình render và thiết kế cảnh tự động'}</span>
            </div>
          </div>
          
          <div className="text-[10px] font-mono text-gray-500">
            {t('noParallelInterference')}
          </div>
        </div>
      )}

      {/* Completed Sequential Render Action Footer */}
      {isAllCompleted && (
        <div className="p-6 rounded-3xl bg-[#66FF99]/5 border border-[#66FF99]/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(102,255,153,0.05)]" id="rendering_completion_footer">
          <div className="flex items-center gap-3 text-sm font-sans font-bold text-white">
            <Check className="w-5 h-5 text-[#66FF99]" />
            <span>{t('visualSuccessMsg')}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={downloadAllImages}
              className="flex-1 sm:flex-none px-6 py-3 rounded-full border border-white/10 hover:border-white/25 text-xs font-mono font-bold uppercase transition-all hover:bg-white/[0.02] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> {t('downloadAllBtn')}
            </button>
            <button
              onClick={handleFinishVisuals}
              className="flex-1 sm:flex-none px-6 py-3 rounded-full bg-[#66FF99] text-black text-xs font-mono font-black uppercase tracking-wider transition-all hover:scale-103 hover:bg-[#66FF99]/90 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(102,255,153,0.25)] cursor-pointer"
            >
              {t('continueToVideoBtn')} <ChevronRight className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      )}

      {/* Grid List of Scene Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {project.scenes?.map((scene, index) => {
          const isRendering = scene.status === 'rendering';
          const isCompleted = scene.status === 'completed';
          const isFailed = scene.status === 'failed';
          const previewSrc = scene.imageUrl || generateSyntheticCinematicSvg(scene.narration, scene.action, scene.sceneNumber);

          return (
            <div
              key={scene.id}
              className={`rounded-3xl border overflow-hidden flex flex-col justify-between ${
                isRendering
                  ? 'bg-amber-400/5 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.1)]'
                  : isCompleted
                  ? 'bg-[#0D0D0D] border-white/5 shadow-md'
                  : 'bg-[#0D0D0D] border-white/5 opacity-80'
              }`}
            >
              {/* Image Preview Window */}
              <div className="relative aspect-[16/9] w-full bg-black/60 overflow-hidden">
                <img
                  src={previewSrc}
                  alt={`Scene ${scene.sceneNumber}`}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isRendering ? 'scale-105 opacity-60' : 'opacity-90'
                  }`}
                  referrerPolicy="no-referrer"
                />

                {/* Queue status badge overlays */}
                <span className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-[11px] font-mono font-bold tracking-wider text-white">
                  {t('sceneLabel')} {scene.sceneNumber}
                </span>

                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  {isRendering && (
                    <span className="bg-amber-400 text-black text-[9px] font-mono font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> {t('statusRendering')}
                    </span>
                  )}
                  {isCompleted && (
                    <span className="bg-[#66FF99]/10 border border-[#66FF99]/30 text-[#66FF99] text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-2.5 h-2.5 text-[#66FF99]" /> {t('statusLocked')}
                    </span>
                  )}
                  {isFailed && (
                    <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> {t('statusFailed')}
                    </span>
                  )}
                  {!isRendering && !isCompleted && !isFailed && (
                    <span className="bg-white/5 border border-white/15 text-gray-400 text-[9px] font-mono uppercase px-2.5 py-1 rounded-full">
                      {t('statusPending')}
                    </span>
                  )}
                </div>

                {/* Loading retry counter overlay */}
                {isRendering && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">{t('engineRetryInjector')}</span>
                    <span className="text-white text-xs font-mono font-bold mt-1 uppercase">{t('attemptOf', { attempt: scene.attempts, max: 3 })}</span>
                  </div>
                )}
              </div>

              {/* Card Meta Content Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-0.5">{t('voiceoverNarration')}</span>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans font-medium line-clamp-3">
                      &quot;{scene.narration}&quot;
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-white/5 pt-2">
                    <div>
                      <span className="text-gray-500 uppercase block mb-0.5">{t('actionCol')}:</span>
                      <span className="text-gray-400 line-clamp-2 leading-normal">{scene.action}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 uppercase block mb-0.5">{t('styleCol')}:</span>
                      <span className="text-gray-400 line-clamp-2 leading-normal">{scene.visualDirection}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action triggers on Card limits */}
                <div className="border-t border-white/5 pt-3 mt-1 flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => triggerCopyNotice(scene.imagePrompt, `img-p-${scene.id}`)}
                      type="button"
                      className="px-2.5 py-1.5 rounded bg-white/[0.03] hover:bg-white/[0.08] text-[10px] font-mono text-gray-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                      title="Copy Image Prompt with DNA locked parameters"
                    >
                      {copiedText === `img-p-${scene.id}` ? (
                        <Check className="w-3 h-3 text-[#66FF99]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      IMAGE PROMPT
                    </button>

                    <button
                      onClick={() => triggerCopyNotice(scene.videoPrompt, `vid-p-${scene.id}`)}
                      type="button"
                      className="px-2.5 py-1.5 rounded bg-white/[0.03] hover:bg-white/[0.08] text-[10px] font-mono text-gray-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                      title="Copy Motion engine Prompt with DNA locked parameters"
                    >
                      {copiedText === `vid-p-${scene.id}` ? (
                        <Check className="w-3 h-3 text-[#66FF99]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      VIDEO PROMPT
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => runSingleRerun(index)}
                      className="p-1.5 rounded bg-white/[0.02] hover:bg-white/[0.08] text-gray-400 hover:text-[#66FF99] transition-colors cursor-pointer"
                      title="Regenerate individual scene"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={() => triggerImageDownload(scene.imageUrl, scene.sceneNumber)}
                      className="p-1.5 rounded bg-white/[0.02] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-colors cursor-pointer"
                      title="Download Rendered Image"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
