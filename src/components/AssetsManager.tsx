import React, { useRef, useState, useEffect } from 'react';
import { Project, ProjectAssets, DNAModuleItem, DNAStructure, normalizeAssets } from '../types';
import { Upload, Smile, ShoppingBag, Map, Image as ImageIcon, RefreshCw, CheckCircle2, ChevronRight, Cpu, Trash2, AlertTriangle, Plus, X } from 'lucide-react';
import { useLanguage } from '../utils/i18n';
import { useBackgroundQueue } from '../context/BackgroundQueueContext';

interface AssetsManagerProps {
  project: Project;
  onUpdateAssets: (newAssets: ProjectAssets) => void;
  onAdvanceStep: () => void;
  onAssetsAnalyzed: () => void;
}

export default function AssetsManager({ project, onUpdateAssets, onAdvanceStep, onAssetsAnalyzed }: AssetsManagerProps) {
  const { lang, t } = useLanguage();
  const { jobs, triggerAssetAnalysis } = useBackgroundQueue();
  
  // Always work with normalized assets to avoid structure issues
  const assets = normalizeAssets(project.assets);

  // States connected to Background Job Manager
  const activeJob = jobs.find(j => j.type === 'asset_analysis' && (j.status === 'running' || j.status === 'pending'));
  const isAnalyzing = !!activeJob;
  const loadingStep = activeJob ? Math.min(4, Math.floor(activeJob.progress / 25)) : 0;
  const [analysisCompleted, setAnalysisCompleted] = useState(!!project.assetsAnalyzed);

  // Sync state on change
  useEffect(() => {
    setAnalysisCompleted(!!project.assetsAnalyzed);
  }, [project.assetsAnalyzed]);

  // Handle textual prompt brief updates
  const handlePromptChange = (key: keyof ProjectAssets, prompt: string) => {
    const updated = {
      ...assets,
      [key]: {
        ...assets[key],
        prompt,
      },
    };
    onUpdateAssets(updated);
  };

  // Handle uploading a new image to any category
  const handleAddNewImage = (key: keyof ProjectAssets, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      
      const newImgItem: DNAModuleItem = {
        id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name.split('.')[0] || 'Reference Photo',
        fileName: file.name,
        imageBase64: b64,
      };

      const revisedStructure: DNAStructure = {
        ...assets[key],
        items: [...(assets[key].items || []), newImgItem],
      };

      onUpdateAssets({
        ...assets,
        [key]: revisedStructure,
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle deleting an image from a category list
  const handleDeleteImage = (key: keyof ProjectAssets, itemId: string) => {
    const updatedItems = (assets[key].items || []).filter(item => item.id !== itemId);
    onUpdateAssets({
      ...assets,
      [key]: {
        ...assets[key],
        items: updatedItems,
      },
    });
  };

  // Trigger analysis pipeline
  const startAnalysisChain = () => {
    triggerAssetAnalysis(assets);
  };

  useEffect(() => {
    if (project.assetsAnalyzed && !analysisCompleted) {
      setAnalysisCompleted(true);
      onAssetsAnalyzed();
    }
  }, [project.assetsAnalyzed]);

  // Unified confidence score algorithm
  const getConfidenceMetrics = (key: keyof ProjectAssets, structure: DNAStructure) => {
    const hasText = !!structure.prompt?.trim();
    const count = structure.items?.length || 0;
    
    if (count === 0 && !hasText) {
      return {
        score: 0,
        label: lang === 'en' ? 'Fallback Active' : 'AI Fallback Tự Động',
        colorClass: 'text-amber-500 border-amber-500/10 bg-amber-500/5',
        barColor: 'bg-amber-500',
        warning: lang === 'en'
          ? 'No references provided. AI Director will synthesize baseline parameters automatically.'
          : 'Chưa cung cấp thông tin. Hệ thống AI sẽ tự động tạo thông số nền mẫu phù hợp.'
      };
    }

    if (key === 'character') {
      const recText = lang === 'en' ? 'Recommended: 1-5 images' : 'Khuyến nghị: 1-5 hình ảnh';
      if (count > 0 && hasText) {
        return {
          score: 95,
          label: lang === 'en' ? 'Ideal (Hybrid)' : 'Lý Tưởng (Phối Hợp)',
          colorClass: 'text-[#66FF99] border-[#66FF99]/20 bg-[#66FF99]/5',
          barColor: 'bg-[#66FF99]',
          hint: `${count} image(s) • ${recText}`
        };
      }
      if (count > 0) {
        return {
          score: 85,
          label: lang === 'en' ? 'Strong (Uploads)' : 'Tốt (Cung Cấp Ảnh)',
          colorClass: 'text-emerald-400 border-emerald-500/15 bg-emerald-500/5',
          barColor: 'bg-emerald-400',
          warning: lang === 'en' ? 'No text description entered. Type a small text brief to enrich physical characteristics.' : 'Chưa có mô tả chữ. Hãy mô tả chi tiết nhân vật để đồng bộ ngoại hình tốt nhất.',
          hint: `${count} image(s) • ${recText}`
        };
      }
      return {
        score: 75,
        label: lang === 'en' ? 'Stable (Text-only)' : 'Ổn Định (Chỉ Dùng Chữ)',
        colorClass: 'text-sky-400 border-sky-500/15 bg-sky-500/5',
        barColor: 'bg-sky-400',
        warning: lang === 'en' ? 'No character photos uploaded. Consider uploading reference faces/clothing.' : 'Chưa tải ảnh nhân vật. Khuyến nghị upload 1-5 ảnh để khóa đồng nhất khuôn mặt.',
        hint: recText
      };
    }

    if (key === 'product') {
      const recText = lang === 'en' ? 'Recommended: 1-3 images' : 'Khuyến nghị: 1-3 hình ảnh';
      if (count > 0 && hasText) {
        return {
          score: 88,
          label: lang === 'en' ? 'Ideal (Hybrid)' : 'Lý Tưởng (Phối Hợp)',
          colorClass: 'text-[#66FF99] border-[#66FF99]/20 bg-[#66FF99]/5',
          barColor: 'bg-[#66FF99]',
          hint: `${count} image(s) • ${recText}`
        };
      }
      if (count > 0) {
        return {
          score: 80,
          label: lang === 'en' ? 'Strong (Uploads)' : 'Tốt (Cung Cấp Ảnh)',
          colorClass: 'text-emerald-400 border-emerald-500/15 bg-emerald-500/5',
          barColor: 'bg-emerald-400',
          warning: lang === 'en' ? 'No product brief details. Add branding text or packaging material info.' : 'Thiếu mô tả chữ về nhãn hiệu hoặc chất liệu sản phẩm.',
          hint: `${count} image(s) • ${recText}`
        };
      }
      return {
        score: 70,
        label: lang === 'en' ? 'Stable (Text-only)' : 'Ổn Định (Chỉ Dùng Chữ)',
        colorClass: 'text-sky-400 border-sky-500/15 bg-sky-500/5',
        barColor: 'bg-sky-400',
        warning: lang === 'en' ? 'No product packaging references uploaded.' : 'Chưa tải ảnh sản phẩm thực tế. Khuyến nghị upload 1-3 ảnh.',
        hint: recText
      };
    }

    if (key === 'background') {
      const targetCount = project.sceneCount || 6;
      const recText = lang === 'en' ? `Recommended: matches scene count (${targetCount} images)` : `Khuyến nghị: khớp số lượng phân cảnh (${targetCount} ảnh)`;
      if (count > 0 && hasText) {
        return {
          score: 72,
          label: lang === 'en' ? 'Ideal (Hybrid)' : 'Lý Tưởng (Phối Hợp)',
          colorClass: 'text-[#66FF99] border-[#66FF99]/20 bg-[#66FF99]/5',
          barColor: 'bg-[#66FF99]',
          hint: `${count}/${targetCount} image(s) • ${recText}`
        };
      }
      if (count > 0) {
        return {
          score: 65,
          label: lang === 'en' ? 'Strong (Uploads)' : 'Tốt (Cung Cấp Ảnh)',
          colorClass: 'text-emerald-400 border-emerald-500/15 bg-emerald-500/5',
          barColor: 'bg-emerald-400',
          warning: lang === 'en' ? 'No environmental ambient details. Add text describing lighting or architectural features.' : 'Thiếu mô tả bối cảnh. Nhập thêm thông tin để tối ưu hóa ánh sáng.',
          hint: `${count}/${targetCount} image(s) • ${recText}`
        };
      }
      return {
        score: 55,
        label: lang === 'en' ? 'Stable (Text-only)' : 'Ổn Định (Chỉ Dùng Chữ)',
        colorClass: 'text-sky-400 border-sky-500/15 bg-sky-500/5',
        barColor: 'bg-sky-400',
        warning: lang === 'en' ? 'No layout background visuals. Standard AI scenes set as baseline.' : 'Chưa đăng ảnh bối cảnh mẫu. Không gian mẫu sẽ dùng cài đặt AI chuẩn.',
        hint: recText
      };
    }

    if (key === 'style') {
      const recText = lang === 'en' ? 'Recommended: 1 image (Optional)' : 'Khuyến nghị: 1 hình ảnh (Không bắt buộc)';
      if (count > 0 && hasText) {
        return {
          score: 60,
          label: lang === 'en' ? 'Ideal (Hybrid)' : 'Lý Tưởng (Phối Hợp)',
          colorClass: 'text-[#66FF99] border-[#66FF99]/20 bg-[#66FF99]/5',
          barColor: 'bg-[#66FF99]',
          hint: `${count} image(s) • ${recText}`
        };
      }
      if (count > 0) {
        return {
          score: 55,
          label: lang === 'en' ? 'Strong (Uploads)' : 'Tốt (Cung Cấp Ảnh)',
          colorClass: 'text-emerald-400 border-emerald-500/15 bg-emerald-500/5',
          barColor: 'bg-emerald-400',
          hint: `${count} image(s) • ${recText}`
        };
      }
      return {
        score: 45,
        label: lang === 'en' ? 'Stable (Text)' : 'Ổn Định (Sử Dụng Mô Tả)',
        colorClass: 'text-sky-400 border-sky-500/15 bg-sky-500/5',
        barColor: 'bg-sky-400',
        hint: recText
      };
    }

    return {
      score: 50,
      label: 'Configured',
      colorClass: 'text-gray-400 border-white/5 bg-white/[0.01]',
      barColor: 'bg-gray-400'
    };
  };

  // Workflow validation logic - User can continue if AT LEAST ONE model has prompt or item!
  const isConfigured = 
    (assets.character.prompt?.trim() || assets.character.items?.length > 0) ||
    (assets.product.prompt?.trim() || assets.product.items?.length > 0) ||
    (assets.background.prompt?.trim() || assets.background.items?.length > 0) ||
    (assets.style.prompt?.trim() || assets.style.items?.length > 0);

  const getLoadingPhrase = () => {
    switch (loadingStep) {
      case 0: return t('statesScanningVb') || 'Extracting parameters...';
      case 1: return t('statesChromExt') || 'Decoupling chromatic balances...';
      case 2: return `${t('statesLockChar') || 'Locking Character anchors'} ...`;
      case 3: return `${t('statesLockProd') || 'Locking Product layout contours'} ...`;
      default: return t('safeInjectedChrome') || 'Constructing consistent DNA frames...';
    }
  };

  const renderCategoryCard = (
    key: keyof ProjectAssets,
    label: string,
    placeholder: string,
    icon: React.ReactNode
  ) => {
    const structure = assets[key];
    const metrics = getConfidenceMetrics(key, structure);
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
      <div 
        className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/5 transition-all hover:bg-white/[0.01] flex flex-col justify-between space-y-5 shadow-[0_4px_25px_rgba(0,0,0,0.5)]" 
        id={`asset_field_${key}`}
      >
        <div className="space-y-4">
          {/* Header Title & Icon */}
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5 text-white font-display font-semibold text-sm">
              <span className="text-[#64FFAD]">{icon}</span>
              <span className="uppercase tracking-wider text-xs font-bold">{label}</span>
            </div>
            
            <div className={`px-2.5 py-1 rounded-full border text-[10px] font-mono font-black ${metrics.colorClass} select-none`}>
              {metrics.label} {metrics.score > 0 ? `(${metrics.score}%)` : ''}
            </div>
          </div>

          {/* DNA Confidence Indicator */}
          {metrics.score > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] font-mono text-gray-500 font-bold uppercase select-none">
                <span>DNA Confidence Score</span>
                <span className="text-gray-300">{metrics.score}%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${metrics.barColor}`}
                  style={{ width: `${metrics.score}%` }}
                />
              </div>
              {metrics.hint && (
                <div className="text-[9px] font-mono text-[#66FF99]/70 tracking-widest uppercase">
                  {metrics.hint}
                </div>
              )}
            </div>
          )}

          {/* Warning Banner */}
          {metrics.warning && (
            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-2.5 text-amber-500 text-[10.5px] leading-snug">
              <AlertTriangle className="w-4 h-4 shrink-0 stroke-[2] mt-0.5 text-amber-400" />
              <span>{metrics.warning}</span>
            </div>
          )}

          {/* 1. TEXT BRIEF INPUT */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-wider text-gray-500 uppercase font-black select-none">
              {lang === 'en' ? 'Prompt Brief' : 'Mô Tả Bằng Chữ'}
            </label>
            <textarea
              value={structure.prompt || ''}
              onChange={(e) => handlePromptChange(key, e.target.value)}
              placeholder={placeholder}
              disabled={analysisCompleted}
              rows={3}
              className="w-full p-3.5 bg-black/40 border border-white/5 rounded-2xl text-[11.5px] text-white placeholder-gray-600 focus:border-[#66FF99]/40 outline-none resize-none focus:bg-black/70 transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* 2. MULTI-IMAGE UPLOADER */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono tracking-wider text-gray-500 uppercase font-black select-none flex justify-between items-center">
              <span>{lang === 'en' ? 'Reference Images' : 'Ảnh Tham Khảo'}</span>
              <span className="text-[9px] lowercase text-[#66FF99] font-medium">{lang === 'en' ? 'unlimited' : 'không giới hạn'}</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              disabled={analysisCompleted}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleAddNewImage(key, file);
                  e.target.value = ''; // Reset input
                }
              }}
              className="hidden"
            />

            {/* Grid of uploaded images */}
            {structure.items && structure.items.length > 0 ? (
              <div className="grid grid-cols-2 xs:grid-cols-3 gap-2.5">
                {structure.items.map((item) => (
                  <div 
                    key={item.id} 
                    className="relative group rounded-xl overflow-hidden aspect-[16/10] bg-black/50 border border-white/5 shadow-md"
                  >
                    {item.imageBase64 && (
                      <img 
                        src={item.imageBase64} 
                        alt={item.name} 
                        className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    
                    {/* Dark overlay with inline actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 gap-1.5">
                      <p className="text-[8px] font-mono text-gray-300 truncate w-full select-none mb-auto">
                        {item.name || 'Photo reference'}
                      </p>
                      
                      {!analysisCompleted && (
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(key, item.id)}
                          className="w-full py-1 text-[9px] font-mono font-bold bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/20 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          <span>{lang === 'en' ? 'Remove' : 'Xóa'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Visual Trigger - Add more images */}
                {!analysisCompleted && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[16/10] border border-dashed border-white/10 hover:border-[#66FF99]/40 rounded-xl bg-white/[0.01] hover:bg-[#66FF99]/5 transition-all flex flex-col items-center justify-center text-gray-500 hover:text-[#66FF99] gap-1 cursor-pointer group"
                  >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] font-mono font-black uppercase tracking-widest">{lang === 'en' ? 'Add photo' : 'Thêm ảnh'}</span>
                  </button>
                )}
              </div>
            ) : (
              /* Upload Placeholder when empty */
              <button
                type="button"
                onClick={() => !analysisCompleted && fileInputRef.current?.click()}
                disabled={analysisCompleted}
                className={`w-full aspect-[16/8] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 bg-black/25 text-gray-500 hover:text-white hover:border-[#66FF99]/30 transition-all group ${analysisCompleted ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}`}
              >
                <Upload className="w-5 h-5 stroke-[1.5] group-hover:scale-110 transition-transform text-gray-500 group-hover:text-[#66FF99]" />
                <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 group-hover:text-[#66FF99]/90 font-bold">
                  {lang === 'en' ? 'Upload References' : 'Tải Lên File Ảnh'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in" id="assets_manager_box">
      {/* Header and Control section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-xl font-display font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{t('brandAssetsTitle') || 'Brand Assets'}</span>
            <span className="text-[10px] bg-[#66FF99]/10 text-[#66FF99] px-2.5 py-0.5 rounded-full font-mono uppercase font-black font-semibold">Flexible Mode</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {lang === 'en' 
              ? 'Provide characters, products, custom backgrounds and styles. Populate what you have, the AI automatically covers any empty fields.'
              : 'Cung cấp nhân vật, sản phẩm, phông nền hoặc phong cách thiết kế của chiến dịch. Điền những mục bạn có, AI tự động hoàn thiện phục vụ phân tích.'}
          </p>
        </div>
        
        {!analysisCompleted && (
          <button
            onClick={startAnalysisChain}
            disabled={!isConfigured || isAnalyzing}
            className={`px-6 py-3 rounded-full text-xs font-mono font-bold tracking-widest uppercase transition-all flex items-center gap-2 ${
              isConfigured && !isAnalyzing
                ? 'bg-[#66FF99] text-black hover:scale-102 hover:shadow-[0_0_20px_rgba(102,255,153,0.3)] cursor-pointer'
                : 'bg-white/5 text-gray-600 cursor-not-allowed'
            }`}
            id="btn_trigger_asset_analysis"
          >
            {isAnalyzing ? t('extractingDna') || 'Locking DNA...' : t('analyzeAssetsBtn') || 'Analyze Assets'} <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Cinematic Neural Loader Phase */}
      {isAnalyzing && (
        <div className="p-8 rounded-3xl bg-black/40 border border-[#66FF99]/25 flex flex-col items-center justify-center space-y-4 shadow-[0_0_40px_rgba(102,255,153,0.08)]">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-[#66FF99] animate-spin" />
            <span className="text-sm font-mono text-white tracking-widest uppercase">{t('dnaChecklistHeader') || 'Brand Scanning...'}</span>
          </div>
          <p className="text-xs font-mono text-gray-400 bg-black/60 px-4 py-2.5 rounded-lg border border-white/5 text-center max-w-lg">
            {getLoadingPhrase()}
          </p>
          <div className="w-full max-w-sm bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#66FF99] h-full transition-all duration-[1200ms] ease-out shadow-[0_0_10px_#66FF99]"
              style={{ width: `${((loadingStep + 1) / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Inputs (Asset list cards) */}
      {!isAnalyzing && !analysisCompleted && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderCategoryCard(
            'character',
            t('charUpload') || 'Character Definition',
            t('charPlaceholder') || 'E.g., Young dynamic professional wearing elegant minimalist clothing...',
            <Smile className="w-4 h-4" />
          )}

          {renderCategoryCard(
            'product',
            t('prodUpload') || 'Product Definition',
            t('prodPlaceholder') || 'E.g., Frosted glass serum bottle with reflective light gold fluid contour...',
            <ShoppingBag className="w-4 h-4" />
          )}

          {renderCategoryCard(
            'background',
            t('bgUpload') || 'Background Environment',
            t('bgPlaceholder') || 'E.g., Modern concrete showroom style, with soft shadows and hazy illumination...',
            <Map className="w-4 h-4" />
          )}

          {renderCategoryCard(
            'style',
            t('styleUpload') || 'Style References',
            t('stylePlaceholder') || 'E.g., Clean Apple-style commercial lighting with macro detailing and high contrast...',
            <ImageIcon className="w-4 h-4" />
          )}
        </div>
      )}

      {/* Extracted DNA Locks checklist once analysis completes */}
      {analysisCompleted && !isAnalyzing && (
        <div className="p-8 rounded-3xl bg-[#0D0D0D]/60 border border-[#66FF99]/15 space-y-6 flex flex-col items-center justify-center text-center shadow-[0_0_40px_rgba(102,255,153,0.03)]" id="extracted_dna_success_panel">
          <CheckCircle2 className="w-16 h-16 text-[#66FF99] drop-shadow-[0_0_15px_rgba(102,255,153,0.2)] animate-pulse" />
          
          <div className="space-y-2">
            <h3 className="text-lg font-display font-extrabold text-white uppercase tracking-tight">{t('dnaChecklistHeader') || 'Brand DNA Complete!'}</h3>
            <p className="text-xs text-gray-400 max-w-md">{t('dnaChecklistSub') || 'Consistent DNA anchors and falling back schemas compiled.'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl font-mono text-xs text-left pt-2">
            <div className="p-4 bg-[#050505] rounded-xl border border-white/5 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              <span className="text-gray-400">CHARACTER DNA</span>
              <span className="text-[#66FF99] font-black flex items-center gap-1.5">[ ✓ {t('charDnaExtracted') || 'Locked'} ]</span>
            </div>
            
            <div className="p-4 bg-[#050505] rounded-xl border border-white/5 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              <span className="text-gray-400">PRODUCT DNA</span>
              <span className="text-[#66FF99] font-black flex items-center gap-1.5">[ ✓ {t('prodDnaExtracted') || 'Locked'} ]</span>
            </div>

            <div className="p-4 bg-[#050505] rounded-xl border border-white/5 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              <span className="text-gray-400">BACKGROUND DNA</span>
              <span className="text-[#66FF99] font-black flex items-center gap-1.5">[ ✓ {t('bgDnaExtracted') || 'Locked'} ]</span>
            </div>

            <div className="p-4 bg-[#050505] rounded-xl border border-white/5 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              <span className="text-gray-400">STYLE DNA</span>
              <span className="text-[#66FF99] font-black flex items-center gap-1.5">[ ✓ {t('styleDnaExtracted') || 'Locked'} ]</span>
            </div>
          </div>

          <button
            onClick={onAdvanceStep}
            className="mt-4 px-8 py-3.5 rounded-full bg-[#66FF99] font-mono text-xs text-black font-extrabold uppercase tracking-widest transition-all hover:scale-105 hover:bg-[#66FF99]/90 flex items-center gap-2 shadow-[0_0_20px_rgba(102,255,153,0.3)] cursor-pointer"
          >
            {t('continueToDirector') || 'Continue to AI Director'} <ChevronRight className="w-4 h-4 text-black" />
          </button>
        </div>
      )}

      {!isConfigured && !analysisCompleted && (
        <div className="p-4 rounded-xl border border-dashed border-white/5 bg-white/[0.01] text-xs text-gray-500 text-center font-mono select-none">
          {t('missingAssetsAlert') || 'Please provide at least one asset prompt or reference image to unlock consistency analysis.'}
        </div>
      )}
    </div>
  );
}
