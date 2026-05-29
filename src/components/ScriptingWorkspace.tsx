import React, { useState, useEffect } from 'react';
import { Project, SceneCard } from '../types';
import { 
  Sparkles, 
  Clipboard, 
  CheckCircle, 
  ArrowRight, 
  BookOpen, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  User, 
  Package, 
  MessageSquare, 
  Video, 
  Camera, 
  Volume2, 
  Zap, 
  Clock, 
  FileText,
  Sliders
} from 'lucide-react';
import { useLanguage } from '../utils/i18n';
import { useBackgroundQueue } from '../context/BackgroundQueueContext';

interface ScriptingWorkspaceProps {
  project: Project;
  onUpdateScenes: (scenes: SceneCard[], scriptText: string) => void;
  onAdvanceStep: () => void;
  onScriptingCompleted: () => void;
}

export default function ScriptingWorkspace({ project, onUpdateScenes, onAdvanceStep, onScriptingCompleted }: ScriptingWorkspaceProps) {
  const { lang, t } = useLanguage();
  const { jobs, triggerScriptGeneration } = useBackgroundQueue();
  const [tab, setTab] = useState<'ai' | 'paste'>('ai');

  // TAB 1: AI Generate fields
  const [productIdea, setProductIdea] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [hookStyle, setHookStyle] = useState('Liquid Gold Reveal');
  const [ctaStyle, setCtaStyle] = useState('Exclusive Discount Pop-up');

  // TAB 2: Paste script input
  const [rawText, setRawText] = useState('');

  // SCRIPT CARDS STATE
  const [activeScenes, setActiveScenes] = useState<SceneCard[]>([]);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);

  // Connection to background job state
  const activeJob = jobs.find(j => j.type === 'script_generation' && (j.status === 'running' || j.status === 'pending'));
  const loading = !!activeJob;

  // Synchronize on load or when project is updated by parent step settings (e.g. Scene Count!)
  useEffect(() => {
    setActiveScenes(project.scenes || []);
    if (project.scenes && project.scenes.length > 0 && selectedSceneIndex >= project.scenes.length) {
      setSelectedSceneIndex(0);
    }
  }, [project.scenes]);

  const activeScene = activeScenes[selectedSceneIndex] || null;

  // AUTO DNA INJECTION WRAPPER
  const injectDNALocks = (narration: string, action: string, visualDir: string): { imagePrompt: string; videoPrompt: string } => {
    const c_dna = project.dnaLock?.CHARACTER_DNA || 'consistent premium character outline';
    const p_dna = project.dnaLock?.PRODUCT_DNA || 'consistent high-gloss product container';
    const b_dna = project.dnaLock?.BACKGROUND_DNA || 'cinematic studio ambient staging';
    const s_dna = project.dnaLock?.STYLE_DNA || 'premium Liquid Glass glass reflections and shadows';

    const visualInspiration = project.directorInsight?.visualDNA || 'anamorphic wide f/1.2 micro haze';
    const marketingInsight = project.directorInsight?.marketInsight || 'high contrast premium scrolling format';

    // Image Prompt incorporates structural constants + scene specifics
    const imagePrompt = `[DNA_LOCKED] CHAR: ${c_dna} | PROD: ${p_dna} | BG: ${b_dna} | STYLE: ${s_dna}. Scene specific: ${action}. Lens/lighting: ${visualDir}, ${visualInspiration}. Photorealistic, 8k render, no random texts.`;
    
    // Video prompt tailored to fluid-physics video generators
    const videoPrompt = `[PHYSICS_ANIMATION] Veo video model prompt: Injected DNA - CHAR: ${c_dna} | PROD: ${p_dna} | BG: ${b_dna} | STYLE: ${s_dna}. Dynamic physics: ${action}. Camera movement: ${visualDir}. Audience focus: ${marketingInsight}. Cinematic 3D motion glide.`;

    return { imagePrompt, videoPrompt };
  };

  // AI Generation & Deconstructor API handler
  const handleCompileScript = () => {
    let aggregatedFocusPrompt = '';

    if (tab === 'ai') {
      aggregatedFocusPrompt = `
        Product concept Idea: ${productIdea}
        Marketing Campaign Goal: ${campaignGoal}
        Target Customer Audience: ${targetAudience}
        Opening Hook Style: ${hookStyle}
        Conversion CTA Call: ${ctaStyle}
      `;
    } else {
      aggregatedFocusPrompt = rawText;
    }

    triggerScriptGeneration({
      mode: tab === 'paste' ? 'paste' : 'ai',
      idea: productIdea,
      goal: campaignGoal,
      audience: targetAudience,
      hook: hookStyle,
      cta: ctaStyle,
      rawText: aggregatedFocusPrompt
    });
  };

  // Listen to background compilation completion
  useEffect(() => {
    if (project.scriptingCompleted) {
      onScriptingCompleted();
    }
  }, [project.scriptingCompleted]);

  // SCENE EVENT HANDLERS (Realtime saving to Project context)
  const saveScenesToProject = (updated: SceneCard[]) => {
    setActiveScenes(updated);
    onUpdateScenes(updated, tab === 'paste' ? rawText : `AI Generated / Pasted Workspace`);
  };

  // Update specific scene property
  const handleUpdateSceneField = (idx: number, field: keyof SceneCard, value: any) => {
    const updated = activeScenes.map((sc, scIdx) => {
      if (scIdx === idx) {
        const payload = { ...sc, [field]: value };
        // Recalculate injected prompts when core values edit
        if (field === 'narration' || field === 'action' || field === 'visualDirection') {
          const { imagePrompt, videoPrompt } = injectDNALocks(
            field === 'narration' ? value : sc.narration,
            field === 'action' ? value : sc.action,
            field === 'visualDirection' ? value : sc.visualDirection
          );
          payload.imagePrompt = imagePrompt;
          payload.videoPrompt = videoPrompt;
        }
        return payload;
      }
      return sc;
    });
    saveScenesToProject(updated);
  };

  // Scene Action Managers
  const handleAddScene = () => {
    const freshIndex = selectedSceneIndex + 1;
    const { imagePrompt, videoPrompt } = injectDNALocks(
      'New narration copy.',
      'Subject rotates or showcase product details.',
      'Slick lens refraction glow detail.'
    );

    const newScene: SceneCard = {
      id: `sc-manual-${Date.now()}`,
      sceneNumber: freshIndex + 1,
      narration: 'New captivating narration line here details.',
      action: 'Action choreographing details.',
      visualDirection: 'Cinematic visual direction spec.',
      imagePrompt,
      videoPrompt,
      negativePrompt: 'low contrast, artifacts on product, text overlap',
      cameraPrompt: 'Dolly dynamic pan zoom-in',
      motionPrompt: 'Slick smooth water glides',
      voicePrompt: 'Professional tone presentation',
      status: 'idle',
      attempts: 0,
    };

    const copy = [...activeScenes];
    copy.splice(freshIndex, 0, newScene);

    // Reindex scene numbers
    const finalScenes = copy.map((sc, i) => ({
      ...sc,
      sceneNumber: i + 1,
    }));

    saveScenesToProject(finalScenes);
    setSelectedSceneIndex(freshIndex);
  };

  const handleDeleteScene = () => {
    if (activeScenes.length <= 1) return;
    const copy = activeScenes.filter((_, i) => i !== selectedSceneIndex);

    // Reindex scene numbers
    const finalScenes = copy.map((sc, i) => ({
      ...sc,
      sceneNumber: i + 1,
    }));

    saveScenesToProject(finalScenes);
    setSelectedSceneIndex(Math.max(0, selectedSceneIndex - 1));
  };

  const handleDuplicateScene = () => {
    if (!activeScene) return;
    const duplicated: SceneCard = {
      ...activeScene,
      id: `sc-dupe-${Date.now()}`,
      sceneNumber: selectedSceneIndex + 2,
      imageUrl: undefined, // empty generated image link on duplication
      status: 'idle',
      attempts: 0,
    };

    const copy = [...activeScenes];
    copy.splice(selectedSceneIndex + 1, 0, duplicated);

    // Reindex scene numbers
    const finalScenes = copy.map((sc, i) => ({
      ...sc,
      sceneNumber: i + 1,
    }));

    saveScenesToProject(finalScenes);
    setSelectedSceneIndex(selectedSceneIndex + 1);
  };

  const handleMoveUp = () => {
    if (selectedSceneIndex === 0) return;
    const copy = [...activeScenes];
    const target = copy[selectedSceneIndex];
    copy[selectedSceneIndex] = copy[selectedSceneIndex - 1];
    copy[selectedSceneIndex - 1] = target;

    // Reindex custom values
    const finalScenes = copy.map((sc, i) => ({
      ...sc,
      sceneNumber: i + 1,
    }));

    saveScenesToProject(finalScenes);
    setSelectedSceneIndex(selectedSceneIndex - 1);
  };

  const handleMoveDown = () => {
    if (selectedSceneIndex === activeScenes.length - 1) return;
    const copy = [...activeScenes];
    const target = copy[selectedSceneIndex];
    copy[selectedSceneIndex] = copy[selectedSceneIndex + 1];
    copy[selectedSceneIndex + 1] = target;

    // Reindex values
    const finalScenes = copy.map((sc, i) => ({
      ...sc,
      sceneNumber: i + 1,
    }));

    saveScenesToProject(finalScenes);
    setSelectedSceneIndex(selectedSceneIndex + 1);
  };

  // Sane pacing dynamic estimates mapping based on platform
  const getSceneDuration = (idx: number): number => {
    // Total Duration: project.targetDuration or 60s
    const totalSec = project.targetDuration || 60;
    const totalScenes = activeScenes.length || 1;
    // evenly distributed with small variations
    const basePacing = Math.floor(totalSec / totalScenes);
    const mod = totalSec % totalScenes;
    return idx < mod ? basePacing + 1 : basePacing;
  };

  const totalDurationSum = activeScenes.reduce((acc, _, i) => acc + getSceneDuration(i), 0);

  const isScriptLoaded = activeScenes.length > 0;

  return (
    <div className="space-y-8 animate-fade-in" id="scripting_workspace_box">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <span className="text-[#66FF99] font-mono text-[10px] tracking-widest uppercase block mb-1">
            STEP 3 — {lang === 'en' ? 'HIGH CONVERSION SCREENPLAY' : 'KỊCH BẢN CHUYỂN ĐỔI CAO'}
          </span>
          <h2 className="text-xl font-display font-extrabold text-white tracking-tight flex items-center gap-2">
            🎭 {lang === 'en' ? 'Dual Scripting Workspace' : 'Không Gian Biên Kịch Kép'}
          </h2>
          <p className="text-xs text-gray-400">
            {lang === 'en' 
              ? 'Inject assets DNA automatically into scene prompts and manage script timelines.' 
              : 'Tự động tiêm DNA tài sản vào prompt cảnh và kiểm soát nhịp độ thời gian video.'}
          </p>
        </div>

        {isScriptLoaded && (
          <button
            onClick={onAdvanceStep}
            className="px-6 py-2.5 rounded-xl bg-[#4DA6FF] hover:bg-[#4DA6FF]/90 text-black font-mono font-bold text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-98"
            id="btn_scripting_advance"
          >
            {lang === 'en' ? 'PROCEED TO VISUAL ENGINE' : 'TIẾN HÀNH THIẾT KẾ ỐNG KÍNH'}
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        )}
      </div>

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ==================================================== */}
          {/* LEFT PANEL: SCRIPT SOURCE                            */}
          {/* ==================================================== */}
          <div className="lg:col-span-5 space-y-6 flex flex-col h-full">
            <div className="bg-[#0B0B0B] border border-white/5 rounded-3xl p-5 space-y-6 flex-1 flex flex-col">
              
              {/* Tabs Switcher */}
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-2">
                  {lang === 'en' ? 'SCRIPT INPUT METHOD' : 'PHƯƠNG THỨC NHẬP LIỆU'}
                </span>
                <div className="flex bg-black p-1 rounded-xl border border-white/5 gap-1">
                  <button
                    type="button"
                    onClick={() => setTab('ai')}
                    className={`flex-1 py-2 text-[11px] font-mono font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      tab === 'ai'
                        ? 'bg-[#66FF99]/15 border border-[#66FF99]/20 text-[#66FF99]'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'AI Generate' : 'Tự động tạo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('paste')}
                    className={`flex-1 py-2 text-[11px] font-mono font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      tab === 'paste'
                        ? 'bg-[#66FF99]/15 border border-[#66FF99]/20 text-[#66FF99]'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'Paste Script' : 'Dán kịch bản'}
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 space-y-4">
                {tab === 'ai' ? (
                  <div className="space-y-3.5 animate-fade-in text-xs">
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">
                        {lang === 'en' ? 'Product Idea / Brand Core' : 'Ý tưởng sản phẩm / Giá trị cốt lõi'}
                      </label>
                      <input
                        type="text"
                        value={productIdea}
                        onChange={(e) => setProductIdea(e.target.value)}
                        placeholder={lang === 'en' ? 'e.g., Premium transparent glass anti-aging lotion bottle' : 'Ví dụ: Chai serum xóa nếp nhăn thủy tinh trong suốt'}
                        className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white placeholder-gray-700 focus:border-[#66FF99]/40 outline-none font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">
                        {lang === 'en' ? 'Campaign Goal' : 'Mục tiêu chiến dịch'}
                      </label>
                      <input
                        type="text"
                        value={campaignGoal}
                        onChange={(e) => setCampaignGoal(e.target.value)}
                        placeholder={lang === 'en' ? 'e.g., Excite shoppers, visual prestige social conversion' : 'Ví dụ: Kích thích sự tò mò, tạo thèm khát mua hàng'}
                        className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white placeholder-gray-700 focus:border-[#66FF99]/40 outline-none font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">
                        {lang === 'en' ? 'Target Audience Persona' : 'Khách hàng mục tiêu'}
                      </label>
                      <input
                        type="text"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder={lang === 'en' ? 'e.g., Skincare enthusiasts, busy modern professionals 25-45' : 'Ví dụ: Tín đồ làm đẹp thời thượng, bận rộn từ 25-45'}
                        className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white placeholder-gray-700 focus:border-[#66FF99]/40 outline-none font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                          {lang === 'en' ? 'Hook Style' : 'Phong cách dạo đầu'}
                        </label>
                        <select
                          value={hookStyle}
                          onChange={(e) => setHookStyle(e.target.value)}
                          className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:border-[#66FF99] outline-none cursor-pointer font-sans"
                        >
                          <option value="Liquid Gold Reveal">{lang === 'en' ? 'Water splash reveal' : 'Hiệu ứng tràn viền nước'}</option>
                          <option value="Scientific Formula Glass">{lang === 'en' ? 'Extreme macro details' : 'Macro cấu trúc lấp lánh'}</option>
                          <option value="UGC Lifestyle Shock">{lang === 'en' ? 'Shocking lifestyle check' : 'Góc quay người thật bất ngờ'}</option>
                          <option value="Somatic Sound Trigger">{lang === 'en' ? 'ASMR Sound trigger' : 'Âm thanh kích thích xúc giác'}</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                          {lang === 'en' ? 'CTA Closing Style' : 'Phong cách kêu gọi'}
                        </label>
                        <select
                          value={ctaStyle}
                          onChange={(e) => setCtaStyle(e.target.value)}
                          className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:border-[#66FF99] outline-none cursor-pointer font-sans"
                        >
                          <option value="Exclusive Discount Pop-up">{lang === 'en' ? 'Discount coupon overlay' : 'Voucher khẩn cấp giới hạn'}</option>
                          <option value="Direct Bio link swipe">{lang === 'en' ? 'Click biolink in bio profile' : 'Bấm vào giỏ hàng bên dưới'}</option>
                          <option value="Before-After Split reveal">{lang === 'en' ? 'Before vs After shock proof' : 'Chia đôi màn hình So sánh'}</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2 text-[10px] font-mono text-gray-500 leading-none">
                      <Clock className="w-3.5 h-3.5 text-[#66FF99]" />
                      <span>
                        {lang === 'en' ? 'Scene Target:' : 'Cảnh thiết lập:'} <strong className="text-[#66FF99]">{project.sceneCount} scenes</strong>
                      </span>
                      <span>•</span>
                      <span>
                        {lang === 'en' ? 'Length:' : 'Độ dài:'} <strong className="text-white">{project.targetDuration}s</strong>
                      </span>
                    </div>

                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                      <span className="text-[9px] font-mono text-indigo-400 block font-bold">🧬 AUTO DNA LOCKS INJECTOR</span>
                      <p className="text-[9px] text-gray-500 leading-normal">
                        Character, Product, Showroom Staging, Visual Contrast, and Audience Strategy from Steps 1 & 2 will automatically bind to prompts.
                      </p>
                    </div>

                  </div>
                ) : (
                  <div className="space-y-3.5 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">
                        {lang === 'en' ? 'Paste Raw Marketing Copy' : 'Dán văn bản thô đầy đủ'}
                      </label>
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#4DA6FF]/10 text-[#4DA6FF] border border-[#4DA6FF]/20 uppercase font-mono font-bold">
                        {lang === 'en' ? 'AI Deconstructor Enabled' : 'Kích hoạt bóc tách AI'}
                      </span>
                    </div>
                    <textarea
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder={lang === 'en' 
                        ? "Paste any raw Shopee/TikTok UGC scripts, Sales narrative, or voiceovers here. AI will deconstruct it into structured scene blocks and inject styling DNA locks..."
                        : "Dán kịch bản nói thô từ TikTok, kịch bản UGC hoặc văn bản thoại quảng cáo tại đây. Trí tuệ nhân tạo sẽ tự động phân tách thành các cảnh nhỏ hoàn chỉnh..."
                      }
                      rows={12}
                      className="w-full p-4 bg-black border border-white/5 rounded-2xl text-xs text-white placeholder-gray-700 focus:border-[#66FF99]/40 outline-none resize-none font-mono main-scrollbar leading-relaxed"
                    />
                    <div className="text-[9px] text-gray-500 font-mono italic">
                      💡 {lang === 'en' ? 'Examples: TikTok UGC script, Shopee Sales, UGC script, Voiceover text.' : 'Ví dụ: Kịch bản nói Shopee, thoại UGC, kịch bản giới thiệu sản phẩm.'}
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION COMPILING TRIGGER */}
              <button
                onClick={handleCompileScript}
                disabled={tab === 'ai' ? (!productIdea.trim() || !campaignGoal.trim()) : !rawText.trim()}
                className={`w-full py-3.5 rounded-xl text-xs font-mono font-black tracking-widest uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                  (tab === 'ai' ? (productIdea.trim() && campaignGoal.trim()) : rawText.trim())
                    ? 'bg-[#66FF99] text-black hover:scale-101 hover:shadow-lg active:scale-99 font-extrabold'
                    : 'bg-white/5 text-gray-600 cursor-not-allowed'
                }`}
                id="btn_execute_script_compilation"
              >
                <Sparkles className="w-4 h-4" />
                {tab === 'ai' 
                  ? (lang === 'en' ? 'GENERATE SCRIPT CARDS' : 'PHÁT HÀNH BẢN PHÂN CẢNH AI') 
                  : (lang === 'en' ? 'DECONSTRUCT SCRIPT' : 'BÓC TÁCH KỊCH BẢN THÀNH CẢNH')}
              </button>

            </div>
          </div>

          {/* ==================================================== */}
          {/* RIGHT PANEL: SCENE PREVIEW & TIMELINE                */}
          {/* ==================================================== */}
          <div className="lg:col-span-7 flex flex-col h-full space-y-4">
            {isScriptLoaded ? (
              <div className="space-y-4 flex-1 flex flex-col">
                
                {/* Scene Manager Toolbar */}
                <div className="bg-[#0B0B0B] border border-white/5 rounded-2xl p-3 flex flex-wrap gap-2 items-center justify-between shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-bold text-[#66FF99] uppercase select-none">
                      🛠 {lang === 'en' ? 'Scene Manager' : 'Trình quản lý cảnh'}:
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleAddScene}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-[#66FF99]/15 hover:text-[#66FF99] text-xs font-mono text-gray-300 transition-colors flex items-center gap-1 cursor-pointer"
                      title={lang === 'en' ? 'Add scene' : 'Thêm cảnh mới'}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Add' : 'Thêm'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDuplicateScene}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-[#4DA6FF]/15 hover:text-[#4DA6FF] text-xs font-mono text-gray-300 transition-colors flex items-center gap-1 cursor-pointer"
                      title={lang === 'en' ? 'Duplicate selected scene' : 'Nhân bản cảnh hiện tại'}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Dupe' : 'Sao chép'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteScene}
                      disabled={activeScenes.length <= 1}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1 ${
                        activeScenes.length > 1
                          ? 'bg-white/5 hover:bg-red-500/15 hover:text-red-400 text-gray-300 cursor-pointer'
                          : 'opacity-40 cursor-not-allowed text-gray-600'
                      }`}
                      title={lang === 'en' ? 'Delete active scene' : 'Xóa cảnh hiện tại'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Delete' : 'Xóa'}</span>
                    </button>

                    <div className="h-4 w-[1px] bg-white/10" />

                    <button
                      type="button"
                      onClick={handleMoveUp}
                      disabled={selectedSceneIndex === 0}
                      className={`p-1.5 rounded-lg transition-colors ${
                        selectedSceneIndex > 0
                          ? 'bg-white/5 hover:bg-white/10 text-gray-200 cursor-pointer'
                          : 'opacity-30 cursor-not-allowed text-gray-600'
                      }`}
                      title={lang === 'en' ? 'Move Up' : 'Dịch lên'}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleMoveDown}
                      disabled={selectedSceneIndex === activeScenes.length - 1}
                      className={`p-1.5 rounded-lg transition-colors ${
                        selectedSceneIndex < activeScenes.length - 1
                          ? 'bg-white/5 hover:bg-white/10 text-gray-200 cursor-pointer'
                          : 'opacity-30 cursor-not-allowed text-gray-600'
                      }`}
                      title={lang === 'en' ? 'Move Down' : 'Dịch xuống'}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Main Right Area: Dual scroll of scenes sidebar and current scene editor panel */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-hidden min-h-[450px]">
                  
                  {/* Scene cards thumbnail strip (Left on right panel) */}
                  <div className="md:col-span-4 overflow-y-auto max-h-[500px] space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/5">
                    {activeScenes.map((scene, i) => {
                      const isActive = i === selectedSceneIndex;
                      const duration = getSceneDuration(i);

                      return (
                        <div
                          key={scene.id}
                          onClick={() => setSelectedSceneIndex(i)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                            isActive
                              ? 'bg-[#66FF99]/5 border-[#66FF99]/30 shadow-[0_0_15px_rgba(102,255,153,0.02)]'
                              : 'bg-black/40 border-white/5 hover:border-white/15'
                          }`}
                        >
                          {/* Top Tag info */}
                          <div className="flex justify-between items-center mb-1.5 text-[10px] font-mono">
                            <span className={`font-bold ${isActive ? 'text-[#66FF99]' : 'text-gray-500'}`}>
                              SCENE {scene.sceneNumber}
                            </span>
                            <span className="text-gray-650 flex items-center gap-1 uppercase">
                              <Clock className="w-3 h-3 text-[#4DA6FF]" />
                              {duration}s
                            </span>
                          </div>

                          <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                            {scene.narration}
                          </p>
                          
                          {isActive && (
                            <div className="absolute left-0 top-0 h-full w-[2px] bg-[#66FF99]" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Active Scene Card Inspector Fields (Right on right panel) */}
                  <div className="md:col-span-8 bg-[#0B0B0B] border border-white/5 rounded-3xl p-5.5 space-y-4 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-white/10 text-xs">
                    
                    {/* Scene Meta Indicator */}
                    <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-[#66FF99]/15 border border-[#66FF99]/30 text-[#66FF99] font-mono text-[10px] font-bold">
                          SCENE {activeScene.sceneNumber}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500">
                          ID: {activeScene.id.substring(0, 10)}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Duration: {getSceneDuration(selectedSceneIndex)}s
                      </div>
                    </div>

                    {/* Character Assign & Product Assign */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block flex items-center gap-1">
                          <User className="w-3 h-3 text-[#66FF99]" />
                          {lang === 'en' ? 'Character Assignment' : 'Nhân vật được giao'}
                        </label>
                        <input
                          type="text"
                          value={activeScene.id.includes('manual') && !activeScene.imagePrompt.includes('CHAR:') ? 'Main character' : 'Step 1 Core Character Lock'}
                          disabled
                          className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg text-[10px] text-[#66FF99] font-mono cursor-not-allowed font-semibold opacity-85"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block flex items-center gap-1">
                          <Package className="w-3 h-3 text-[#66FF99]" />
                          {lang === 'en' ? 'Product Assignment' : 'Sản phẩm gán'}
                        </label>
                        <input
                          type="text"
                          value="Step 1 Brand Product Lock"
                          disabled
                          className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg text-[10px] text-[#66FF99] font-mono cursor-not-allowed font-semibold opacity-85"
                        />
                      </div>
                    </div>

                    {/* Dialogue & Narration */}
                    <div className="space-y-3.5">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                          <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                          {lang === 'en' ? 'Narration / Voiceover Copy' : 'Giọng thoại / Thuyết minh nói'}
                        </label>
                        <textarea
                          value={activeScene.narration}
                          onChange={(e) => handleUpdateSceneField(selectedSceneIndex, 'narration', e.target.value)}
                          rows={2.5}
                          className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-[10.5px] text-white focus:border-[#66FF99]/40 outline-none resize-none font-sans leading-relaxed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                          <Video className="w-3.5 h-3.5 text-[#4DA6FF]" />
                          {lang === 'en' ? 'Visual Choreography / Character Action' : 'Hành động nhân vật & Chuyển động'}
                        </label>
                        <textarea
                          value={activeScene.action}
                          onChange={(e) => handleUpdateSceneField(selectedSceneIndex, 'action', e.target.value)}
                          rows={2.5}
                          className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-[10.5px] text-white focus:border-[#66FF99]/40 outline-none resize-none font-sans leading-relaxed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-yellow-500" />
                          {lang === 'en' ? 'Refractive Styling / Lens Camera Focus' : 'Chi tiết ống kính & Góc phản chiếu'}
                        </label>
                        <textarea
                          value={activeScene.visualDirection}
                          onChange={(e) => handleUpdateSceneField(selectedSceneIndex, 'visualDirection', e.target.value)}
                          rows={2}
                          className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-[10.5px] text-white focus:border-[#66FF99]/40 outline-none resize-none font-sans leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Promo strategy status block */}
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl grid grid-cols-2 gap-3 text-[9px] text-gray-500 font-mono">
                      <div>
                        <span>🎯 HOOK STRATEGY:</span>{' '}
                        <span className="text-white">
                          {selectedSceneIndex === 0 ? project.directorInsight?.hookStrategy || hookStyle : 'Structural Build'}
                        </span>
                      </div>
                      <div>
                        <span>🚀 CONVERSION CTA:</span>{' '}
                        <span className="text-white">
                          {selectedSceneIndex === activeScenes.length - 1 ? ctaStyle : 'Flow continuation'}
                        </span>
                      </div>
                    </div>

                    {/* Integrated Prompt Inspector Preview */}
                    <div className="p-3 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-xl text-[9px] font-mono text-gray-500 space-y-1">
                      <div className="text-indigo-400 font-bold block flex items-center gap-1 uppercase">
                        <Zap className="w-3 h-3 text-indigo-400" />
                        Real-time Injected Prompt Preview (Visual Engine Lock)
                      </div>
                      <p className="text-gray-400 leading-normal line-clamp-3 italic">
                        {activeScene.imagePrompt}
                      </p>
                    </div>

                  </div>
                </div>

                {/* ==================================================== */}
                {/* SCENE TIMELINE TRACKBAR                              */}
                {/* ==================================================== */}
                <div className="p-4.5 bg-[#0B0B0B] border border-white/5 rounded-2xl space-y-2 shrink-0">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-gray-400 uppercase font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#66FF99]" />
                      {lang === 'en' ? 'SCENE TIMELINE TRACK' : 'SƠ ĐỒ TRỤC THỜI GIAN VIDEO'}
                    </span>
                    <span className="text-white">
                      {lang === 'en' ? 'TOTAL:' : 'TỔNG CỘNG:'} <strong className="text-[#66FF99] font-black">{totalDurationSum}s</strong>
                    </span>
                  </div>

                  {/* Horizontal timeline blocks bar */}
                  <div className="flex h-5 bg-black/50 border border-white/5 rounded-lg overflow-hidden gap-[2px]">
                    {activeScenes.map((sc, scIdx) => {
                      const dur = getSceneDuration(scIdx);
                      // percentage representation
                      const percentWidth = (dur / totalDurationSum) * 100;
                      const isSelected = scIdx === selectedSceneIndex;

                      return (
                        <div
                          key={sc.id}
                          onClick={() => setSelectedSceneIndex(scIdx)}
                          style={{ width: `${percentWidth}%` }}
                          className={`h-full text-[9px] font-mono font-bold flex items-center justify-center cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#66FF99]/20 text-[#66FF99] border-y border-x border-[#66FF99]/40'
                              : 'bg-white/[0.04] text-gray-500 hover:bg-white/[0.08] hover:text-white'
                          }`}
                          title={`Scene ${sc.sceneNumber} (${dur}s)`}
                        >
                          S{sc.sceneNumber}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-12 h-full rounded-3xl bg-[#0B0B0B] border border-white/5 flex flex-col items-center justify-center text-center space-y-4 select-none min-h-[450px]" id="no_playbook_display">
                <div className="p-4 bg-white/[0.02] rounded-full border border-white/5">
                  <BookOpen className="w-8 h-8 text-gray-500 animate-pulse" />
                </div>
                <h3 className="text-sm font-mono text-gray-300 uppercase tracking-widest">{t('noPlaybookYet')}</h3>
                <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                  {lang === 'en' 
                    ? 'No script cards compiled yet. Choose an AI prompt strategy or dán kịch bản raw on the left side to compile scene blocks!' 
                    : 'Chưa biên soạn kịch bản. Vui lòng thiết lập ý tưởng AI hoặc dán văn bản thô bên cột trái để hệ thống tách phân cảnh!'}
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {loading && (
        <div className="p-12 text-center max-w-md mx-auto space-y-6 my-10 rounded-2xl bg-[#0D0D0D]/60 border border-white/5 shadow-md">
          <div className="inline-block relative">
            <div className="w-16 h-16 rounded-full border-t-2 border-[#4DA6FF] animate-spin" />
            <Sparkles className="w-5 h-5 absolute inset-0 m-auto text-[#4DA6FF] animate-pulse" />
          </div>
          <p className="text-xs font-mono tracking-widest text-[#4DA6FF] uppercase">{t('compilingSceneStructures')}</p>
          <div className="p-4 bg-[#050505] rounded-xl border border-white/5 text-[10px] text-left text-gray-550 font-mono space-y-1">
            <div>&gt; Loading Steps DNA constants...</div>
            <div>&gt; Analysing Audience Strategy and marketing angle...</div>
            <div className="text-[#66FF99]">&gt; Injecting locks to Scene cards structure...</div>
          </div>
        </div>
      )}

    </div>
  );
}
