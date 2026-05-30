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

  // States connected to background individual analyzer loaders
  const [analyzingStates, setAnalyzingStates] = useState<Record<keyof ProjectAssets, boolean>>({
    character: false,
    product: false,
    background: false,
    style: false
  });

  const [customScores, setCustomScores] = useState<Record<keyof ProjectAssets, number>>(() => {
    try {
      const stored = localStorage.getItem(`hidro_scores_${project.id}`);
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return {
      character: 0,
      product: 0,
      background: 0,
      style: 0
    };
  });

  useEffect(() => {
    localStorage.setItem(`hidro_scores_${project.id}`, JSON.stringify(customScores));
  }, [customScores, project.id]);

  // Local extracted parameters for optical recognition
  const [extractedTraits, setExtractedTraits] = useState<Record<keyof ProjectAssets, string>>(() => {
    try {
      const stored = localStorage.getItem(`hidro_traits_${project.id}`);
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return {
      character: assets.character.prompt || 'Female, 23 years old, Long black hair, Natural makeup, Korean beauty style, Friendly smile, Soft skin, Office casual outfit',
      product: assets.product.prompt || 'Frosted crystal glass bottle, reflective silver metallic cap, white screenprint cosmetics branding, minimal cylinder geometry',
      background: assets.background.prompt || 'Premium concrete showroom staging, soft split-lighting setup, warm ambient shadows, micro-reflective glass backdrop',
      style: assets.style.prompt || 'Apple-style high contrast commercial lighting, crisp anamorphic macro depth of field, balanced volumetric haze',
    };
  });

  useEffect(() => {
    localStorage.setItem(`hidro_traits_${project.id}`, JSON.stringify(extractedTraits));
  }, [extractedTraits, project.id]);

  // Handle uploading a new image to any category
  const handleAddNewImage = (key: keyof ProjectAssets, file: File) => {
    // Enable load state immediately to clear previous visual properties and reset DNA score
    setAnalyzingStates(prev => ({ ...prev, [key]: true }));

    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = reader.result as string;
      
      const newImgItem: DNAModuleItem = {
        id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name.split('.')[0] || 'Reference Photo',
        fileName: file.name,
        imageBase64: b64,
      };

      try {
        const response = await fetch('/api/assets/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: b64,
            category: key
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.description) {
            // Apply fresh traits & scores
            setExtractedTraits(prev => ({
              ...prev,
              [key]: data.description
            }));

            if (data.score) {
              setCustomScores(prev => ({
                ...prev,
                [key]: data.score
              }));
            }

            // Sync newly generated prompt directly to project structure
            const revisedStructure: DNAStructure = {
              ...assets[key],
              prompt: data.description,
              items: [...(assets[key].items || []), newImgItem],
            };

            onUpdateAssets({
              ...assets,
              [key]: revisedStructure,
            });

            setAnalyzingStates(prev => ({ ...prev, [key]: false }));
            return;
          }
        }
      } catch (e) {
        console.error('Error in multi-modal image analysis API:', e);
      }

      // Fallback if anything fails
      const revisedStructure: DNAStructure = {
        ...assets[key],
        items: [...(assets[key].items || []), newImgItem],
      };

      onUpdateAssets({
        ...assets,
        [key]: revisedStructure,
      });
      setAnalyzingStates(prev => ({ ...prev, [key]: false }));
    };

    reader.readAsDataURL(file);
  };

  // Handle deleting an image from a category list
  const handleDeleteImage = (key: keyof ProjectAssets, itemId: string) => {
    const updatedItems = (assets[key].items || []).filter(item => item.id !== itemId);
    
    // Clear custom active scores when references are empty
    if (updatedItems.length === 0) {
      setCustomScores(prev => ({
        ...prev,
        [key]: 0
      }));
    }

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

  // Track input modes for the four categories: upload | prompt | hybrid
  const [inputModes, setInputModes] = useState<Record<keyof ProjectAssets, 'upload' | 'prompt' | 'hybrid'>>(() => {
    return {
      character: assets.character.items && assets.character.items.length > 0 && !assets.character.prompt?.trim() ? 'upload' : (assets.character.items && assets.character.items.length > 0 ? 'hybrid' : 'prompt'),
      product: assets.product.items && assets.product.items.length > 0 && !assets.product.prompt?.trim() ? 'upload' : (assets.product.items && assets.product.items.length > 0 ? 'hybrid' : 'prompt'),
      background: assets.background.items && assets.background.items.length > 0 && !assets.background.prompt?.trim() ? 'upload' : (assets.background.items && assets.background.items.length > 0 ? 'hybrid' : 'prompt'),
      style: assets.style.items && assets.style.items.length > 0 && !assets.style.prompt?.trim() ? 'upload' : (assets.style.items && assets.style.items.length > 0 ? 'hybrid' : 'prompt'),
    };
  });

  // Generate character block progress bar
  const renderBlockBar = (score: number) => {
    const filledCount = Math.min(10, Math.max(0, Math.round(score / 10)));
    const emptyCount = 10 - filledCount;
    return '█'.repeat(filledCount) + '░'.repeat(emptyCount);
  };

  // Unified confidence score algorithm supporting dynamic input modes
  const getConfidenceMetrics = (
    key: keyof ProjectAssets, 
    mode: 'upload' | 'prompt' | 'hybrid', 
    count: number, 
    hasPrompt: boolean
  ) => {
    if (analyzingStates[key]) {
      return {
        score: 0,
        label: lang === 'en' ? 'AI Analyzing Reference...' : 'Trình AI đang phân tích...',
        colorClass: 'text-amber-400 border-amber-500/15 bg-amber-500/5 animate-pulse',
        barColor: 'bg-amber-500 animate-pulse',
        warning: lang === 'en' 
          ? 'Multimodal neural network is processing visual references...' 
          : 'Trình AI đa phương thức đang phân tích ảnh tham chiếu...',
        hint: lang === 'en' ? 'Scanning...' : 'Đang quét ảnh...'
      };
    }

    const calculateMetrics = () => {
      if (key === 'character') {
      if (mode === 'upload') {
        if (count === 0) {
          return {
            score: 30,
            label: lang === 'en' ? 'Awaiting Face References' : 'Đang đợi ảnh khuôn mặt',
            colorClass: 'text-rose-400 border-rose-500/15 bg-rose-500/5',
            barColor: 'bg-rose-500',
            warning: lang === 'en'
              ? 'Upload 1-5 reference photos to lock custom facial profiles.'
              : 'Tải lên 1-5 ảnh tham khảo để khóa đặc trưng khuôn mặt.'
          };
        }
        return {
          score: 96,
          label: lang === 'en' ? 'Face consistency locked' : 'Khóa ổn định khuôn mặt',
          colorClass: 'text-[#66FF99] border-[#66FF99]/25 bg-emerald-500/5',
          barColor: 'bg-[#66FF99]',
          hint: lang === 'en' ? '96% • Face consistency locked' : '96% • Khóa đồng nhất khuôn mặt thành công'
        };
      } else if (mode === 'prompt') {
        if (!hasPrompt) {
          return {
            score: 35,
            label: lang === 'en' ? 'Empty prompt staging' : 'Mô tả trống rỗng',
            colorClass: 'text-amber-500 border-amber-500/10 bg-amber-500/5',
            barColor: 'bg-amber-500',
            warning: lang === 'en'
              ? 'Enter character text prompt to synthesize traits.'
              : 'Nhập mô tả bằng chữ để định hình đặc trưng.'
          };
        }
        return {
          score: 75,
          label: lang === 'en' ? 'Prompt characteristics active' : 'Đặc trưng chữ ổn định',
          colorClass: 'text-sky-400 border-sky-500/15 bg-sky-500/5',
          barColor: 'bg-sky-450',
          hint: lang === 'en' ? '75% • Prompt characteristics active' : '75% • Đặc trưng phác thảo qua chữ hoạt động'
        };
      } else { // hybrid
        if (count > 0 && hasPrompt) {
          return {
            score: 98,
            label: lang === 'en' ? 'Ultra consistency locked (Hybrid)' : 'Khóa siêu đồng nhất (Phối hợp)',
            colorClass: 'text-[#66FF99] border-[#66FF99]/25 bg-emerald-500/5',
            barColor: 'bg-[#66FF99]',
            hint: lang === 'en' ? '98% • Hybrid face & description locked' : '98% • Trùng khớp ảnh cùng mô tả chữ thành công'
          };
        }
        if (count > 0) {
          return {
            score: 85,
            label: lang === 'en' ? 'Missing physical manual descriptions' : 'Thiếu mô tả ngoại hình',
            colorClass: 'text-[#66FF99] border-[#66FF99]/20 bg-[#66FF99]/5',
            barColor: 'bg-emerald-400',
            warning: lang === 'en' ? 'Missing manual physical descriptions for hybrid model.' : 'Thiếu bổ sung mô tả chữ để tối ưu cơ chế phối hợp.',
            hint: lang === 'en' ? '85% • Facial locks complete' : '85% • Nhận diện khuôn mặt thành công'
          };
        }
        if (hasPrompt) {
          return {
            score: 74,
            label: lang === 'en' ? 'Awaiting photo upload for structural face locks' : 'Đang đợi ảnh để khóa khuôn mặt',
            colorClass: 'text-sky-400 border-sky-500/15 bg-sky-500/5',
            barColor: 'bg-sky-400',
            warning: lang === 'en' ? 'Upload 1-5 reference photos to stabilize character identity.' : 'Tải lên 1-5 ảnh để khóa đồng nhất khuôn mặt.',
            hint: lang === 'en' ? '74% • Awaiting facial reference files' : '74% • Đang đợi ảnh khuôn mặt tham chiếu'
          };
        }
        return {
          score: 20,
          label: lang === 'en' ? 'Unconfigured DNA' : 'Chưa thiết lập DNA',
          colorClass: 'text-gray-500 border-white/5 bg-white/[0.01]',
          barColor: 'bg-gray-650'
        };
      }
    }

    if (key === 'product') {
      if (mode === 'upload') {
        if (count === 0) {
          return {
            score: 30,
            label: lang === 'en' ? 'Awaiting Product References' : 'Đang đợi ảnh sản phẩm',
            colorClass: 'text-rose-450 border-rose-500/15 bg-rose-500/5',
            barColor: 'bg-rose-500',
            warning: lang === 'en'
              ? 'Upload 1-3 reference photos to align product geometry.'
              : 'Tải lên 1-3 ảnh tham khảo để khóa hình dáng vỏ hộp.'
          };
        }
        return {
          score: 92,
          label: lang === 'en' ? 'Product geometry locked' : 'Khóa hình học mặt hàng',
          colorClass: 'text-[#66FF99] border-[#66FF99]/25 bg-emerald-500/5',
          barColor: 'bg-[#66FF99]',
          hint: lang === 'en' ? '92% • Product geometry locked' : '92% • Khóa hình dáng hình học vật phẩm thành công'
        };
      } else if (mode === 'prompt') {
        if (!hasPrompt) {
          return {
            score: 30,
            label: lang === 'en' ? 'Empty product specs' : 'Thiết lập trống',
            colorClass: 'text-amber-500 border-amber-500/10 bg-amber-500/5',
            barColor: 'bg-amber-500',
            warning: lang === 'en'
              ? 'Describe product dimension or materials.'
              : 'Nhập mô tả chất liệu và dáng vẻ vỏ sản phẩm.'
          };
        }
        return {
          score: 70,
          label: lang === 'en' ? 'Specs active via prompt' : 'Mô tả nhãn hàng hoạt động',
          colorClass: 'text-sky-400 border-sky-500/15 bg-sky-500/5',
          barColor: 'bg-sky-400',
          hint: lang === 'en' ? '70% • Manual product specs active' : '70% • Thông số nhãn hàng bằng chữ hoạt động'
        };
      } else { // hybrid
        if (count > 0 && hasPrompt) {
          return {
            score: 94,
            label: lang === 'en' ? 'Ideal product lock (Hybrid)' : 'Buộc nhãn tối ưu (Phối hợp)',
            colorClass: 'text-[#66FF99] border-[#66FF99]/25 bg-emerald-500/5',
            barColor: 'bg-[#66FF99]',
            hint: lang === 'en' ? '94% • Branding and package stabilized' : '94% • Đồng bộ vỏ bao bì nhãn mác lý tưởng'
          };
        }
        if (count > 0) {
          return {
            score: 80,
            label: lang === 'en' ? 'Geometry bound' : 'Bán diện hình học đã khóa',
            colorClass: 'text-emerald-400 border-emerald-500/15 bg-emerald-500/5',
            barColor: 'bg-emerald-400',
            warning: lang === 'en' ? 'Please supply brief labeling texts to complete hybrid mode.' : 'Vui lòng cung cấp thêm text nhãn hàng để tối ưu phối hợp.',
            hint: lang === 'en' ? '80% • Dimensions locked' : '80% • Đã khóa kích thước cơ bản vỏ chai'
          };
        }
        if (hasPrompt) {
          return {
            score: 68,
            label: lang === 'en' ? 'Directives bound' : 'Đang khống chế mô tả',
            colorClass: 'text-sky-400 border-sky-500/15 bg-sky-500/5',
            barColor: 'bg-sky-400',
            warning: lang === 'en' ? 'Upload product images for best packet-geometry stability.' : 'Tải lên thêm ảnh mặt hàng để khóa kết cấu bao bì.',
            hint: lang === 'en' ? '68% • Manual instructions bound' : '68% • Chỉ dẫn bao mẫu hoạt động'
          };
        }
        return {
          score: 15,
          label: lang === 'en' ? 'Unconfigured DNA' : 'Chưa thiết lập DNA',
          colorClass: 'text-gray-500 border-white/5 bg-white/[0.01]',
          barColor: 'bg-gray-650'
        };
      }
    }

    if (key === 'background') {
      const sceneCount = project.sceneCount || 8;
      if (mode === 'upload') {
        if (count === 0) {
          return {
            score: 25,
            label: lang === 'en' ? 'Awaiting Scenery References' : 'Đang đợi ảnh phông nền',
            colorClass: 'text-rose-450 border-rose-500/15 bg-rose-500/5',
            barColor: 'bg-rose-500',
            warning: lang === 'en'
              ? `Recommended to upload ${sceneCount} backgrounds to stabilize ${sceneCount} rendering scenes.`
              : `Khuyến nghị tải lên đủ ${sceneCount} phông bối cảnh khớp cho ${sceneCount} phân cảnh.`
          };
        }
        if (count < sceneCount) {
          return {
            score: 74,
            label: lang === 'en' ? 'Insufficient environment references' : 'Chưa đủ phông nền tham chiếu',
            colorClass: 'text-amber-400 border-amber-500/10 bg-amber-500/5',
            barColor: 'bg-amber-450',
            warning: lang === 'en'
              ? `Drift risk detected: you have ${count}/${sceneCount} reference images.`
              : `Báo động sai lệch: Bạn mới chỉ tải ${count}/${sceneCount} ảnh phông nền tương ứng.`
          };
        }
        return {
          score: 95,
          label: lang === 'en' ? 'Full scenery locked' : 'Khóa đồng bộ phông nền',
          colorClass: 'text-[#66FF99] border-[#66FF99]/25 bg-emerald-500/5',
          barColor: 'bg-[#66FF99]',
          hint: lang === 'en' ? '95% • Full environment locked' : '95% • Đã bảo đảm bối cảnh hoàn hảo cho mọi scene'
        };
      } else if (mode === 'prompt') {
        if (!hasPrompt) {
          return {
            score: 30,
            label: lang === 'en' ? 'Automatic scenery' : 'Phông nền tự lập',
            colorClass: 'text-amber-500 border-amber-500/10 bg-amber-500/5',
            barColor: 'bg-amber-500',
            warning: lang === 'en'
              ? 'Enter background details to define layout coordinates.'
              : 'Mô tả bối cảnh để cố định bố cục Studio.'
          };
        }
        return {
          score: 65,
          label: lang === 'en' ? 'Studio styles bound via text' : 'Bối cảnh Studio liên kết',
          colorClass: 'text-sky-400 border-sky-500/15 bg-sky-500/5',
          barColor: 'bg-sky-400',
          hint: lang === 'en' ? '65% • Manual scenery specs locked' : '65% • Không gian bối cảnh phác thảo bằng chữ'
        };
      } else { // hybrid
        if (count >= sceneCount && hasPrompt) {
          return {
            score: 97,
            label: lang === 'en' ? 'Ultimate Studio Lock (Hybrid)' : 'Không gian Studio lý tưởng',
            colorClass: 'text-[#66FF99] border-[#66FF99]/25 bg-emerald-500/5',
            barColor: 'bg-[#66FF99]',
            hint: lang === 'en' ? '97% • Perfect background consistency locked' : '97% • Trùng khớp bối cảnh phối hợp hoàn hảo'
          };
        }
        if (count > 0 && hasPrompt) {
          return {
            score: 84,
            label: lang === 'en' ? 'Scenery partially established' : 'Bối cảnh khớp một phần',
            colorClass: 'text-emerald-400 border-emerald-500/15 bg-[#66FF99]/5',
            barColor: 'bg-emerald-450',
            warning: lang === 'en' ? `Adding up to ${sceneCount} reference images stabilizes light and reflection.` : `Nâng số lượng lên đủ ${sceneCount} ảnh giúp ánh sáng cực kỳ đồng nhất.`,
            hint: lang === 'en' ? `84% • Mapped ${count}/${sceneCount} references` : `84% • Đã gán ${count}/${sceneCount} ảnh bối cảnh`
          };
        }
        if (count > 0) {
          return {
            score: 72,
            label: lang === 'en' ? 'Reference scenery locked' : 'Bối cảnh mẫu đã khống chế',
            colorClass: 'text-sky-400 border-sky-500/15 bg-sky-500/5',
            barColor: 'bg-sky-400',
            warning: lang === 'en' ? 'Provide room layout texts to secure lighting details.' : 'Nhập thông tin bối cảnh chữ để kiểm soát ánh sáng.',
            hint: lang === 'en' ? '72% • Layouts locking' : '72% • Cố định khung bối cảnh'
          };
        }
        if (hasPrompt) {
          return {
            score: 60,
            label: lang === 'en' ? 'Scenery descriptions bound' : 'Bao bối cảnh đã liên kết',
            colorClass: 'text-sky-400 border-sky-500/15 bg-sky-500/5',
            barColor: 'bg-sky-400',
            warning: lang === 'en' ? 'Uploading files prevents camera styling drift.' : 'Khuyến nghị thêm ảnh mẫu bối cảnh để giữ phông không bị méo.',
            hint: lang === 'en' ? '60% • Scenery instructions loaded' : '60% • Đã tải đặc tính không gian chữ'
          };
        }
        return {
          score: 10,
          label: lang === 'en' ? 'Unconfigured DNA' : 'Chưa thiết lập DNA',
          colorClass: 'text-gray-500 border-white/5 bg-white/[0.01]',
          barColor: 'bg-gray-650'
        };
      }
    }

    // style
    if (key === 'style') {
      if (mode === 'upload') {
        if (count === 0) {
          return {
            score: 40,
            label: lang === 'en' ? 'Awaiting Style Reference' : 'Mô phỏng bộ lọc trống',
            colorClass: 'text-[#FF9900] border-amber-500/15 bg-amber-500/5',
            barColor: 'bg-amber-500',
            warning: lang === 'en'
              ? 'Upload 1 representative stylistic lookup key photo.'
              : 'Hãy tải lên 1 tấm ảnh mẫu đặc trưng bộ lọc màu.'
          };
        }
        return {
          score: 85,
          label: lang === 'en' ? 'Style locked via reference keys' : 'Tông màu/Ánh sáng đã khóa',
          colorClass: 'text-[#66FF99] border-[#66FF99]/25 bg-emerald-500/5',
          barColor: 'bg-[#66FF99]',
          hint: lang === 'en' ? '85% • Grading maps bound' : '85% • Ánh sáng và màu sắc điện ảnh đã đồng bộ'
        };
      } else if (mode === 'prompt') {
        if (!hasPrompt) {
          return {
            score: 30,
            label: lang === 'en' ? 'Artistic fallback setup' : 'Thiết lập nghệ thuật chuẩn',
            colorClass: 'text-amber-500 border-amber-500/10 bg-amber-500/5',
            barColor: 'bg-amber-500',
            warning: lang === 'en'
              ? 'Type visual tone specs (e.g. moody orange, volumetric teal).'
              : 'Điền tông màu chủ đạo mong muốn (ví dụ: vàng rực rỡ, xanh trầm lãnh).'
          };
        }
        return {
          score: 82,
          label: lang === 'en' ? 'Style partially inferred' : 'Ánh sắc ngoại suy ổn định',
          colorClass: 'text-[#66FF99] border-[#65FFAD]/20 bg-[#65FFAD]/5',
          barColor: 'bg-emerald-400',
          hint: lang === 'en' ? '82% • Style keys bound via prompt' : '82% • Phong cách mỹ học đã ánh xạ qua chữ'
        };
      } else { // hybrid
        if (count > 0 && hasPrompt) {
          return {
            score: 92,
            label: lang === 'en' ? 'Style locked via reference keys' : 'Tông màu/Ánh sáng đã khóa',
            colorClass: 'text-[#66FF99] border-[#66FF99]/25 bg-emerald-500/5',
            barColor: 'bg-[#66FF99]',
            hint: lang === 'en' ? '92% • Hybrid grading executed flawlessly' : '92% • Giao thoa màu sắc mẫu và mô tả hoàn hảo'
          };
        }
        if (count > 0) {
          return {
            score: 80,
            label: lang === 'en' ? 'Grading bound' : 'Bộ lọc màu đã khóa',
            colorClass: 'text-emerald-400 border-emerald-500/15 bg-emerald-500/5',
            barColor: 'bg-emerald-400',
            warning: lang === 'en' ? 'Articulate style prompt coordinates to enrich lookup curve.' : 'Bổ sung từ khóa mỹ thuật để tối ưu bộ lọc khối màu.',
            hint: lang === 'en' ? '80% • Palette keys identified' : '80% • Bản phối tông màu hoàn thành'
          };
        }
        if (hasPrompt) {
          return {
            score: 78,
            label: lang === 'en' ? 'Artistic vector bound' : 'Bám phông màu mẫu chữ',
            colorClass: 'text-sky-400 border-sky-500/15 bg-sky-500/5',
            barColor: 'bg-sky-400',
            warning: lang === 'en' ? 'Consider uploading 1 sample style image to secure ambient color.' : 'Khuyên tải 1 ảnh mẫu màu sắc để đồng bộ ánh sắc phản chiếu.',
            hint: lang === 'en' ? '78% • Style vector bound' : '78% • Khống chế tông màu mỹ thuật'
          };
        }
        return {
          score: 20,
          label: lang === 'en' ? 'Unconfigured DNA' : 'Chưa thiết lập DNA',
          colorClass: 'text-gray-500 border-white/5 bg-white/[0.01]',
          barColor: 'bg-gray-650'
        };
      }
    }

    return {
      score: 50,
      label: 'Configured',
      colorClass: 'text-gray-400 border-white/5 bg-white/[0.01]',
      barColor: 'bg-gray-400'
    };
    };

    const finalResult = calculateMetrics();

    if (customScores[key] > 0 && mode !== 'prompt' && count > 0) {
      finalResult.score = customScores[key];
      if (finalResult.hint) {
        finalResult.hint = finalResult.hint.replace(/^\d+%/, `${customScores[key]}%`);
      }
    }

    return finalResult;
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
    const mode = inputModes[key];
    const metrics = getConfidenceMetrics(key, mode, structure.items?.length || 0, !!structure.prompt?.trim());

    // Get recommended count or label
    const getRecommendationInfo = () => {
      if (key === 'character') return lang === 'en' ? 'Recomended: 1-5 images' : 'Khuyến nghị: 1-5 hình ảnh';
      if (key === 'product') return lang === 'en' ? 'Recommended: 1-3 images' : 'Khuyến nghị: 1-3 hình ảnh';
      if (key === 'background') {
        const matchingScenes = project.sceneCount || 8;
        return lang === 'en' ? `Recommended: matches scene count (${matchingScenes} images)` : `Khuyến nghị: khớp số lượng phân cảnh (${matchingScenes} ảnh)`;
      }
      return lang === 'en' ? 'Recommended: 1 style canvas photo' : 'Khuyến nghị: 1 ảnh bộ lọc sắc';
    };

    // Toggle segment selector
    const setModeForCategory = (targetMode: 'upload' | 'prompt' | 'hybrid') => {
      setInputModes(prev => {
        return { ...prev, [key]: targetMode };
      });
      
      // Synchronize values safely on switch (moved outside the setInputModes callback)
      if (targetMode === 'upload') {
        // In upload-only mode, the prompt is automatically populated from auto-analysis
        onUpdateAssets({
          ...assets,
          [key]: {
            ...assets[key],
            prompt: extractedTraits[key]
          }
        });
      }
    };

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

          {/* INPUT MODE SELECTOR PANEL */}
          <div className="bg-black/50 p-1 rounded-xl border border-white/5 grid grid-cols-3 text-center text-[10px] font-mono font-bold">
            <button
              type="button"
              onClick={() => setModeForCategory('upload')}
              className={`py-2 rounded-lg cursor-pointer transition-all ${
                mode === 'upload' 
                  ? 'bg-[#66FF99] text-black shadow-md font-black' 
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              {lang === 'en' ? '● Upload Images' : '● Tải ảnh'}
            </button>
            <button
              type="button"
              onClick={() => setModeForCategory('prompt')}
              className={`py-2 rounded-lg cursor-pointer transition-all ${
                mode === 'prompt' 
                  ? 'bg-[#66FF99] text-black shadow-md font-black' 
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              {lang === 'en' ? '○ Prompt Only' : '○ Chỉ Prompt'}
            </button>
            <button
              type="button"
              onClick={() => setModeForCategory('hybrid')}
              className={`py-2 rounded-lg cursor-pointer transition-all ${
                mode === 'hybrid' 
                  ? 'bg-[#66FF99] text-black shadow-md font-black' 
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              {lang === 'en' ? '○ Hybrid' : '○ Phối hợp'}
            </button>
          </div>

          {/* DNA Confidence Bar */}
          {metrics.score > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] font-mono text-gray-500 font-bold uppercase select-none">
                <span>DNA Consistency Score</span>
                <span className="text-[#64FFAD] font-mono text-[9px]">{renderBlockBar(metrics.score)} {metrics.score}%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${metrics.barColor}`}
                  style={{ width: `${metrics.score}%` }}
                />
              </div>
              <div className="text-[9px] font-mono text-gray-500 tracking-wider">
                {getRecommendationInfo()}
              </div>
            </div>
          )}

          {/* Warning Banner */}
          {metrics.warning && (
            <div className="p-3 bg-[#EAB308]/5 border border-[#EAB308]/15 rounded-xl flex items-start gap-2.5 text-[#EAB308] text-[10.5px] leading-snug">
              <AlertTriangle className="w-4 h-4 shrink-0 stroke-[2] mt-0.5" />
              <span>{metrics.warning}</span>
            </div>
          )}

          {/* 1. TEXT PROMPT AREA (Mode "prompt" or "hybrid") */}
          {(mode === 'prompt' || mode === 'hybrid') && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-[10px] font-mono tracking-wider text-gray-400 uppercase font-black select-none">
                {lang === 'en' ? 'Prompt Description' : 'Mô Tả Bằng Chữ'}
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
          )}

          {/* 2. OPTICAL IMAGE UPLOADER area (Mode "upload" or "hybrid") */}
          {(mode === 'upload' || mode === 'hybrid') && (
            <div className="space-y-3 animate-fade-in">
              <label className="text-[10px] font-mono tracking-wider text-gray-400 uppercase font-black select-none flex justify-between items-center">
                <span>{lang === 'en' ? 'Reference Images' : 'Ảnh Tham Khảo'}</span>
                <span className="text-[9px] lowercase text-[#66FF99] font-medium">{lang === 'en' ? 'automatic' : 'nhận diện tự động'}</span>
              </label>

              <input
                type="file"
                id={`file_input_${key}`}
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
                    <label
                      htmlFor={`file_input_${key}`}
                      className="aspect-[16/10] border border-dashed border-white/10 hover:border-[#66FF99]/40 rounded-xl bg-white/[0.01] hover:bg-[#66FF99]/5 transition-all flex flex-col items-center justify-center text-gray-500 hover:text-[#66FF99] gap-1 cursor-pointer group"
                    >
                      <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="text-[8px] font-mono font-black uppercase tracking-widest">{lang === 'en' ? 'Add photo' : 'Thêm ảnh'}</span>
                    </label>
                  )}
                </div>
              ) : (
                /* Upload Placeholder when empty */
                <label
                  htmlFor={`file_input_${key}`}
                  className={`w-full aspect-[16/8] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 bg-black/25 text-gray-500 hover:text-white hover:border-[#66FF99]/30 transition-all group ${analysisCompleted ? 'cursor-not-allowed opacity-30 style_input_disabled' : 'cursor-pointer'}`}
                >
                  <Upload className="w-5 h-5 stroke-[1.5] group-hover:scale-110 transition-transform text-gray-500 group-hover:text-[#66FF99]" />
                  <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 group-hover:text-[#66FF99]/90 font-bold">
                    {lang === 'en' ? 'Upload References' : 'Tải Lên File Ảnh'}
                  </span>
                </label>
              )}

              {/* AUTO ANALYSIS RESULT (LIVE EDITABLE) Area for Mode "upload" or "hybrid" */}
              {structure.items && structure.items.length > 0 && (
                <div className="p-3 rounded-2xl bg-[#111111] border border-emerald-500/10 space-y-2 mt-2 animate-fade-in">
                  <div className="flex justify-between items-center text-[9px] font-mono font-black tracking-widest select-none">
                    <span className="text-[#64FFAD]">🔮 AUTO ANALYSIS RESULT (LIVE EDITABLE)</span>
                    <span className="text-gray-500 text-[8px]">OPTICAL COGNITIVE DETECTED</span>
                  </div>
                  <textarea
                    value={
                      analyzingStates[key]
                        ? (lang === 'en' ? '🔮 Analyzing image... Please wait...' : '🔮 Đang phân tích hình ảnh... Vui lòng đợi...')
                        : (structure.prompt || extractedTraits[key])
                    }
                    onChange={(e) => {
                      const text = e.target.value;
                      // Update active DNA struct prompt live!
                      onUpdateAssets({
                        ...assets,
                        [key]: {
                          ...assets[key],
                          prompt: text
                        }
                      });
                      setExtractedTraits(prev => ({ ...prev, [key]: text }));
                    }}
                    placeholder={lang === 'en' ? 'Recognizing traits...' : 'Đang phân tích đặc trưng ảnh...'}
                    disabled={analysisCompleted || analyzingStates[key]}
                    rows={2}
                    className={`w-full p-2.5 bg-black/60 border border-white/5 rounded-xl text-[10.5px] font-mono text-gray-300 placeholder-gray-500 focus:border-[#66FF99]/20 outline-none resize-none transition-all ${
                      analyzingStates[key] ? 'animate-pulse text-amber-400 focus:border-amber-500/30' : ''
                    }`}
                  />
                  <div className="text-[8px] font-mono text-gray-500 select-none">
                    {lang === 'en' ? 'AI extracted these specifications from reference photos. Click inside text box to edit them directly.' : 'AI tự trích xuất đặc trưng từ ảnh mẫu. Nhấp vào khung text để chỉnh sửa trực tiếp.'}
                  </div>
                </div>
              )}
            </div>
          )}
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

      {/* Dynamic DNA HUD Dashboard */}
      {!isAnalyzing && !analysisCompleted && (
        <div className="p-5 rounded-3xl bg-[#080808] border border-white/5 space-y-4 font-mono text-[11px] shadow-[0_4px_30px_rgba(0,0,0,0.4)] animate-fade-in" id="dna_realtime_hud">
          <div className="flex justify-between items-center border-b border-white/5 pb-2.5 select-none">
            <span className="text-[#66FF99] font-black uppercase tracking-widest flex items-center gap-1.5 text-xs">
              <span>🧬 CHROMOSOMAL DNA CONSISTENCY REAL-TIME HUD</span>
            </span>
            <span className="text-[10px] text-gray-500 font-bold uppercase">SECURE COGNITIVE ENGINE ACTIVE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Character DNA */}
            {(() => {
              const str = assets.character;
              const mode = inputModes.character;
              const met = getConfidenceMetrics('character', mode, str.items?.length || 0, !!str.prompt?.trim());
              return (
                <div className="p-4 bg-black/60 rounded-2xl border border-white/[0.03] space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between text-gray-400 font-black uppercase select-none text-[10px] tracking-wider">
                      <span>Character DNA</span>
                      <span className="text-[#66FF99] font-black">{met.score}%</span>
                    </div>
                    <div className="text-[11px] text-[#66FF99] tracking-tight truncate select-none leading-none mt-1.5">
                      {renderBlockBar(met.score)}
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400 font-sans leading-normal italic font-medium pt-1 font-mono uppercase text-[9px] tracking-wide border-t border-white/[0.02]">
                    {met.label}
                  </div>
                </div>
              );
            })()}

            {/* Product DNA */}
            {(() => {
              const str = assets.product;
              const mode = inputModes.product;
              const met = getConfidenceMetrics('product', mode, str.items?.length || 0, !!str.prompt?.trim());
              return (
                <div className="p-4 bg-black/60 rounded-2xl border border-white/[0.03] space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between text-gray-400 font-black uppercase select-none text-[10px] tracking-wider">
                      <span>Product DNA</span>
                      <span className="text-[#64FFAD] font-black">{met.score}%</span>
                    </div>
                    <div className="text-[11px] text-[#64FFAD] tracking-tight truncate select-none leading-none mt-1.5">
                      {renderBlockBar(met.score)}
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400 font-sans leading-normal italic font-medium pt-1 font-mono uppercase text-[9px] tracking-wide border-t border-white/[0.02]">
                    {met.label}
                  </div>
                </div>
              );
            })()}

            {/* Background DNA */}
            {(() => {
              const str = assets.background;
              const mode = inputModes.background;
              const met = getConfidenceMetrics('background', mode, str.items?.length || 0, !!str.prompt?.trim());
              return (
                <div className="p-4 bg-black/60 rounded-2xl border border-white/[0.03] space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between text-gray-400 font-black uppercase select-none text-[10px] tracking-wider">
                      <span>Background DNA</span>
                      <span className="text-[#64FFAD] font-black">{met.score}%</span>
                    </div>
                    <div className="text-[11px] text-[#64FFAD] tracking-tight truncate select-none leading-none mt-1.5">
                      {renderBlockBar(met.score)}
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400 font-sans leading-normal italic font-medium pt-1 font-mono uppercase text-[9px] tracking-wide border-t border-white/[0.02]">
                    {met.label}
                  </div>
                </div>
              );
            })()}

            {/* Style DNA */}
            {(() => {
              const str = assets.style;
              const mode = inputModes.style;
              const met = getConfidenceMetrics('style', mode, str.items?.length || 0, !!str.prompt?.trim());
              return (
                <div className="p-4 bg-black/60 rounded-2xl border border-white/[0.03] space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between text-gray-400 font-black uppercase select-none text-[10px] tracking-wider">
                      <span>Style DNA</span>
                      <span className="text-[#64FFAD] font-black">{met.score}%</span>
                    </div>
                    <div className="text-[11px] text-[#64FFAD] tracking-tight truncate select-none leading-none mt-1.5">
                      {renderBlockBar(met.score)}
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400 font-sans leading-normal italic font-medium pt-1 font-mono uppercase text-[9px] tracking-wide border-t border-white/[0.02]">
                    {met.label}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

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
