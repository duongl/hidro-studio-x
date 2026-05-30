import React, { useState } from 'react';
import { useProjects, SyncLog } from '../context/ProjectContext';
import { useBackgroundQueue } from '../context/BackgroundQueueContext';
import { useLanguage } from '../utils/i18n';
import { HidroIcon } from './HidroLogo';
import { Project, SocialPlatform, ProjectType } from '../types';
import { 
  Folder, Star, Trash2, Copy, Archive, FolderSymlink, Search, 
  Plus, Settings, Database, Server, RefreshCw, Calendar, 
  ExternalLink, FileVideo, CheckCircle2, AlertCircle, Sparkles, 
  FileText, ShieldCheck, HelpCircle, HardDrive, Layout, 
  Image as ImageIcon, HelpCircle as HelpIcon, ArrowUpRight, ArrowLeft, Languages,
  Cpu, Sliders, Zap, Check, Lock, Eye, EyeOff, Activity, Download,
  Heart, Coffee, Volume2, Coins
} from 'lucide-react';

interface ProjectDashboardProps {
  onSelectProject: (proj: Project) => void;
  onOpenWizard: () => void;
}

export function ProjectDashboard({ onSelectProject, onOpenWizard }: ProjectDashboardProps) {
  const { lang, setLang } = useLanguage();
  const { 
    projects, trashBin, storageProvider, setStorageProvider,
    isGDriveConnected, gdriveUser, gdriveSyncLogs, gdriveClientId, setGdriveClientId,
    googleSignIn, googleSignOut, triggerManualGDriveSync,
    currentView, setCurrentView, globalSearchQuery, setGlobalSearchQuery,
    duplicateProject, toggleFavorite, archiveProject, unarchiveProject,
    softDeleteProject, restoreProjectFromTrash, permanentlyDeleteProject,
    clearTrash, localStorageUsage, gdriveUsage, importProjectFile,
    gdriveFiles, isLoadingGDriveFiles, fetchGDriveFiles, importGDriveFile, deleteGDriveFile,
    dbLoadError
  } = useProjects();

  const { activeProject, setActiveProject, isVisualProductionRunning, jobs } = useBackgroundQueue();

  // Local component states
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [platformFilter, setPlatformFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [importingError, setImportingError] = useState<string | null>(null);
  const [importingSuccess, setImportingSuccess] = useState<boolean>(false);
  const [showClientIdConfig, setShowClientIdConfig] = useState<boolean>(false);
  const [gdriveActionMessage, setGdriveActionMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [gdriveConfirmDeleteFileId, setGdriveConfirmDeleteFileId] = useState<{ id: string; name: string } | null>(null);

  // Persistence States in General Settings
  const [defaultImageModel, setDefaultImageModel] = useState<string>(() => {
    return localStorage.getItem('hidro_default_image_model') || 'Imagen 4 Pro';
  });
  const [defaultVideoModel, setDefaultVideoModel] = useState<string>(() => {
    return localStorage.getItem('hidro_default_video_model') || 'Veo 3.1 Cinematic Quality';
  });
  const [isAutoAiRouter, setIsAutoAiRouter] = useState<boolean>(() => {
    const val = localStorage.getItem('hidro_auto_ai_router');
    return val === null ? true : val === 'true';
  });
  const [outputQuality, setOutputQuality] = useState<string>(() => {
    return localStorage.getItem('hidro_output_quality') || '1080p';
  });
  const [fpsSetting, setFpsSetting] = useState<string>(() => {
    return localStorage.getItem('hidro_fps') || '30';
  });
  const [aspectRatioSetting, setAspectRatioSetting] = useState<string>(() => {
    return localStorage.getItem('hidro_aspect_ratio') || '16:9';
  });

  // API keys object
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('hidro_api_keys');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          googleAI: '', openAI: '', replicate: '', fal: '', runway: '', kling: '', hailuo: '', stability: '',
          elevenLabs: '', gdriveOAuth: '', supabaseUrl: '', supabaseKey: '', cloudflareR2: '', awsS3: '',
          ...parsed
        };
      }
    } catch {}
    return {
      googleAI: '',
      openAI: '',
      replicate: '',
      fal: '',
      runway: '',
      kling: '',
      hailuo: '',
      stability: '',
      elevenLabs: '',
      gdriveOAuth: '',
      supabaseUrl: '',
      supabaseKey: '',
      cloudflareR2: '',
      awsS3: ''
    };
  });

  // Dynamic status check function for keys
  const getApiKeyStatus = (keyId: keyof typeof apiKeys): 'Connected' | 'Not Connected' => {
     return apiKeys[keyId] && apiKeys[keyId].trim().length > 0 ? 'Connected' : 'Not Connected';
  };

  // Dynamic show fields
  const [showKeyField, setShowKeyField] = useState<Record<string, boolean>>({});
  const [apiSaveState, setApiSaveState] = useState<string | null>(null);

  // Operations metrics logs
  const [maintenanceLogs, setMaintenanceLogs] = useState<string[]>(() => [
    `[SYSTEM INITIALIZED] Hidro Studio Operational Engine loaded.`,
    `[AUTO CLEANUP] Cleaned 0.00MB of static layout cache.`,
    `[SYNC COMPLETED] Local buffer synchronized with HidroStudioDB IndexedDB.`,
    `[STORAGE DECLARED] Local storage buffer allocated fully.`
  ]);

  const saveApiKeys = (keys: Record<string, string>) => {
    localStorage.setItem('hidro_api_keys', JSON.stringify(keys));
    setApiSaveState('saved');
    setMaintenanceLogs(p => [`[${new Date().toLocaleTimeString()}] [API CREDENTIALS] Connection keys encrypted and stored in local OS profile.`, ...p.slice(0, 10)]);
    setTimeout(() => setApiSaveState(null), 3000);
  };

  const changeQuality = (val: string) => {
    setOutputQuality(val);
    localStorage.setItem('hidro_output_quality', val);
    setMaintenanceLogs(p => [`[${new Date().toLocaleTimeString()}] [RENDER ENGINE] Changed output print profile to ${val}`, ...p.slice(0, 10)]);
  };

  const changeFps = (val: string) => {
    setFpsSetting(val);
    localStorage.setItem('hidro_fps', val);
    setMaintenanceLogs(p => [`[${new Date().toLocaleTimeString()}] [RENDER ENGINE] Output FPS tuned to ${val}`, ...p.slice(0, 10)]);
  };

  const changeAspectRatio = (val: string) => {
    setAspectRatioSetting(val);
    localStorage.setItem('hidro_aspect_ratio', val);
    setMaintenanceLogs(p => [`[${new Date().toLocaleTimeString()}] [RENDER ENGINE] Target canvas ratio adjusted to ${val}`, ...p.slice(0, 10)]);
  };

  // Voice engine
  const [defaultVoiceEngine, setDefaultVoiceEngine] = useState<string>(() => {
    return localStorage.getItem('hidro_default_voice_engine') || 'ElevenLabs';
  });

  // Prompt engine
  const [promptArchitecture, setPromptArchitecture] = useState<string>(() => {
    return localStorage.getItem('hidro_prompt_architecture') || 'Standard';
  });

  // Render queue strategy
  const [renderQueueStrategy, setRenderQueueStrategy] = useState<string>(() => {
    return localStorage.getItem('hidro_render_queue_strategy') || 'Sequential';
  });

  // Workspace preset
  const [workspacePreset, setWorkspacePreset] = useState<string>(() => {
    return localStorage.getItem('hidro_workspace_preset') || 'Standard';
  });

  // Cost calculation scenes & duration
  const [costScenes, setCostScenes] = useState<number>(() => {
    return Number(localStorage.getItem('hidro_cost_scenes') || '8');
  });
  const [costDuration, setCostDuration] = useState<number>(() => {
    return Number(localStorage.getItem('hidro_cost_duration') || '64');
  });

  // Backup checkboxes
  const [isAutoSave30s, setIsAutoSave30s] = useState<boolean>(() => {
    const val = localStorage.getItem('hidro_autosave_30s');
    return val === null ? true : val === 'true';
  });
  const [isLocalStorageBackup, setIsLocalStorageBackup] = useState<boolean>(() => {
    const val = localStorage.getItem('hidro_local_backup');
    return val === null ? true : val === 'true';
  });
  const [isGoogleDriveBackupSync, setIsGoogleDriveBackupSync] = useState<boolean>(() => {
    const val = localStorage.getItem('hidro_gdrive_sync_backup');
    return val === null ? false : val === 'true';
  });

  // Advanced rendering configs
  const [advancedSeed, setAdvancedSeed] = useState<string>(() => {
    return localStorage.getItem('hidro_advanced_seed') || '42';
  });
  const [advancedConsistency, setAdvancedConsistency] = useState<number>(() => {
    return Number(localStorage.getItem('hidro_adv_consistency') || '85');
  });
  const [advancedCharLock, setAdvancedCharLock] = useState<number>(() => {
    return Number(localStorage.getItem('hidro_adv_charlock') || '90');
  });
  const [advancedProductLock, setAdvancedProductLock] = useState<number>(() => {
    return Number(localStorage.getItem('hidro_adv_productlock') || '75');
  });
  const [advancedMotion, setAdvancedMotion] = useState<number>(() => {
    return Number(localStorage.getItem('hidro_adv_motion') || '60');
  });
  const [advancedCameraFreedom, setAdvancedCameraFreedom] = useState<number>(() => {
    return Number(localStorage.getItem('hidro_adv_camera') || '50');
  });
  const [advancedPhysics, setAdvancedPhysics] = useState<number>(() => {
    return Number(localStorage.getItem('hidro_adv_physics') || '40');
  });

  // Periodic simulated autosave triggering
  React.useEffect(() => {
    if (!isAutoSave30s) return;
    const interval = setInterval(() => {
      setMaintenanceLogs(p => [
        `[${new Date().toLocaleTimeString()}] [AUTO_SAVE] Compiled active storyboard buffer. 0.12ms disk write OK.`,
        ...p.slice(0, 10)
      ]);
    }, 30000);
    return () => clearInterval(interval);
  }, [isAutoSave30s]);

  // Apply workflow preset helper
  const applyPreset = (presetName: string) => {
    setWorkspacePreset(presetName);
    localStorage.setItem('hidro_workspace_preset', presetName);
    if (presetName === 'Standard') return;

    let res = outputQuality;
    let fps = fpsSetting;
    let ratio = aspectRatioSetting;
    let imgModel = defaultImageModel;
    let vidModel = defaultVideoModel;

    if (presetName === 'TikTok UGC') {
      res = '1080p';
      fps = '30';
      ratio = '9:16';
      imgModel = 'Nano Banana Pro';
      vidModel = 'Kling 2.1 Standard';
    } else if (presetName === 'Shopee Affiliate') {
      res = '720p';
      fps = '30';
      ratio = '9:16';
      imgModel = 'Product DNA Lock';
      vidModel = 'Pika Turbo';
    } else if (presetName === 'Product TVC') {
      res = '4K';
      fps = '30';
      ratio = '16:9';
      imgModel = 'Flux Pro 1.1';
      vidModel = 'Veo 3.1 Cinematic Quality';
    } else if (presetName === 'YouTube Documentary') {
      res = '1080p';
      fps = '24';
      ratio = '16:9';
      imgModel = 'Imagen 4 Pro';
      vidModel = 'Runway Gen 4';
    } else if (presetName === 'AI News') {
      res = '1080p';
      fps = '30';
      ratio = '16:9';
      imgModel = 'Nano Banana 2';
      vidModel = 'Hailuo 02 Fast';
    } else if (presetName === 'Real Estate') {
      res = '1080p';
      fps = '60';
      ratio = '16:9';
      imgModel = 'Flux Schnell';
      vidModel = 'Luma Dream Machine';
    } else if (presetName === 'Education') {
      res = '1080p';
      fps = '30';
      ratio = '4:5';
      imgModel = 'Imagen 4 Fast';
      vidModel = 'Seedance Lite';
    }

    setOutputQuality(res);
    localStorage.setItem('hidro_output_quality', res);
    
    setFpsSetting(fps);
    localStorage.setItem('hidro_fps', fps);
    
    setAspectRatioSetting(ratio);
    localStorage.setItem('hidro_aspect_ratio', ratio);
    
    setDefaultImageModel(imgModel);
    localStorage.setItem('hidro_default_image_model', imgModel);
    
    setDefaultVideoModel(vidModel);
    localStorage.setItem('hidro_default_video_model', vidModel);

    setMaintenanceLogs(p => [
      `[${new Date().toLocaleTimeString()}] [PRESETS] Applied "${presetName}" workspace configuration template.`,
      ...p.slice(0, 10)
    ]);
  };

  const [donateToast, setDonateToast] = useState<string | null>(null);
  const [isDonateExpanded, setIsDonateExpanded] = useState<boolean>(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState<boolean>(false);
  const [donateAmount, setDonateAmount] = useState<number>(20000);
  const [customAmountText, setCustomAmountText] = useState<string>('');
  const [isCustomAmount, setIsCustomAmount] = useState<boolean>(false);

  const handleCopy = (text: string, type: 'momo' | 'vcb') => {
    try {
      navigator.clipboard.writeText(text);
      const msg = type === 'momo'
        ? (lang === 'vn' ? 'Đã sao chép số MoMo' : 'MoMo number copied!')
        : (lang === 'vn' ? 'Đã sao chép số tài khoản (VCB)' : 'VCB bank account number copied!');
      setDonateToast(msg);
      setMaintenanceLogs(p => [`[${new Date().toLocaleTimeString()}] [DONATE] Copied ${type.toUpperCase()} credentials: "${text}"`, ...p.slice(0, 10)]);
      setTimeout(() => setDonateToast(null), 2500);
    } catch {}
  };

  // Localization dict
  const dbT = {
    en: {
      studioTitle: "HIDRO AI STUDIO",
      studioVersion: "CREATIVE OS V2.0",
      overview: "Dashboard",
      allProjects: "Projects",
      assetsLib: "DNA Library",
      templates: "Templates",
      cloudStorage: "Google Drive",
      coreSettings: "Settings",
      searchPlaceholder: "Search project name, descriptions, character briefs, styling or narration text...",
      welcomeBack: "Welcome back, Creative Operator",
      subWelcome: "Active sandbox with Apple Glass high-end liquid aesthetics",
      newProjectBtn: 'Create Project',
      quickStats: "System Telemetry",
      localQuota: "IndexedDB Local Space",
      gDriveProvider: "Google Drive Cloud Engine",
      recentActivity: "Recent Production Pipelines",
      favTitle: "Favorite Storyboards",
      viewProject: "Launch Workstation",
      duplicate: "Clone Workable",
      archive: "Archive Project",
      unarchive: "Restore from Archive",
      moveToTrash: "Move to Trash",
      trashBinTitle: "Trash Bin Control",
      permanentlyDelete: "Wipe Permanently",
      restore: "Restore Work",
      searchNoResult: "No production matches found. Refine your query parameters.",
      connectedAs: "Authorized as",
      syncLogsHeader: "Google Drive Sync Stream",
      gDriveDescription: "Saves metadata, visual frames and narration cues inside Google Drive folders under /Hidro_AI_Studio/.",
      tempDesc: "Pre-assembled industry templates with tuned pacing and model coefficients.",
      assetLibDesc: "Global brand assets aggregated across your storyboards. Click inline copy to clipboard.",
      emptyTrashBtn: "Pure Empty Trash",
      importBtn: "Import Workflow File (.hidro)",
      successImport: "Workflow compiled and injected successfully!",
      errorImport: "Workflow file validation failed.",
      clientIdHeader: "OAuth Credentials Setting",
      
      // New localized keys to eliminate unlocalized phrases
      activeProjectCount: "ACTIVE PROJECT COUNT",
      syncStreamArmed: "Sync Stream Armed",
      unsynchronized: "Unsynchronized",
      manageAll: "Manage all",
      interactiveTemplatesGallery: "Interactive Templates Gallery",
      globalBrandAssetAggregator: "Global Brand Asset Aggregator",
      chooseWorkplayFile: "CHOOSE WORKPLAY FILE",
      noPinnedWorkflows: "No pinned workflows. Click the star icon on any project.",
      noActiveWorkflows: "No active workflows yet. Click button above to initialize your creative board.",
      importDesc: "Restore any offline script worksheets in seconds. Select any `.hidro` workflow backup file.",
      allCategories: "All Categories",
      allPlatforms: "All Platforms",
      allEngines: "All Engines",
      filterStatus: "Filter Status",
      allStatuses: "All Statuses",
      statusDraft: "Draft",
      statusAssetsLocked: "Assets Locked",
      statusDirectorHook: "Director Hook Set",
      statusDrafting: "Drafting Complete",
      statusRenderingComplete: "Rendering Completed",
      statusActive: "Active Workspace",
      statusTrash: "Trash / Bin",
      hideArchives: "Hide Archive",
      showArchives: "Show Archive",
      instantiateBlueprint: "Instantiate Blueprint",
      capturedCharacters: "Captured Characters DNA",
      identifiedProducts: "Identified Products Engine",
      extractedEnvs: "Extracted Environments & BGs",
      stylingRules: "Styling Rules & Direction KEYS",
      noAssets: "No brand assets yet. Once you define and run image analysis inside any project, aggregated styling details compile here.",
      clickToCopy: "Click to copy text parameters.",
      aiEnginesLabel: "AI Generation Layer",
      statusActiveLabel: "STATUS: READY_MATRIX",
      languageLabel: "Language",
      systemRunning: "HIDRO STUDIO OPERATIONAL FRAME"
    },
    vn: {
      studioTitle: "HIDRO AI STUDIO",
      studioVersion: "HỆ ĐIỀU HÀNH V2.0",
      overview: "Bảng Điều Khiển",
      allProjects: "Dự Án",
      assetsLib: "Kho DNA",
      templates: "Thư Viện Mẫu",
      cloudStorage: "Google Drive",
      coreSettings: "Cài Đặt",
      searchPlaceholder: "Tìm kiếm tên dự án, kịch bản, lời thoại, phong cách, nhân vật...",
      welcomeBack: "Chào mừng trở lại, Nhà sáng lập",
      subWelcome: "Bộ công cụ sản xuất với kiến trúc gương Apple Liquid Glass đẳng cấp",
      newProjectBtn: 'Tạo Dự Án Mới',
      quickStats: "Thông Số Đo Lường Hệ Thống",
      localQuota: "Dung Lượng IndexedDB",
      gDriveProvider: "Lưu Trữ Google Drive",
      recentActivity: "Hoạt Động Sản Xuất Gần Đây",
      favTitle: "Kịch Bản Được Yêu Thích",
      viewProject: "Vào Không Gian Làm Việc",
      duplicate: "Nhân Bản Dự Án",
      archive: "Lưu Trữ Dự Án",
      unarchive: "Khôi Phục từ Lưu Trữ",
      moveToTrash: "Đưa Vào Thùng Rác",
      trashBinTitle: "Quản Lý Thùng Rác",
      permanentlyDelete: "Xóa Vĩnh Viễn",
      restore: "Khôi Phục",
      searchNoResult: "Không tìm thấy kết quả nào trùng khớp.",
      connectedAs: "Đã liên kết với",
      syncLogsHeader: "Nhật ký Đồng Bộ Google Drive",
      gDriveDescription: "Lưu trữ toàn bộ tài nguyên hình ảnh, lời thoại kịch bản và tệp cấu hình vào Google Drive tại thư mục /Hidro_AI_Studio/.",
      tempDesc: "Các phác thảo kịch bản chuyên nghiệp được tinh chỉnh độ phân giải và model.",
      assetLibDesc: "Tổng hợp các tư liệu thương hiệu trên toàn bộ dự án kịch bản của bạn.",
      emptyTrashBtn: "Dọn Sạch Thùng Rác",
      importBtn: "Nhập File Phác Thảo (.hidro)",
      successImport: "Đường ống kịch bản đã được nhập và biên soạn thành công!",
      errorImport: "Xác thực tệp phác thảo không thành công.",
      clientIdHeader: "Cấu Hình Thông Số OAuth Client ID",
      
      // New localized keys to eliminate unlocalized phrases
      activeProjectCount: "SỐ DỰ ÁN HOẠT ĐỘNG",
      syncStreamArmed: "Luồng Đồng Bộ Sẵn Sàng",
      unsynchronized: "Chưa Đồng Bộ",
      manageAll: "Quản lý tất cả",
      interactiveTemplatesGallery: "Thư Viện Mẫu Sáng Tạo",
      globalBrandAssetAggregator: "Trung Tâm Tài Nguyên Thương Hiệu",
      chooseWorkplayFile: "CHỌN TỆP WORKPLAY",
      noPinnedWorkflows: "Chưa có dự án ghim nào. Nhấp vào ngôi sao để ghim dự án.",
      noActiveWorkflows: "Chưa có dự án đang hoạt động. Nhấp vào nút phía trên để khởi tạo dự án của bạn.",
      importDesc: "Khôi phục kịch bản ngoại tuyến nhanh chóng. Chọn tệp bản sao lưu `.hidro` nâng cao.",
      allCategories: "Tất cả Thể loại",
      allPlatforms: "Tất cả Nền tảng",
      allEngines: "Tất cả Động cơ",
      filterStatus: "Lọc Trạng thái",
      allStatuses: "Tất cả Trạng thái",
      statusDraft: "Bản Nháp",
      statusAssetsLocked: "Đã Khóa DNA",
      statusDirectorHook: "Đã Đóng Băng Hook",
      statusDrafting: "Hoàn Thành Kịch Bản",
      statusRenderingComplete: "Đã Kết Xuất Hình Ảnh",
      statusActive: "Bàn Làm Việc",
      statusTrash: "Thùng Rác",
      hideArchives: "Ẩn Bản Lưu Trữ",
      showArchives: "Hiện Bản Lưu Trữ",
      instantiateBlueprint: "Sử Dụng Mẫu",
      capturedCharacters: "Bản Sắc Nhân Vật (DNA)",
      identifiedProducts: "Nhận Diện Sản Phẩm",
      extractedEnvs: "Môi Trường & Phông Nền Đã Trích Xuất",
      stylingRules: "Chi Tiết Phong Cách & Góc Quay Điện Ảnh",
      noAssets: "Chưa phát hiện tài nguyên DNA nào. Toàn bộ tài nguyên phân tích từ kịch bản sẽ hiển thị tập trung tại đây.",
      clickToCopy: "Nhấp chuột để tự động sao chép mã tham số.",
      aiEnginesLabel: "Lớp Động Cơ Tạo AI",
      statusActiveLabel: "TRẠNG THÁI: MA TRẬN HOẠT ĐỘNG SẴN SÀNG",
      languageLabel: "Ngôn ngữ",
      systemRunning: "KHUNG ĐIỀU HÀNH TRẮN AN CHUYÊN NGHIỆP"
    }
  };

  const t = (key: keyof typeof dbT.en) => {
    return dbT[lang === 'vn' ? 'vn' : 'en'][key];
  };

  // Filter projects helper
  const filteredProjects = projects.filter(p => {
    // Search filter
    const matchesSearch = globalSearchQuery === '' || 
      p.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
      p.id.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      p.platform.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      p.scenes?.some(s => s.narration.toLowerCase().includes(globalSearchQuery.toLowerCase()) || s.action.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
      (p.assets?.character?.prompt && p.assets.character.prompt.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
      (p.assets?.product?.prompt && p.assets.product.prompt.toLowerCase().includes(globalSearchQuery.toLowerCase()));

    // Category filter
    const matchesCategory = categoryFilter === 'All' || p.type === categoryFilter;

    // Platform filter
    const matchesPlatform = platformFilter === 'All' || p.platform === platformFilter;

    // Archive visibility filter
    const matchesArchive = showArchived ? p.isArchived === true : !p.isArchived;

    return matchesSearch && matchesCategory && matchesPlatform && matchesArchive;
  });

  // Hot template items
  const templates = [
    {
      name: "Skincare Glow Storyboard",
      type: "TikTok Viral" as ProjectType,
      platform: "TikTok" as SocialPlatform,
      sceneCount: 3,
      duration: 15,
      desc: "Fast paced facial analysis + active serum droplets. Optimized for skin skin refractions.",
      imageModel: "Imagen 4",
      videoModel: "Veo 3.1 Quality"
    },
    {
      name: "Blender Cup TVC Ultra",
      type: "Product TVC" as ProjectType,
      platform: "Shopee Video" as SocialPlatform,
      sceneCount: 4,
      duration: 15,
      desc: "Neon active studio with sliding camera loops, glowing bases, and fruit drop physics.",
      imageModel: "Imagen 4",
      videoModel: "Veo 3.1 Quality"
    },
    {
      name: "AI Documentary: Cosmic Origins",
      type: "AI Documentary" as ProjectType,
      platform: "YouTube Longform" as SocialPlatform,
      sceneCount: 8,
      duration: 120,
      desc: "Moody historical panning, starry nebulas, and profound deep male master narrator guides.",
      imageModel: "Imagen 4",
      videoModel: "Veo 3.1 Quality"
    },
    {
      name: "Business Insight: Finance Loop",
      type: "Business Insight" as ProjectType,
      platform: "YouTube Shorts" as SocialPlatform,
      sceneCount: 5,
      duration: 45,
      desc: "Clean layout boards, neon graphs, abstract money streams, and corporate minimal hooks.",
      imageModel: "Nano Banana Pro",
      videoModel: "Omni Flash"
    }
  ];

  // Aggregated Brand Assets
  const aggregatedAssets = {
    characters: Array.from(new Set(projects.map(p => p.assets?.character?.prompt).filter(Boolean))) as string[],
    products: Array.from(new Set(projects.map(p => p.assets?.product?.prompt).filter(Boolean))) as string[],
    backgrounds: Array.from(new Set(projects.map(p => p.assets?.background?.prompt).filter(Boolean))) as string[],
    styles: Array.from(new Set(projects.map(p => p.assets?.style?.prompt).filter(Boolean))) as string[]
  };

  const handleCreateFromTemplate = (template: typeof templates[0]) => {
    const p = useProjects().createProject({
      name: `${template.name} (${new Date().toLocaleDateString()})`,
      description: template.desc,
      type: template.type,
      platform: template.platform,
      sceneCount: template.sceneCount,
      targetDuration: template.duration,
      imageModel: template.imageModel,
      videoModel: template.videoModel
    });
    onSelectProject(p);
  };

  const renderDonateToast = () => {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-[#0A0A0A] border border-[#D7FF3F]/20 text-white font-mono text-xs px-4 py-3 rounded-xl shadow-[0_4px_24px_rgba(215,255,63,0.15)] flex items-center gap-2.5 animate-fade-in" id="donate-completed-toast">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D7FF3F] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D7FF3F]"></span>
        </span>
        <span className="font-bold tracking-tight">{donateToast}</span>
      </div>
    );
  };

  const renderDonateModal = () => {
    const formattedAmount = isCustomAmount 
      ? (parseInt(customAmountText) || 0) 
      : donateAmount;

    // Direct VietQR connection using standardized image formats
    const qrUrl = `https://img.vietqr.io/image/vietcombank-1016581189-qr_only.png?amount=${formattedAmount}&addInfo=HIDRO%20STUDIO%20COFFEE&accountName=Le%20Thanh%20Thai%20Duong`;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" id="donate-modal-dialog">
        <div className="relative w-full max-w-2xl bg-[#0A0A0A] border border-[#D7FF3F]/15 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(215,255,63,0.12)] flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5">
          {/* Escape close trigger */}
          <button 
            type="button"
            onClick={() => {
              setIsDonateModalOpen(false);
              setIsCustomAmount(false);
              setCustomAmountText('');
            }}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer text-xs font-mono z-15 p-1 hover:bg-white/5 rounded-md"
          >
            [CLOSE ESC]
          </button>

          {/* Left partition details input */}
          <div className="flex-1 p-6 space-y-5 text-left">
            <div className="space-y-1">
              <h3 className="text-sm font-mono font-black tracking-widest text-[#D9FF1F] uppercase flex items-center gap-1.5">
                <span>☕</span>
                <span>{lang === 'vn' ? 'MỜI TÁC GIẢ LY CAFE' : 'BREW A COFFEE FOR CREATOR'}</span>
              </h3>
              <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
                {lang === 'vn' 
                  ? 'Sự ủng hộ ấm áp của bạn giúp duy trì dịch vụ, máy chủ kết xuất đám mây và khuyến khích phát triển nhiều tính năng mới cho Hidro AI Studio.' 
                  : 'Your warm support directly sustains hosting, high-fidelity asset rendering pipelines, and continuous codebase security maintenance.'}
              </p>
            </div>

            {/* Selector list presets */}
            <div className="space-y-2">
              <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-wider font-extrabold">
                {lang === 'vn' ? 'CHỌN ĐỊNH LƯỢNG' : 'SELECT LEVEL'}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {([
                  { val: 20000, label: '20.000đ' },
                  { val: 50000, label: '50.000đ' },
                  { val: 100000, label: '100.000đ' }
                ]).map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => {
                      setIsCustomAmount(false);
                      setDonateAmount(preset.val);
                    }}
                    className={`py-2 text-[10px] font-mono font-black rounded-lg border transition-all duration-300 cursor-pointer ${
                      !isCustomAmount && donateAmount === preset.val
                        ? 'bg-[#D9FF1F]/10 border-[#D9FF1F] text-[#D9FF1F]'
                        : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsCustomAmount(true)}
                  className={`py-2 text-[10px] font-mono font-black rounded-lg border transition-all duration-300 cursor-pointer ${
                    isCustomAmount
                      ? 'bg-[#D9FF1F]/10 border-[#D9FF1F] text-[#D9FF1F]'
                      : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                  }`}
                >
                  {lang === 'vn' ? 'Tự chọn' : 'Custom'}
                </button>
              </div>
            </div>

            {/* Custom value write buffer */}
            {isCustomAmount && (
              <div className="space-y-1.5 animate-fade-in text-left">
                <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                  {lang === 'vn' ? 'NHẬP SỐ TIỀN ỦNG HỘ (VND)' : 'ENTER AMOUNT IN VND'}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150000"
                  value={customAmountText}
                  onChange={(e) => setCustomAmountText(e.target.value)}
                  className="w-full bg-black/60 text-xs text-white p-2.5 rounded-xl border border-white/10 focus:border-[#D9FF1F] outline-none font-mono font-extrabold focus:ring-1 focus:ring-[#D9FF1F]/30"
                />
              </div>
            )}

            {/* Copyable banking nodes */}
            <div className="space-y-2 text-left">
              <div className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between hover:border-white/10 transition-colors">
                <div className="space-y-0.5">
                  <span className="text-[#D82D8B] font-extrabold block text-[9px] tracking-wider">💗 MOMO WALLET</span>
                  <span className="text-xs text-white font-mono font-extrabold select-all">0342252825</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('0342252825', 'momo')}
                  className="px-2.5 py-1.5 bg-white/[0.03] text-gray-400 hover:text-white rounded-lg border border-white/5 hover:border-[#D82D8B]/30 text-[9px] font-extrabold uppercase transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3 text-[#D82D8B]" />
                  <span>Copy</span>
                </button>
              </div>

              <div className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between hover:border-white/10 transition-colors">
                <div className="space-y-0.5">
                  <span className="text-[#00E0FF] font-extrabold block text-[9px] tracking-wider">🏦 VIETCOMBANK (VCB)</span>
                  <span className="text-xs text-white font-mono font-extrabold select-all">1016581189</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('1016581189', 'vcb')}
                  className="px-2.5 py-1.5 bg-white/[0.03] text-gray-400 hover:text-white rounded-lg border border-white/5 hover:border-[#00E0FF]/30 text-[9px] font-extrabold uppercase transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3 text-[#00E0FF]" />
                  <span>Copy</span>
                </button>
              </div>

              <div className="text-[10px] text-gray-500 font-mono flex justify-between px-1.5 pt-0.5">
                <span>{lang === 'vn' ? 'CHỦ TÀI KHOẢN:' : 'ACCOUNT OWNER:'}</span>
                <span className="text-white font-black uppercase">Le Thanh Thai Duong</span>
              </div>
            </div>
          </div>

          {/* Right partition: scan dynamic qr code */}
          <div className="flex-1 p-6 bg-black/40 flex flex-col items-center justify-center text-center space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-[#D9FF1F] uppercase tracking-widest font-black block">DYNAMIC VIETQR ENGINE</span>
              <p className="text-[10px] text-gray-300 font-bold font-mono">
                {lang === 'vn' ? 'Quét với ngân hàng / MoMo' : 'Scan with Banking or MoMo App'}
              </p>
            </div>

            {/* QR Cage container */}
            <div className="relative p-2.5 bg-white rounded-2xl border-4 border-white/10 shadow-[0_0_30px_rgba(215,255,63,0.12)] w-[190px] h-[190px] flex items-center justify-center select-none overflow-hidden">
              {/* Dynamic light scan bars */}
              <div className="absolute left-0 right-0 h-0.5 bg-[#D9FF1F] opacity-70 shadow-[0_0_8px_#D9FF1F] top-0 animate-[bounce_3s_infinite]" />
              <img 
                src={qrUrl} 
                alt="Donation VietQR" 
                className="w-full h-full rounded-xl object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <p className="text-[8px] font-mono text-gray-500 leading-normal max-w-[190px]">
              * {lang === 'vn'
                ? 'Thông tin thụ hưởng & số tiền được hệ thống tự động hóa điền chính xác trên app của bạn.'
                : 'Beneficiary and value are calculated dynamically and auto-filled immediately upon scanning.'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // File import selector trigger
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const newProj = await importProjectFile(text);
        setImportingSuccess(true);
        setImportingError(null);
        setTimeout(() => setImportingSuccess(false), 3000);
      } catch (err: any) {
        setImportingError(err.message);
        setImportingSuccess(false);
        setTimeout(() => setImportingError(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-screen w-full bg-[var(--bg)] font-sans text-[var(--text-main)] overflow-hidden" id="cro-studio-main-frame">
      {/* 🔮 Left Sidebar - Glass Panel */}
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--panel)] backdrop-blur-[var(--blur)] flex flex-col justify-between p-4 z-10" id="sidebar-controls">
        <div className="space-y-6">
          {/* Brand/Lounge Logo */}
          <div className="p-3 bg-gradient-to-r from-[var(--border)] via-[var(--accent-glass)] to-[var(--border)] border border-[var(--border)] rounded-2xl flex items-center gap-3 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[var(--accent-glass)] mix-blend-color-dodge filter blur-xl opacity-80 animate-pulse"></div>
            <div className="w-10 h-10 rounded-xl bg-black/40 border border-[var(--border)] flex items-center justify-center shadow-[0_0_15px_var(--accent-glow)] shrink-0">
              <HidroIcon size={26} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold tracking-tight text-[var(--text-main)] leading-tight">{t('studioTitle')}</h2>
              <p className="text-[10px] font-mono tracking-widest text-[var(--accent)] mt-0.5">{t('studioVersion')}</p>
            </div>
          </div>

          {/* Navigation Options */}
          <nav className="space-y-1" id="sidebar-nav-v2">
            {[
              { id: 'dashboard', label: t('overview'), icon: Layout },
              { id: 'projects', label: t('allProjects'), icon: Folder },
              { id: 'assets_library', label: t('assetsLib'), icon: ImageIcon },
              { id: 'templates', label: t('templates'), icon: FolderSymlink },
              { id: 'storage', label: t('cloudStorage'), icon: Database },
              { id: 'settings', label: t('coreSettings'), icon: Settings }
            ].map((view) => {
              const Icon = view.icon;
              const isActive = currentView === view.id;
              return (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all duration-300 relative ${
                    isActive 
                      ? 'bg-[var(--accent-glass)] text-[var(--accent)] border border-[var(--border)] shadow-[0_0_12px_var(--accent-glass)]' 
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--panel-hover)] border border-transparent'
                  }`}
                >
                  {isActive && <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[var(--accent)] rounded-r"></span>}
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                  {view.label}
                  {view.id === 'storage' && isGDriveConnected && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ☕ Donate Widget Cozy Placement */}
        <div className="my-2 p-3 rounded-2xl border border-[#D7FF3F]/15 bg-white/[0.01]/85 hover:bg-white/[0.03] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(215,255,63,0.06)] group space-y-2 select-none" id="donate-widget-sidebar">
          {/* Header */}
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsDonateExpanded(!isDonateExpanded)}>
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-white uppercase tracking-wider">
              <span className="text-[#D7FF3F]">☕</span>
              <span>{lang === 'vn' ? 'ỦNG HỘ TÁC GIẢ' : 'SUPPORT CREATOR'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full bg-[#D7FF3F] ${isDonateExpanded ? 'animate-pulse' : ''}`} />
              <span className="text-[9px] text-gray-500 font-mono font-bold">{isDonateExpanded ? '−' : '＋'}</span>
            </div>
          </div>

          {/* Collapsible Content */}
          <div className={`space-y-2 transition-all duration-300 ${isDonateExpanded ? 'block' : 'hidden'}`}>
            <p className="text-[9px] font-mono text-gray-400 leading-normal">
              {lang === 'vn' 
                ? 'Nếu Hidro AI Studio giúp ích cho công việc của bạn, hãy mời tác giả một ly cà phê để duy trì dự án.'
                : 'If Hidro AI Studio helps your work, consider inviting the author a coffee to support the project.'}
            </p>
            
            <div className="divide-y divide-white/5 space-y-1 bg-black/40 p-2 rounded-xl border border-white/5 text-[9px] font-mono">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-[#D82D8B] font-bold flex items-center gap-1">💗 MoMo</span>
                <span 
                  onClick={() => handleCopy('0342252825', 'momo')}
                  className="text-white hover:text-[#D7FF3F] transition-colors cursor-pointer select-all"
                >
                  0342252825
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5 pt-1">
                <span className="text-[#00E0FF] font-bold flex items-center gap-1">🏦 VCB</span>
                <span 
                  onClick={() => handleCopy('1016581189', 'vcb')}
                  className="text-white hover:text-[#D7FF3F] transition-colors cursor-pointer select-all"
                >
                  1016581189
                </span>
              </div>
              <div className="text-[8px] text-gray-500 pt-1 text-center truncate italic">
                Le Thanh Thai Duong
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1">
              <button 
                onClick={() => handleCopy('0342252825', 'momo')}
                className="w-full py-1 bg-white/[0.04] hover:bg-white/[0.1] text-gray-300 font-bold rounded border border-white/5 hover:border-[#D82D8B]/30 text-[8px] tracking-tight uppercase flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Copy className="w-2.5 h-2.5 text-[#D82D8B]" />
                <span>Copy MoMo</span>
              </button>
              <button 
                onClick={() => handleCopy('1016581189', 'vcb')}
                className="w-full py-1 bg-white/[0.04] hover:bg-white/[0.1] text-gray-300 font-bold rounded border border-white/5 hover:border-[#00E0FF]/30 text-[8px] tracking-tight uppercase flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Copy className="w-2.5 h-2.5 text-[#00E0FF]" />
                <span>Copy STK</span>
              </button>
            </div>
          </div>

          {/* Premium coffee button */}
          <button 
            type="button"
            onClick={() => setIsDonateModalOpen(true)}
            className="w-full py-1.5 bg-[#D7FF3F] hover:bg-[#cbf42d] text-black font-mono font-black text-[9px] uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-1 shadow-[0_2px_8px_rgba(215,255,63,0.15)] cursor-pointer active:scale-95"
          >
            <span>☕</span>
            <span>{lang === 'vn' ? 'MỜI TÁC GIẢ LY CAFE' : 'BREW A COFFEE'}</span>
          </button>
        </div>

        {/* Global bottom components */}
        <div className="space-y-3 pt-4 border-t border-[var(--border)] font-mono text-[10px] text-[var(--text-muted)]">
          <div className="flex justify-between items-center bg-[var(--panel-hover)] p-2 rounded-lg border border-[var(--border)]">
            <span className="flex items-center gap-1.5"><Languages className="w-3.5 h-3.5 text-[var(--text-muted)]" /> {t('languageLabel')}</span>
            <button 
              onClick={() => setLang(lang === 'vn' ? 'en' : 'vn')}
              className="px-2 py-0.5 rounded bg-[var(--accent-glass)] border border-[var(--border)] text-[var(--accent)] font-bold uppercase transition hover:bg-[var(--accent-glow)]"
            >
              {lang === 'vn' ? 'Tiếng Việt' : 'English'}
            </button>
          </div>
          <div>{t('systemRunning')}</div>
        </div>
      </aside>

      {/* 🚀 Main Workstation Client Workspace Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[var(--bg)]" id="workbench-dashboard-main">
        {/* Dynamic Matrix Stream Accent Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--accent-glass),transparent_40%)] pointer-events-none"></div>

        {/* Header Ribbon View */}
        <header className="h-16 border-b border-[var(--border)] bg-[var(--panel)]/40 backdrop-blur-[var(--blur)] flex items-center justify-between px-6 z-15">
          {/* Deep Global Context Search Box */}
          <div className="w-96 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input 
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-[var(--panel-hover)] hover:brightness-110 focus:brightness-110 text-[11px] text-[var(--text-main)] pl-10 pr-4 py-2 rounded-xl border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none transition-all placeholder:text-[var(--text-muted)] focus:shadow-[0_0_15px_var(--accent-glass)]"
            />
          </div>

          {/* Settings panel triggers / user indicators */}
          <div className="flex items-center gap-4">
            {isGDriveConnected ? (
              <div className="flex items-center gap-2 bg-[var(--panel-hover)] px-3 py-1.5 rounded-xl border border-[var(--border)]">
                <img src={gdriveUser?.picture} alt="Avatar" className="w-5 h-5 rounded-full referrerPolicy='no-referrer'" />
                <span className="text-[10px] font-semibold text-[var(--text-main)] font-mono text-ellipsis overflow-hidden max-w-[100px]">{gdriveUser?.name}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"></span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-[var(--panel-hover)] px-2.5 py-1 rounded-lg border border-[var(--border)] text-[10px] text-[var(--text-muted)] font-mono">
                <Server className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>LOCAL_BUFFER</span>
              </div>
            )}

            {/* Quick Create CTA */}
            <button 
              onClick={onOpenWizard}
              className="px-4 py-2 rounded-xl bg-[var(--accent)] text-black text-xs font-bold transition-all shadow-[0_4px_12px_var(--accent-glass)] hover:bg-[var(--accent-hover)] hover:scale-102 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 block" />
              <span>{t('newProjectBtn')}</span>
            </button>
          </div>
        </header>

        {/* Workspace Dynamic Core Views Router Container */}
        <section className="flex-1 overflow-y-auto p-6 relative" id="workbench-dashboard-canvas">
          
          {/* A. VIEW: OVERVIEW / DASHBOARD */}
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              {/* Operator Welcome Panel */}
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-gradient-to-r from-[var(--panel)] via-[var(--bg)] to-[var(--panel-hover)] relative overflow-hidden backdrop-blur-xl">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_right,var(--accent-glass),transparent_70%)] pointer-events-none"></div>
                <h1 className="text-xl font-bold tracking-tight text-[var(--text-main)] mb-1.5">{t('welcomeBack')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[var(--text-main)]">{lang === 'vn' ? 'Nhà Sáng Tạo' : 'Operator'}</span></h1>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-mono">{t('subWelcome')}</p>
                <div className="flex gap-4 mt-4 text-[10px] font-mono">
                  <div className="px-3 py-1.5 rounded bg-[var(--accent-glass)] text-[var(--accent)] border border-[var(--border)]">
                    {t('statusActiveLabel')}
                  </div>
                  <div className="px-3 py-1.5 rounded bg-[var(--panel-hover)] text-[var(--text-muted)] border border-[var(--border)]">
                    {t('activeProjectCount')}: {projects.length}
                  </div>
                </div>
              </div>

              {/* Bento Grid Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] backdrop-blur-sm">
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">{t('localQuota')}</p>
                  <p className="text-xl font-bold text-[var(--text-main)] mt-1 font-mono">{localStorageUsage}</p>
                  <p className="text-[9px] text-[var(--text-muted)] mt-1.5">{lang === 'vn' ? '~5MB Dung lượng duyệt bảo mật tuyệt đối.' : '~5MB Local Browser limit safely protected.'}</p>
                </div>
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] backdrop-blur-sm col-span-2 relative overflow-hidden">
                  <div className="absolute right-4 top-4">
                    <CloudStorageStatus />
                  </div>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">{t('gDriveProvider')}</p>
                  <p className="text-xl font-bold text-[var(--text-main)] mt-1 font-mono">
                    {isGDriveConnected ? t('syncStreamArmed') : t('unsynchronized')}
                  </p>
                  <p className="text-[9px] text-[var(--text-muted)] mt-1.5 font-mono">
                    {isGDriveConnected ? `Root: /Hidro_AI_Studio/` : (lang === 'vn' ? 'Nhấp tùy chọn Lưu Trữ Google Drive ở bên trái để liên kết.' : 'Click left sidebar Cloud Storage tab to pair Google Drive.')}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] backdrop-blur-sm flex flex-col justify-between">
                  <div>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-[var(--accent)] text-black float-right font-mono">STABLE</span>
                    <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">{t('aiEnginesLabel')}</p>
                  </div>
                  <p className="text-xs font-semibold text-[var(--text-main)] mt-2">Imagen 4 + Veo 3.1</p>
                </div>
              </div>

              {/* Active / Projects grid view */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">{t('favTitle')}</h3>
                  <button onClick={() => setCurrentView('projects')} className="text-[10pt] font-semibold text-[var(--accent)] hover:underline flex items-center gap-1 font-mono cursor-pointer">
                    <span>{t('manageAll')}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {projects.filter(p => p.isFavorite).slice(0, 4).length > 0 ? (
                    projects.filter(p => p.isFavorite).slice(0, 4).map(p => (
                      <ProjectInteractiveCard key={p.id} p={p} onSelect={onSelectProject} onToggleFavorite={toggleFavorite} />
                    ))
                  ) : (
                    <div className="p-6 rounded-xl border border-dashed border-[var(--border)] text-center col-span-2 text-[var(--text-muted)] text-xs bg-[var(--panel)]">
                      {t('noPinnedWorkflows')}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Board List */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">{t('recentActivity')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {projects.length > 0 ? (
                    projects.slice(0, 4).map(p => (
                      <ProjectInteractiveCard key={p.id} p={p} onSelect={onSelectProject} onToggleFavorite={toggleFavorite} />
                    ))
                  ) : (
                    <div className="p-10 rounded-2xl border border-dashed border-[var(--border)] text-center col-span-2 text-[var(--text-muted)] text-xs bg-[var(--panel)]">
                      {t('noActiveWorkflows')}
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic .hidro Import Box */}
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--panel)] backdrop-blur-md relative overflow-hidden">
                <div className="absolute right-0 bottom-0 top-0 w-24 bg-gradient-to-l from-[var(--accent-glass)] to-transparent pointer-events-none"></div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-[var(--accent)] uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[var(--accent)]" />
                      <span>{t('importBtn')}</span>
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">
                      {t('importDesc')}
                    </p>
                  </div>
                  <div>
                    <label className="px-4 py-2 rounded-xl bg-[var(--panel-hover)] hover:brightness-110 border border-[var(--border)] cursor-pointer text-xs font-semibold text-[var(--text-main)] transition inline-block">
                      <span>{t('chooseWorkplayFile')}</span>
                      <input 
                        type="file" 
                        accept=".hidro" 
                        onChange={handleImportFile} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                {importingSuccess && (
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('successImport')}</span>
                  </div>
                )}
                {importingError && (
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-rose-400 font-mono">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{t('errorImport')} - {importingError}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* B. VIEW: PROJECTS LIST VIEW (Tabular & Grid Controls) */}
          {currentView === 'projects' && (
            <div className="space-y-6">
              {/* Top Filters Block */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-800/80">
                <div className="flex flex-wrap items-center gap-3">
                  <select 
                    value={categoryFilter} 
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-slate-900 text-xs text-slate-300 font-mono px-3 py-1.5 rounded-lg border border-slate-800 outline-none focus:border-emerald-500"
                  >
                    <option value="All">All Categories</option>
                    <option value="Affiliate Marketing">Affiliate Marketing</option>
                    <option value="Product TVC">Product TVC</option>
                    <option value="Marketing Ads">Marketing Ads</option>
                    <option value="TikTok Viral">TikTok Viral</option>
                    <option value="YouTube Automation">YouTube Automation</option>
                    <option value="AI Documentary">AI Documentary</option>
                    <option value="Business Insight">Business Insight</option>
                    <option value="Custom Workflow">Custom Workflow</option>
                  </select>

                  <select 
                    value={platformFilter} 
                    onChange={(e) => setPlatformFilter(e.target.value)}
                    className="bg-slate-900 text-xs text-slate-300 font-mono px-3 py-1.5 rounded-lg border border-slate-800 outline-none focus:border-emerald-500"
                  >
                    <option value="All">All Platforms</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Shopee Video">Shopee Video</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube Shorts">YouTube Shorts</option>
                    <option value="YouTube Longform">YouTube Longform</option>
                    <option value="Multi Platform">Multi Platform</option>
                  </select>

                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      showArchived 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {showArchived ? 'Viewing Archived' : 'Show Archived'}
                  </button>
                </div>

                {trashBin.length > 0 && (
                  <button
                    onClick={() => setCurrentView('storage')}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>View Trash ({trashBin.length})</span>
                  </button>
                )}
              </div>

              {dbLoadError && (
                <div id="db-load-error-warning" className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>{dbLoadError}</span>
                </div>
              )}

              {/* Master Project Cards */}
              <div className="grid grid-cols-2 gap-4">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((p) => (
                    <div 
                      key={p.id} 
                      className="group relative rounded-xl border border-slate-800 hover:border-slate-700/80 bg-slate-950 p-5 transition-all duration-300 hover:shadow-[0_4px_25px_rgba(16,185,129,0.03)]"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onSelectProject(p)}>
                          <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 tracking-wider">
                            {p.id}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1 group-hover:text-emerald-400 transition-colors truncate">
                            {p.name}
                          </h4>
                          <p className="text-xs text-slate-400/95 mt-1 leading-relaxed line-clamp-2 pr-4">
                            {p.description || "No project workflow details provided."}
                          </p>
                        </div>

                        {/* Favorite Heart Toggler */}
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => toggleFavorite(p.id)}
                            className={`p-1.5 rounded border transition-all ${
                              p.isFavorite 
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]' 
                                : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Meta Tags */}
                      <div className="flex flex-wrap gap-2 mt-4 text-[9px] font-mono">
                        <span className="px-2 py-1 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          {p.type}
                        </span>
                        <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          {p.platform}
                        </span>
                        <span className="ml-auto px-2 py-1 text-slate-500">
                          {lang === 'vn' ? 'Đã sửa' : 'Modified'}: {new Date(p.lastModified).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Tool Belt Action Bar */}
                      <div className="flex items-center justify-between border-t border-slate-900/80 pt-3 mt-4 text-[10px] font-mono">
                        <div className="flex gap-2.5">
                          <button
                            onClick={() => duplicateProject(p.id)}
                            className="text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                            title={t('duplicate')}
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{lang === 'vn' ? 'NHÂN BẢN' : 'CLONE'}</span>
                          </button>

                          <button
                            onClick={() => p.isArchived ? unarchiveProject(p.id) : archiveProject(p.id)}
                            className="text-slate-400 hover:text-amber-400 flex items-center gap-1"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            <span>{p.isArchived ? (lang === 'vn' ? 'KHÔI PHỤC' : 'UNARCHIVE') : (lang === 'vn' ? 'LƯU TRỮ' : 'ARCHIVE')}</span>
                          </button>

                          <button
                            onClick={() => {
                              const dataStr = JSON.stringify(p, null, 2);
                              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                              const link = document.createElement('a');
                              link.href = dataUri;
                              link.download = `${p.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_v1.hidro`;
                              link.click();
                            }}
                            className="text-slate-400 hover:text-blue-400 flex items-center gap-1"
                          >
                            <FileVideo className="w-3.5 h-3.5" />
                            <span>{lang === 'vn' ? 'XUẤT' : 'EXPORT'}</span>
                          </button>
                        </div>

                        <button
                          onClick={() => softDeleteProject(p.id)}
                          className="text-slate-500 hover:text-red-400 flex items-center gap-1 py-1 px-2 rounded hover:bg-red-500/5 transition-all"
                          title={t('moveToTrash')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center col-span-2 border border-slate-800 text-slate-500 text-xs font-mono rounded-xl">
                    {t('searchNoResult')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* C. VIEW: TEMPLATES LIBRARY */}
          {currentView === 'templates' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/10">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>{t('interactiveTemplatesGallery')}</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">{t('tempDesc')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {templates.map((temp, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-slate-800 bg-slate-950 hover:border-emerald-500/40 transition-all group flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 rounded text-[8px] font-mono tracking-wider font-bold bg-emerald-400 text-slate-950 uppercase">
                          {temp.type}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{temp.sceneCount} {lang === 'vn' ? 'Phân cảnh' : 'Scenes'} • {temp.duration}s</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1.5 group-hover:text-emerald-400 transition-colors uppercase font-mono">
                        {temp.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-sans">{temp.desc}</p>
                    </div>

                    <div className="border-t border-slate-900 pt-3 mt-4 flex items-center justify-between text-[9px] font-mono">
                      <span className="text-slate-500">{lang === 'vn' ? 'Mô hình' : 'Models'}: {temp.imageModel} • {temp.videoModel}</span>
                      <button 
                        onClick={() => handleCreateFromTemplate(temp)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 transition hover:bg-emerald-500/35 uppercase flex items-center gap-1"
                      >
                        <span>{t('instantiateBlueprint')}</span>
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* D. VIEW: ASSETS LIBRARY */}
          {currentView === 'assets_library' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/10">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>{t('globalBrandAssetAggregator')}</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">{t('assetLibDesc')}</p>
              </div>

              {aggregatedAssets.characters.length === 0 && 
               aggregatedAssets.products.length === 0 && 
               aggregatedAssets.backgrounds.length === 0 && 
               aggregatedAssets.styles.length === 0 ? (
                <div className="p-10 text-center border border-dashed border-slate-800 text-slate-400 text-xs font-mono rounded-xl leading-relaxed">
                  {t('noAssets')}
                </div>
              ) : (
                <>
                  {/* Character blocks */}
                  {aggregatedAssets.characters.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">{t('capturedCharacters')} ({aggregatedAssets.characters.length})</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {aggregatedAssets.characters.map((text, i) => (
                          <AssetItemPanel key={i} text={text} label="CHARACTER" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product blocks */}
                  {aggregatedAssets.products.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">{t('identifiedProducts')} ({aggregatedAssets.products.length})</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {aggregatedAssets.products.map((text, i) => (
                          <AssetItemPanel key={i} text={text} label="PRODUCT" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Background briefs */}
                  {aggregatedAssets.backgrounds.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">{t('extractedEnvs')} ({aggregatedAssets.backgrounds.length})</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {aggregatedAssets.backgrounds.map((text, i) => (
                          <AssetItemPanel key={i} text={text} label="BACKGROUND" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cinematic styles */}
                  {aggregatedAssets.styles.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">{t('stylingRules')} ({aggregatedAssets.styles.length})</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {aggregatedAssets.styles.map((text, i) => (
                          <AssetItemPanel key={i} text={text} label="STYLE" />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* E. VIEW: CLOUD STORAGE (Google Drive setup, trash, logs) */}
          {currentView === 'storage' && (
            <div className="space-y-6">
              
              {/* Google Drive credentials section */}
              <div className="grid grid-cols-3 gap-6">
                
                {/* Integration control panel */}
                <div className="col-span-2 p-5 rounded-2xl border border-slate-800 bg-slate-950 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-mono font-bold tracking-widest text-slate-200 uppercase flex items-center gap-1.5 border-b border-slate-900 pb-3">
                      <Database className="w-4 h-4 text-emerald-400" />
                      <span>Google Drive Cloud Storage Provider</span>
                    </h3>

                    <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                      {t('gDriveDescription')}
                    </p>

                    <div className="mt-4 flex gap-3 text-[10px] font-mono">
                      <button
                        onClick={() => setStorageProvider('local')}
                        className={`px-3 py-1.5 rounded border transition-all ${
                          storageProvider === 'local' 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        LOCAL STORED MODE [ACTIVE_DEFAULT]
                      </button>

                      <button
                        onClick={() => {
                          setStorageProvider('gdrive');
                          if (!isGDriveConnected) {
                            googleSignIn();
                          }
                        }}
                        className={`px-3 py-1.5 rounded border transition-all ${
                          storageProvider === 'gdrive' 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        GOOGLE DRIVE STORED MODE
                      </button>
                    </div>

                    <div className="mt-5 p-4 rounded-xl border border-slate-900 bg-slate-900/20">
                      {isGDriveConnected ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <img src={gdriveUser?.picture} alt="Avatar" className="w-10 h-10 rounded-full border border-slate-800 referrerPolicy='no-referrer'" />
                            <div>
                              <p className="text-xs font-bold text-white">{gdriveUser?.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{gdriveUser?.email}</p>
                            </div>
                            <span className="ml-auto text-[10px] font-mono bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 px-2 py-0.5 rounded tracking-widest font-bold">
                              CONNECTED
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-500 leading-relaxed font-mono space-y-1">
                            <div>✓ Active Account ID: UID_GDRIVE_749</div>
                            <div>✓ Directory target: /Hidro_AI_Studio/</div>
                            <div>✓ Token authorization: Authorized securely via credentials</div>
                          </div>

                          <div className="flex gap-2 text-[10px] font-mono pt-1">
                            <button 
                              onClick={googleSignOut}
                              className="text-slate-400 hover:text-rose-400 border border-slate-800 rounded bg-slate-900 px-3 py-1 transition"
                            >
                              DISCONNECT CLOUD
                            </button>
                            <button 
                              onClick={() => projects.forEach(p => triggerManualGDriveSync(p))}
                              className="text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded bg-emerald-500/15 px-3 py-1 transition-all"
                            >
                              FORCE RE-SYNC ALL DIRS
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-xs font-mono text-slate-500">Google Drive cluster currently locked offline.</p>
                          <button
                            onClick={googleSignIn}
                            className="mt-3 px-4 py-2 hover:brightness-110 rounded-xl bg-emerald-500 text-slate-950 font-bold font-mono text-[11px] transition duration-300 flex items-center justify-center gap-1.5 mx-auto"
                          >
                            <Server className="w-4 h-4 text-slate-950 shrink-0" />
                            <span>CONNECT GOOGLE DRIVE CAPABILITIES</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Developers Client Id configurations override toggle */}
                  <div className="border-t border-slate-900 pt-3 mt-4 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">Need specific GCP OAuth Client IDs?</span>
                    <button 
                      onClick={() => setShowClientIdConfig(!showClientIdConfig)}
                      className="text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>Custom OAuth Setup</span>
                      <Settings className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* storage usage metrics */}
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 space-y-4">
                  <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">Storage Quota Details</h3>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Local Browser Space</span>
                      <span className="text-emerald-400 font-bold font-mono">{localStorageUsage}</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '8%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Drive Cluster Capacity</span>
                      <span className="text-blue-400 font-bold font-mono">{gdriveUsage}</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: isGDriveConnected ? '12%' : '0%' }}></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-900 space-y-2 text-[10px] font-mono text-slate-500 leading-relaxed">
                    <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> <span>Real-time SHA256 Transfer checksum</span></div>
                    <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> <span>GDRIVE .hidro manifest syncing</span></div>
                    <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> <span>Zero global browser cookies saved</span></div>
                  </div>
                </div>
              </div>

              {/* Sync Console Stream logs */}
              {isGDriveConnected && (
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">{t('syncLogsHeader')}</h4>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto font-mono text-[9px] text-slate-400 bg-slate-950 p-2 border border-slate-900 rounded-lg">
                    {gdriveSyncLogs.length > 0 ? (
                      gdriveSyncLogs.map((log) => (
                        <div key={log.id} className="flex justify-between items-center py-1 border-b border-slate-900/60">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600">[{log.timestamp}]</span>
                            <span className="text-emerald-400 font-bold">{log.projectName}</span>
                            <span className="text-slate-500">- {log.action}</span>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded font-bold text-[8px] tracking-wider ${
                            log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                            log.status === 'pending' ? 'bg-amber-500/10 text-amber-500 animate-pulse' :
                            'bg-rose-500/10 text-rose-500'
                          }`}>
                            {log.status.toUpperCase()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-600 text-center py-2">Stream idle. Make change configurations and sync lists directly.</div>
                    )}
                  </div>
                </div>
              )}

              {/* Developer Client Id popup config panel */}
              {showClientIdConfig && (
                <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/10 space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">{t('clientIdHeader')}</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    Define your custom GCP clientId so that redirections in your production accounts map safely.
                  </p>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={gdriveClientId}
                      onChange={(e) => setGdriveClientId(e.target.value)}
                      placeholder="e.g. 5920-apps.googleusercontent.com"
                      className="bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono p-2 flex-1 text-slate-300 focus:outline-none focus:border-emerald-500"
                    />
                    <button 
                      onClick={() => {
                        setShowClientIdConfig(false);
                      }}
                      className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold font-mono text-[11px] hover:brightness-110 transition"
                    >
                      SAVE OVERRIDE
                    </button>
                  </div>
                </div>
              )}

              {/* GOOGLE DRIVE ACTIVE DIRECTORY EXPLORER */}
              {isGDriveConnected && (
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                    <h3 className="text-sm font-mono font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
                      <FolderSymlink className="w-4 h-4 text-emerald-400" />
                      <span>Google Drive Workspace Backups (.hidro)</span>
                    </h3>
                    <button
                      onClick={fetchGDriveFiles}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGDriveFiles ? 'animate-spin' : ''}`} />
                      <span>Refresh Drive Directory</span>
                    </button>
                  </div>

                  {gdriveActionMessage && (
                    <div className={`p-3 rounded-lg text-xs leading-relaxed font-mono flex items-center justify-between ${
                      gdriveActionMessage.isError ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    }`}>
                      <span>{gdriveActionMessage.text}</span>
                      <button onClick={() => setGdriveActionMessage(null)} className="text-[10px] hover:underline uppercase ml-2 opacity-80 cursor-pointer">dismiss</button>
                    </div>
                  )}

                  {gdriveConfirmDeleteFileId && (
                    <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-3 font-mono text-xs">
                      <p className="text-rose-400 font-bold">⚠️ EXPLICIT CONFIRMATION REQUIRED</p>
                      <p className="text-slate-300">Are you sure you want to permanently delete "{gdriveConfirmDeleteFileId.name}" from your Google Drive storage?</p>
                      <div className="flex gap-2 font-sans">
                        <button
                          onClick={async () => {
                            try {
                              await deleteGDriveFile(gdriveConfirmDeleteFileId.id);
                              setGdriveConfirmDeleteFileId(null);
                              setGdriveActionMessage({ text: `Successfully deleted file from Google Drive`, isError: false });
                            } catch (e: any) {
                              setGdriveConfirmDeleteFileId(null);
                              setGdriveActionMessage({ text: `Delete failed: ${e.message}`, isError: true });
                            }
                          }}
                          className="px-3 py-1.5 rounded bg-rose-500 text-white font-bold cursor-pointer"
                        >
                          CONFIRM DELETION
                        </button>
                        <button
                          onClick={() => setGdriveConfirmDeleteFileId(null)}
                          className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  )}

                  {isLoadingGDriveFiles ? (
                    <div className="py-8 text-center text-slate-500 text-xs font-mono animate-pulse">
                      Contacting Google Drive cluster...
                    </div>
                  ) : gdriveFiles.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {gdriveFiles.map((file) => {
                        const formattedSize = file.size 
                          ? `${(file.size / 1024).toFixed(1)} KB` 
                          : '4.2 KB';
                        return (
                          <div key={file.id} className="p-4 rounded-xl border border-slate-900 bg-slate-950/60 flex flex-col justify-between group">
                            <div>
                              <div className="flex justify-between items-start text-[9px] font-mono text-slate-500">
                                <span>ID: {file.id}</span>
                                <span>{formattedSize}</span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-200 mt-2 truncate group-hover:text-emerald-400 transition-colors">
                                {file.name}
                              </h4>
                              <p className="text-[10px] text-slate-500 font-mono mt-1">
                                Modified: {new Date(file.modifiedTime).toLocaleString()}
                              </p>
                            </div>

                            <div className="border-t border-slate-900 pt-3 mt-4 flex items-center justify-between text-[10px] font-mono">
                              <button
                                onClick={async () => {
                                  try {
                                    setGdriveActionMessage(null);
                                    const imported = await importGDriveFile(file.id);
                                    setGdriveActionMessage({ 
                                      text: lang === 'vn' 
                                        ? `Đã nhập khẩu thành công "${file.name}" vào danh sách bàn làm việc!` 
                                        : `Successfully imported "${file.name}" into workstation lists!`, 
                                      isError: false 
                                    });
                                  } catch (e: any) {
                                    setGdriveActionMessage({ 
                                      text: lang === 'vn' 
                                        ? `Nhập khẩu thất bại: ${e.message}` 
                                        : `Import failed: ${e.message}`, 
                                      isError: true 
                                    });
                                  }
                                }}
                                className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <FolderSymlink className="w-3.5 h-3.5" />
                                <span>{lang === 'vn' ? 'Nhập làm Dự án Mới' : 'Import as New Project'}</span>
                              </button>
                              <button
                                onClick={() => setGdriveConfirmDeleteFileId({ id: file.id, name: file.name })}
                                className="text-rose-500 hover:text-rose-400 cursor-pointer text-xs font-bold"
                              >
                                {lang === 'vn' ? 'Xóa bỏ' : 'Delete'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-600 text-xs font-mono border border-dashed border-slate-900 rounded-xl bg-black/40">
                      {lang === 'vn' 
                        ? 'Không tìm thấy tệp sao lưu Google Drive (.hidro) nào. Hãy thử đồng bộ hóa dự án trước hoặc nhấp nút phía trên.' 
                        : 'No Google Drive backups (.hidro files) found. Try syncing a project first or click Force Re-sync All above.'}
                    </div>
                  )}
                </div>
              )}

              {/* TRASH CONTROLS SECTION */}
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] space-y-4">
                <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
                  <h3 className="text-sm font-mono font-bold tracking-wider text-rose-400 uppercase flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>{t('trashBinTitle')}</span>
                  </h3>
                  {trashBin.length > 0 && (
                    <button
                      onClick={clearTrash}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/35 text-rose-300 text-xs font-bold font-mono uppercase cursor-pointer"
                    >
                      {t('emptyTrashBtn')}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {trashBin.length > 0 ? (
                    trashBin.map((p) => (
                      <div key={p.id} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--panel-hover)] flex flex-col justify-between group">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="font-mono text-[9px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded uppercase">
                              {lang === 'vn' ? 'THÙNG RÁC' : 'TRASHED'} {p.id}
                            </span>
                            <span className="text-[9px] text-[var(--text-muted)] font-mono">
                              {lang === 'vn' ? 'Đã xóa' : 'Deleted'}: {p.deletedAt ? new Date(p.deletedAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[var(--text-main)] mt-2 truncate group-hover:text-amber-400 transition-colors uppercase font-mono">
                            {p.name}
                          </h4>
                          <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">{p.description || (lang === 'vn' ? 'Không có mô tả.' : 'No info provided.')}</p>
                        </div>

                        <div className="border-t border-[var(--border)] pt-3 mt-4 flex items-center justify-between text-[10px] font-mono">
                          <button
                            onClick={() => restoreProjectFromTrash(p.id)}
                            className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>{t('restore')}</span>
                          </button>
                          <button
                            onClick={() => permanentlyDeleteProject(p.id)}
                            className="text-rose-500 hover:underline cursor-pointer font-bold"
                          >
                            {t('permanentlyDelete')}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center col-span-2 text-[var(--text-muted)] text-xs font-mono border border-dashed border-[var(--border)] rounded-xl bg-black/40">
                      {lang === 'vn' 
                        ? 'Thùng rác sạch sẽ. Chưa có dự án nào được xóa tạm thời.' 
                        : 'Trash Bin is clean. No safety-deleted projects found.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* F. VIEW: SETTINGS VIEW */}
          {currentView === 'settings' && (
            <div className="space-y-8 animate-fade-in" id="settings-view-engine-console">
              {/* Header Title Banner */}
              <div className="p-6 rounded-3xl border border-white/10 bg-gradient-to-r from-black/80 to-[#0A0A0A] backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-mono font-black tracking-widest text-[#D9FF1F] uppercase flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#D9FF1F]" />
                    <span>{lang === 'vn' ? 'HỆ ĐIỀU HÀNH SẢN XUẤT AUDIO-VISUAL HIDRO AI' : 'HIDRO AI AUDIO-VISUAL PRODUCTION OPERATING SYSTEM'}</span>
                  </h3>
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    {lang === 'vn' 
                      ? 'Thiết lập tham số lõi, quản lý khóa kết nối API và tối ưu hóa hệ thống kết xuất đám mây' 
                      : 'Configure core parameters, register secure API connection keys, and optimize cloud rendering engines'}
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] bg-white/[0.03] border border-white/5 px-3 py-1.5 rounded-full select-none">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  <span className="text-gray-300 font-bold">CORE_OS: v2.0_STABLE</span>
                </div>
              </div>

              {/* Grid 1: Model Manager, Presets, Queue & AI Router / Cost Center */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Defaults Configurator (7 cols) */}
                <div className="lg:col-span-7 p-6 rounded-3xl border border-white/10 bg-[#0A0A0A] backdrop-blur-xl space-y-6">
                  <h4 className="text-xs font-mono font-extrabold tracking-wider text-white uppercase flex items-center gap-2 border-b border-white/5 pb-3">
                    <Sliders className="w-4 h-4 text-[#D9FF1F]" />
                    <span>{lang === 'vn' ? 'ĐỘNG CƠ MẠC ĐỊNH, PRESETS & HÀNG ĐỢI' : 'DEFAULT ENGINES, PRESETS & QUEUE'}</span>
                  </h4>

                  {/* Preset & Queue Block */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-white/5 pb-4">
                    {/* Workspace Presets */}
                    <div>
                      <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold mb-2 flex items-center gap-1">
                        <span className="text-[#D9FF1F]">⭐</span>
                        <span>{lang === 'vn' ? 'Cấu Hình Mẫu (Production Preset)' : 'Production Preset'}</span>
                      </label>
                      <select 
                        value={workspacePreset}
                        onChange={(e) => applyPreset(e.target.value)}
                        className="w-full bg-black/60 text-xs text-white font-mono p-3 rounded-xl border border-[#D9FF1F]/30 outline-none focus:border-[#D9FF1F] transition-all cursor-pointer font-black text-[#D9FF1F]"
                      >
                        <option value="Standard" className="text-white">{lang === 'vn' ? 'Tự Chọn (Custom Setup)' : 'Custom Setup'}</option>
                        <option value="TikTok UGC" className="text-white">TikTok UGC</option>
                        <option value="Shopee Affiliate" className="text-white">Shopee Affiliate</option>
                        <option value="Product TVC" className="text-white">Product TVC</option>
                        <option value="YouTube Documentary" className="text-white">YouTube Documentary</option>
                        <option value="AI News" className="text-white">AI News</option>
                        <option value="Real Estate" className="text-white">Real Estate</option>
                        <option value="Education" className="text-white">Education</option>
                      </select>
                    </div>

                    {/* Rendering Queue Strategy */}
                    <div>
                      <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold mb-2 flex items-center gap-1">
                        <span className="text-[#D9FF1F]">⚡</span>
                        <span>{lang === 'vn' ? 'Chiến Lược Hàng Đợi Render' : 'Render Queue Strategy'}</span>
                      </label>
                      <select 
                        value={renderQueueStrategy}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRenderQueueStrategy(val);
                          localStorage.setItem('hidro_render_queue_strategy', val);
                          setMaintenanceLogs(p => [`[${new Date().toLocaleTimeString()}] [QUEUE STRATEGY] Switch strategy to ${val}`, ...p.slice(0, 10)]);
                        }}
                        className="w-full bg-black/60 text-xs text-white font-mono p-3 rounded-xl border border-white/15 outline-none focus:border-[#D9FF1F] transition-all cursor-pointer"
                      >
                        <option value="Sequential">○ Sequential (Từng Cảnh)</option>
                        <option value="Parallel">○ Parallel (Multi-stream)</option>
                        <option value="Maximum Speed">⚡ Maximum Speed</option>
                        <option value="Maximum Consistency">🛡️ Maximum Consistency</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Image Engine */}
                    <div>
                      <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold mb-2">
                        {lang === 'vn' ? 'Động Cơ Tạo Ảnh Mặc Định' : 'Default Image Engine'}
                      </label>
                      <select 
                        value={defaultImageModel}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDefaultImageModel(val);
                          localStorage.setItem('hidro_default_image_model', val);
                          setMaintenanceLogs(p => [`[${new Date().toLocaleTimeString()}] [IMAGE ENGINE] Default switched to "${val}"`, ...p.slice(0, 10)]);
                        }}
                        className="w-full bg-black/60 text-xs text-white font-mono p-3 rounded-xl border border-white/15 outline-none focus:border-[#D9FF1F] transition-all cursor-pointer"
                      >
                        <optgroup label="GOOGLE CLOUD APIS">
                          <option value="Imagen 4 Fast">Imagen 4 Fast (Rapid Draft)</option>
                          <option value="Imagen 4 Pro">Imagen 4 Pro (Advanced Detailed)</option>
                          <option value="Imagen 4 Ultra">Imagen 4 Ultra (Commercial Grade)</option>
                          <option value="Imagen 3 Legacy">Imagen 3 Legacy (Retro Look)</option>
                        </optgroup>
                        <optgroup label="OPENAI DALL-E FAMILY">
                          <option value="GPT Image 1 Fast">GPT Image 1 Fast</option>
                          <option value="GPT Image 1 High Quality">GPT Image 1 HQ</option>
                          <option value="GPT Image 1 Commercial">GPT Image 1 Commercial</option>
                        </optgroup>
                        <optgroup label="FLUX OPEN SOURCED">
                          <option value="Flux Schnell">Flux Schnell (Speed optimized)</option>
                          <option value="Flux Dev">Flux Dev (Quality level)</option>
                          <option value="Flux Pro 1.1">Flux Pro 1.1 (Premium Photorealistic)</option>
                          <option value="Flux Ultra">Flux Ultra (Cinematic)</option>
                        </optgroup>
                        <optgroup label="IDEOGRAM">
                          <option value="Ideogram 3 Fast">Ideogram 3 Fast</option>
                          <option value="Ideogram 3 Quality">Ideogram 3 Quality (Perfect Text)</option>
                        </optgroup>
                        <optgroup label="RECRAFT PRO">
                          <option value="Recraft V3">Recraft V3 (Branding Graphic)</option>
                          <option value="Recraft Realistic">Recraft Realistic</option>
                          <option value="Recraft Product Photo">Recraft Product Photo</option>
                        </optgroup>
                        <optgroup label="MIDJOURNEY EMULATOR">
                          <option value="Midjourney V7">Midjourney V7</option>
                          <option value="Midjourney V7 Raw">Midjourney V7 Raw (Artistic)</option>
                        </optgroup>
                        <optgroup label="CHARACTER CONSISTENCY MODEL">
                          <option value="Nano Banana 2">Nano Banana 2 (Standard consistent)</option>
                          <option value="Nano Banana Pro">Nano Banana Pro (Premium Lock)</option>
                          <option value="Character DNA Lock">Character DNA Lock (Strict profile)</option>
                          <option value="Product DNA Lock">Product DNA Lock</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* Video Engine */}
                    <div>
                      <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold mb-2">
                        {lang === 'vn' ? 'Động Cơ Động Lực Video Mặc Định' : 'Default Motion Dynamics Engine'}
                      </label>
                      <select 
                        value={defaultVideoModel}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDefaultVideoModel(val);
                          localStorage.setItem('hidro_default_video_model', val);
                          setMaintenanceLogs(p => [`[${new Date().toLocaleTimeString()}] [VIDEO ENGINE] Default switched to "${val}"`, ...p.slice(0, 10)]);
                        }}
                        className="w-full bg-black/60 text-xs text-white font-mono p-3 rounded-xl border border-white/15 outline-none focus:border-[#D9FF1F] transition-all cursor-pointer"
                      >
                        <optgroup label="GOOGLE VEO INFRASTRUCTURE">
                          <option value="Veo 3 Fast">Veo 3 Fast (Instant Rendering)</option>
                          <option value="Veo 3 Quality">Veo 3 Quality (Detailed motion)</option>
                          <option value="Veo 3.1 Cinematic Quality">Veo 3.1 Cinematic Quality (1080p, Frame consistent)</option>
                          <option value="Veo 3 Ultra">Veo 3 Ultra (Pure Cinema)</option>
                        </optgroup>
                        <optgroup label="KLING INDEPENDENT LABS">
                          <option value="Kling 2.1 Standard">Kling 2.1 Standard</option>
                          <option value="Kling 2.1 Pro">Kling 2.1 Pro (Heavy physics)</option>
                          <option value="Kling 2.1 Master">Kling 2.1 Master (UGC level)</option>
                        </optgroup>
                        <optgroup label="RUNWAY RESHARING">
                          <option value="Runway Gen 4 Turbo">Runway Gen 4 Turbo (High efficiency)</option>
                          <option value="Runway Gen 4">Runway Gen 4</option>
                          <option value="Runway Director Mode">Runway Director Mode (Dolly & Pan control)</option>
                        </optgroup>
                        <optgroup label="HAILUO LABS">
                          <option value="Hailuo 02 Fast">Hailuo 02 Fast</option>
                          <option value="Hailuo 02 Director">Hailuo 02 Director (Extremely organic)</option>
                        </optgroup>
                        <optgroup label="SEEDANCE ARTWORKS">
                          <option value="Seedance Lite">Seedance Lite</option>
                          <option value="Seedance Pro">Seedance Pro (Aesthetics specialized)</option>
                        </optgroup>
                        <optgroup label="PIXVERSE EMERGE">
                          <option value="PixVerse V5">PixVerse V5 (Rapid cinematic)</option>
                          <option value="PixVerse V5 Fast">PixVerse V5 Fast</option>
                        </optgroup>
                        <optgroup label="LUMA DREAM FIELD">
                          <option value="Luma Dream Machine">Luma Dream Machine (Creative physics)</option>
                          <option value="Luma Ray2">Luma Ray2</option>
                        </optgroup>
                        <optgroup label="PIKA CLOUD INTERFACE">
                          <option value="Pika 2.2">Pika 2.2 (Anime/Comic styles)</option>
                          <option value="Pika Turbo">Pika Turbo (Social shorts)</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {/* Voice & Prompt Architectures Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                    {/* Voice Engine Setting */}
                    <div>
                      <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold mb-2 flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5 text-[#D9FF1F]" />
                        <span>{lang === 'vn' ? 'Động Cơ Giọng Nói (Voice Engine)' : 'Voice Engine'}</span>
                      </label>
                      <select 
                        value={defaultVoiceEngine}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDefaultVoiceEngine(val);
                          localStorage.setItem('hidro_default_voice_engine', val);
                          setMaintenanceLogs(p => [`[${new Date().toLocaleTimeString()}] [VOICE ENGINE] Switched speech synthesis to ${val}`, ...p.slice(0, 10)]);
                        }}
                        className="w-full bg-black/60 text-xs text-white font-mono p-3 rounded-xl border border-white/15 outline-none focus:border-[#D9FF1F] transition-all cursor-pointer"
                      >
                        <option value="ElevenLabs">ElevenLabs Multi-lingual V2</option>
                        <option value="Gemini TTS">Gemini TTS Ultra-HD</option>
                        <option value="OpenAI Voice">OpenAI Voice Whisper Express</option>
                        <option value="Azure Speech">Azure Neural Speech Framework</option>
                        <option value="Cartesia">Cartesia Sonic-Pulse Backend</option>
                      </select>
                    </div>

                    {/* Prompt Architecture Setting */}
                    <div>
                      <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold mb-2 flex items-center gap-1">
                        <span className="text-[#D9FF1F]">🧬</span>
                        <span>{lang === 'vn' ? 'Cấu Trúc prompt (Prompt Architecture)' : 'Prompt Architecture'}</span>
                      </label>
                      <select 
                        value={promptArchitecture}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPromptArchitecture(val);
                          localStorage.setItem('hidro_prompt_architecture', val);
                          setMaintenanceLogs(p => [`[${new Date().toLocaleTimeString()}] [PROMPT ENGINE] Restructured system instructions with "${val}" DNA.`, ...p.slice(0, 10)]);
                        }}
                        className="w-full bg-black/60 text-xs text-white font-mono p-3 rounded-xl border border-white/15 outline-none focus:border-[#D9FF1F] transition-all cursor-pointer font-bold"
                      >
                        <option value="Standard">Standard Prompt Blueprint</option>
                        <option value="DoDo Veo">DoDo Veo High Density</option>
                        <option value="Hidro DNA">Hidro DNA Multi-agent System</option>
                        <option value="Cinematic Director">Cinematic Director Angles</option>
                        <option value="TikTok Viral">TikTok Viral Organic Hook</option>
                        <option value="Product TVC">Product TVC High-end Advertisement</option>
                      </select>
                    </div>
                  </div>

                  {/* AI ROUTER TRIGGER MODULE */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-[#D9FF1F]" />
                          <span> {lang === 'vn' ? 'ĐIỀU PHỐI VIÊN AUTOMATIC AI ROUTER' : 'AUTOMATIC AI ROUTER COORDINATION'}</span>
                        </div>
                        <p className="text-[9px] text-gray-500 font-mono">
                          {lang === 'vn' 
                            ? 'Tự động chọn động cơ tối ưu cho từng cảnh và loại hình phương tiện truyền thông' 
                            : 'Orchestrates the ideal engine autonomously for each visual context type'}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          const nextVal = !isAutoAiRouter;
                          setIsAutoAiRouter(nextVal);
                          localStorage.setItem('hidro_auto_ai_router', String(nextVal));
                          setMaintenanceLogs(p => [`[${new Date().toLocaleTimeString()}] [AI ROUTER] Router toggled to ${nextVal ? 'ENABLED' : 'DISABLED'}`, ...p.slice(0, 10)]);
                        }}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-mono font-extrabold uppercase transition-all duration-300 border flex items-center gap-1.5 cursor-pointer ${
                          isAutoAiRouter
                            ? 'bg-[#D9FF1F]/10 border-[#D9FF1F] text-[#D9FF1F]'
                            : 'bg-white/5 border-white/10 text-gray-500'
                        }`}
                      >
                        {isAutoAiRouter ? <Check className="w-3 h-3 text-[#D9FF1F]" /> : ''}
                        <span>{isAutoAiRouter ? (lang === 'vn' ? 'ĐANG BẬT' : 'ENABLED') : (lang === 'vn' ? 'CẤU HÌNH TAY' : 'MANUAL OVERWRITE')}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: AI Router strategic mapping and interactive Cost Estimator (5 cols) */}
                <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
                  {/* Strategic Target Map Box */}
                  <div className="p-5 rounded-3xl border border-white/10 bg-[#0A0A0A] backdrop-blur-xl space-y-4">
                    <h4 className="text-xs font-mono font-extrabold tracking-wider text-white uppercase flex items-center justify-between border-b border-white/5 pb-2.5">
                      <span>🎯 {lang === 'vn' ? 'KỊCH BẢN ĐIỀU PHỐI MATRIX' : 'ROUTER STRATEGIC TARGET MAP'}</span>
                      <span className={`text-[8px] font-mono px-2 py-0.5 rounded uppercase ${
                        isAutoAiRouter ? 'bg-[#D9FF1F]/10 text-[#D9FF1F]' : 'bg-red-400/10 text-red-400'
                      }`}>
                        {isAutoAiRouter ? (lang === 'vn' ? 'Tối ưu hóa' : 'Optimizing') : (lang === 'vn' ? 'Đang tăt' : 'Muted')}
                      </span>
                    </h4>

                    <div className="text-[9px] font-mono text-gray-400 divide-y divide-white/5 max-h-[140px] overflow-y-auto pr-1">
                      {[
                        { task: lang === 'vn' ? 'Ảnh sản phẩm' : 'Product Photo', opt: lang === 'vn' ? 'Độ sắc chi tiết' : 'Sharp textures', engine: 'Recraft V3' },
                        { task: lang === 'vn' ? 'Character DNA' : 'Character DNA', opt: lang === 'vn' ? 'Khóa DNA khuôn mặt' : 'Strict consistency', engine: 'Nano Banana Pro' },
                        { task: lang === 'vn' ? 'Giữ chữ sắc nét' : 'Typography Lens', opt: lang === 'vn' ? 'Vẽ text không lỗi' : 'Legible fonts rendering', engine: 'Ideogram 3 Q.' },
                        { task: lang === 'vn' ? 'Commercial TVC' : 'Commercial TVC', opt: lang === 'vn' ? 'Ánh sáng rạp phim' : 'High-fidelity cinema', engine: 'Flux Pro 1.1' },
                        { task: lang === 'vn' ? 'Talking Head/Voice' : 'Talking UGC Host', opt: lang === 'vn' ? 'Đồng bộ khuôn mặt' : 'Smooth lipsync blend', engine: 'Veo 3.1 Cinematic' },
                        { task: lang === 'vn' ? 'TikTok UGC Shorts' : 'TikTok UGC Feed', opt: lang === 'vn' ? 'Sự chú ý 3s đầu' : 'High engagement hooks', engine: 'Kling Standard' },
                        { task: lang === 'vn' ? 'Vật lý chuyển động' : 'Rigid physics simulation', opt: lang === 'vn' ? 'Camera 3D mượt' : 'Fluid cinematic flow', engine: 'Runway Gen 4' },
                      ].map((item, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between">
                          <span className="font-bold text-gray-200">{item.task}</span>
                          <span className="text-gray-500 text-[8px]">{item.opt}</span>
                          <span className="text-[#D9FF1F] font-black">{item.engine}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 💰 COST CENTER Card */}
                  <div className="p-5 rounded-3xl border border-white/10 bg-[#0A0A0A] backdrop-blur-xl space-y-4">
                    <h4 className="text-xs font-mono font-extrabold tracking-wider text-white uppercase flex items-center justify-between border-b border-white/5 pb-2.5">
                      <span className="flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-[#D9FF1F]" />
                        <span>{lang === 'vn' ? '💰 PHÂN PHỐI CHI PHÍ' : '💰 COST CENTER'}</span>
                      </span>
                      <span className="text-[8px] font-mono bg-[#D9FF1F]/10 text-[#D9FF1F] px-1.5 py-0.5 rounded uppercase font-black">ESTIMATE</span>
                    </h4>

                    {/* Cost inputs */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8px] font-mono text-gray-500 uppercase font-black mb-1">
                          {lang === 'vn' ? 'Số Cảnh (Scenes)' : 'Scenes'}
                        </label>
                        <div className="flex items-center gap-1 bg-black/60 border border-white/10 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => setCostScenes(p => Math.max(1, p - 1))}
                            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-white font-mono font-bold flex items-center justify-center cursor-pointer select-none"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            value={costScenes}
                            onChange={(e) => setCostScenes(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full bg-transparent text-center font-bold text-white text-[10px] outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setCostScenes(p => p + 1)}
                            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-white font-mono font-bold flex items-center justify-center cursor-pointer select-none"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[8px] font-mono text-gray-500 uppercase font-black mb-1">
                          {lang === 'vn' ? 'Thời Lượng (s)' : 'Duration'}
                        </label>
                        <div className="flex items-center gap-1 bg-black/60 border border-white/10 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => setCostDuration(p => Math.max(1, p - 4))}
                            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-white font-mono font-bold flex items-center justify-center cursor-pointer select-none"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            value={`${costDuration}s`}
                            onChange={(e) => setCostDuration(Math.max(1, parseInt(e.target.value.replace('s', '')) || 0))}
                            className="w-full bg-transparent text-center font-bold text-white text-[10px] outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setCostDuration(p => p + 4)}
                            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-white font-mono font-bold flex items-center justify-center cursor-pointer select-none"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic math details */}
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl font-mono text-[9px] text-gray-400 space-y-1.5">
                      <div className="flex justify-between items-center text-gray-300">
                        <span>Images:</span>
                        <span className="font-bold text-white">${(costScenes * 0.0225).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-300">
                        <span>Videos:</span>
                        <span className="font-bold text-white">${(costDuration * 0.0384).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-300">
                        <span>Voice:</span>
                        <span className="font-bold text-white">${(costDuration * 0.0019).toFixed(2)}</span>
                      </div>
                      <div className="h-[1px] bg-white/5 my-1" />
                      <div className="flex justify-between items-center text-xs text-[#D9FF1F] font-black">
                        <span>{lang === 'vn' ? 'Tổng Chi Phí:' : 'Total Cost:'}</span>
                        <span>${((costScenes * 0.0225) + (costDuration * 0.0384) + (costDuration * 0.0019)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid 2: Secure API Vault Manager */}
              <div className="p-6 rounded-3xl border border-white/10 bg-[#0A0A0A] backdrop-blur-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-mono font-extrabold tracking-wider text-white uppercase flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#D9FF1F]" />
                      <span>{lang === 'vn' ? 'API CREDENTIALS & SECURE ENGINES CONNECTIONS' : 'API CREDENTIALS & SECURE ENGINES VAULT'}</span>
                    </h4>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {lang === 'vn' 
                        ? 'Đăng ký các Token hoặc API key của bạn để liên kết nền tảng sinh đám mây. Khóa của bạn được mã hóa hoàn toàn cục bộ.'
                        : 'Register authorization tokens. Keys are safely localized on your browser container sandbox.'}
                    </p>
                  </div>

                  <button
                    onClick={() => saveApiKeys(apiKeys)}
                    className="px-4 py-2 bg-[#D9FF1F] hover:bg-[#c4e613] text-black rounded-xl text-xs font-mono font-black flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{lang === 'vn' ? 'Cập Nhật Token Vault' : 'Secure and Save Keys'}</span>
                  </button>
                </div>

                {apiSaveState && (
                  <div className="p-3 bg-[#61ff8f]/10 border border-[#61ff8f]/20 text-[#61ff8f] text-xs font-mono rounded-xl animate-fade-in flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#61ff8f] animate-ping" />
                    <span>{lang === 'vn' ? 'Mã hóa kết nối thành công! Khóa API của bạn đã được cập nhật.' : 'Connection encryption synchronized! Cryptographic key saved.'}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {([
                    { label: 'Google AI API', id: 'googleAI', ph: 'AIzaSy...' },
                    { label: 'OpenAI API Token', id: 'openAI', ph: 'sk-proj-...' },
                    { label: 'Replicate API Key', id: 'replicate', ph: 'r8_...' },
                    { label: 'Fal AI Access Key', id: 'fal', ph: 'fal_...' },
                    { label: 'Runway API Auth', id: 'runway', ph: 'r_...' },
                    { label: 'Kling API Engine', id: 'kling', ph: 'k_...' },
                    { label: 'Hailuo Stream Key', id: 'hailuo', ph: 'hl_...' },
                    { label: 'Stability AI Vector', id: 'stability', ph: 'sk-...' },
                    { label: 'ElevenLabs API Token', id: 'elevenLabs', ph: 'el_...' },
                    { label: 'Google Drive OAuth ID', id: 'gdriveOAuth', ph: '12345678-...' },
                    { label: 'Supabase DB URL', id: 'supabaseUrl', ph: 'https://xxx.supabase.co' },
                    { label: 'Supabase Service Key', id: 'supabaseKey', ph: 'eyJhbGci...' },
                    { label: 'Cloudflare R2 API Key', id: 'cloudflareR2', ph: 'cf_r2_access_key...' },
                    { label: 'AWS S3 CDN Key', id: 'awsS3', ph: 's3_access_key...' }
                  ] as const).map((api) => {
                    const status = getApiKeyStatus(api.id);
                    const show = showKeyField[api.id];

                    return (
                      <div key={api.id} className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3 hover:border-white/10 transition-colors flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-gray-200 font-bold">{api.label}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold flex items-center gap-1 ${
                              status === 'Connected' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-gray-500'
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${status === 'Connected' ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                              {status === 'Connected' ? (lang === 'vn' ? 'ĐÃ KẾT NỐI' : 'CONNECTED') : (lang === 'vn' ? 'CHƯA LIÊN KẾT' : 'NOT CONNECTED')}
                            </span>
                          </div>
                        </div>

                        <div className="relative mt-2">
                          <input
                            type={show ? 'text' : 'password'}
                            value={apiKeys[api.id]}
                            placeholder={api.ph}
                            onChange={(e) => {
                              const v = e.target.value;
                              setApiKeys(prev => ({ ...prev, [api.id]: v }));
                            }}
                            className="w-full bg-black/60 text-xs text-white font-mono p-2.5 pr-8 rounded-lg border border-white/10 focus:border-[#D9FF1F] outline-none transition-all placeholder:text-gray-700 font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => setShowKeyField(prev => ({ ...prev, [api.id]: !prev[api.id] }))}
                            className="absolute right-2 top-2.5 text-gray-500 hover:text-white transition-colors cursor-pointer"
                          >
                            {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid 3: Render Profiles & System Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Panel left: Render Output configuration (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Card 1: Base Export & Backups */}
                  <div className="p-6 rounded-3xl border border-white/10 bg-[#0A0A0A] backdrop-blur-xl space-y-6 animate-fade-in">
                    <h4 className="text-xs font-mono font-extrabold tracking-wider text-white uppercase flex items-center gap-2 border-b border-white/5 pb-3">
                      <FileVideo className="w-4 h-4 text-[#D9FF1F]" />
                      <span>{lang === 'vn' ? 'CẤU HÌNH PIPELINE XUẤT BẢN VIDEO' : 'VIDEO COMPILER PRODUCTION PROFILE'}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Resolution Quality */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">
                          {lang === 'vn' ? 'Độ Phân Giải Kết Xuất' : 'Output Resolution'}
                        </label>
                        <select
                          value={outputQuality}
                          onChange={(e) => changeQuality(e.target.value)}
                          className="w-full bg-black/60 text-xs text-white p-2.5 rounded-lg border border-white/10 focus:border-[#D9FF1F] outline-none font-mono cursor-pointer"
                        >
                          <option value="720p">720p HD</option>
                          <option value="1080p">1080p Full HD</option>
                          <option value="2K">1440p 2K</option>
                          <option value="4K">2160p 4K UHD</option>
                        </select>
                      </div>

                      {/* Target FPS */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">
                          {lang === 'vn' ? 'Tỉ Lệ Khung Hình / Giây' : 'Render Frame Rate (FPS)'}
                        </label>
                        <select
                          value={fpsSetting}
                          onChange={(e) => changeFps(e.target.value)}
                          className="w-full bg-black/60 text-xs text-white p-2.5 rounded-lg border border-white/10 focus:border-[#D9FF1F] outline-none font-mono cursor-pointer"
                        >
                          <option value="24">24 FPS (Traditional Cinematic)</option>
                          <option value="30">30 FPS (Recommended TVC / TikTok)</option>
                          <option value="60">60 FPS (Ultra-smooth high dynamic)</option>
                        </select>
                      </div>

                      {/* Aspect Ratio */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">
                          {lang === 'vn' ? 'Tỷ Lệ Khung Ảnh Gốc' : 'Canvas Aspect Ratio'}
                        </label>
                        <select
                          value={aspectRatioSetting}
                          onChange={(e) => changeAspectRatio(e.target.value)}
                          className="w-full bg-black/60 text-xs text-white p-2.5 rounded-lg border border-white/10 focus:border-[#D9FF1F] outline-none font-mono cursor-pointer"
                        >
                          <option value="9:16">9:16 (Vertical TikTok / Studio)</option>
                          <option value="16:9">16:9 (Horizontal TVC / Landscape)</option>
                          <option value="1:1">1:1 (Square Instagram)</option>
                          <option value="4:5">4:5 (Standard Social Grid)</option>
                          <option value="21:9">21:9 (Ultra-wide Cinemascope)</option>
                        </select>
                      </div>
                    </div>

                    {/* PROJECT AUTO BACKUP MECHANISM */}
                    <div className="border-t border-white/5 pt-4 space-y-3">
                      <div className="text-[10px] font-mono text-white font-extrabold uppercase flex items-center gap-1.5 text-gray-300">
                        <span>💾</span>
                        <span>{lang === 'vn' ? 'LIÊN KẾT SAO LƯU & AN TOÀN DỮ LIỆU' : 'PROJECT BACKUP & DATA FAULTY INTEGRITY'}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Auto save 30s */}
                        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={isAutoSave30s}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setIsAutoSave30s(val);
                              localStorage.setItem('hidro_autosave_30s', String(val));
                              setMaintenanceLogs(p => [`[${new Date().toLocaleTimeString()}] [BACKUP ENGINE] Auto save 30s toggled to ${val ? 'ENABLED' : 'DISABLED'}`, ...p.slice(0, 10)]);
                            }}
                            className="rounded accent-[#D9FF1F]"
                          />
                          <div className="text-[9px] font-mono text-gray-300 leading-tight">
                            <span className="block font-black">{lang === 'vn' ? 'Tự Động Lưu (30s)' : 'Auto Save (30s)'}</span>
                            <span className="text-[8px] text-gray-500">{lang === 'vn' ? 'Bảo lưu bộ đệm' : 'Continuous buffering'}</span>
                          </div>
                        </label>

                        {/* Local Storage Backup */}
                        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={isLocalStorageBackup}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setIsLocalStorageBackup(val);
                              localStorage.setItem('hidro_local_backup', String(val));
                              setMaintenanceLogs(p => [`[${new Date().toLocaleTimeString()}] [BACKUP ENGINE] Local Storage save state: ${val ? 'ON' : 'OFF'}`, ...p.slice(0, 10)]);
                            }}
                            className="rounded accent-[#D9FF1F]"
                          />
                          <div className="text-[9px] font-mono text-gray-300 leading-tight">
                            <span className="block font-black">{lang === 'vn' ? 'Lưu Trữ Cục Bộ' : 'Local Storage'}</span>
                            <span className="text-[8px] text-gray-500">{lang === 'vn' ? 'Tránh reload mất app' : 'Sandbox storage'}</span>
                          </div>
                        </label>

                        {/* Google Drive sync */}
                        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={isGoogleDriveBackupSync}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setIsGoogleDriveBackupSync(val);
                              localStorage.setItem('hidro_gdrive_sync_backup', String(val));
                              setMaintenanceLogs(p => [`[${new Date().toLocaleTimeString()}] [BACKUP ENGINE] Google Drive OAuth Sync: ${val ? 'LINKED' : 'MUTED'}`, ...p.slice(0, 10)]);
                            }}
                            className="rounded accent-[#D9FF1F]"
                          />
                          <div className="text-[9px] font-mono text-gray-300 leading-tight">
                            <span className="block font-black">Google Drive Sync</span>
                            <span className="text-[8px] text-gray-500">{lang === 'vn' ? 'Đồng bộ hóa đám mây' : 'OAuth real-time sync'}</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="p-4 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
                      <div className="space-y-0.5 text-center sm:text-left">
                        <div className="text-[10px] font-mono text-white font-bold">{lang === 'vn' ? 'ĐỒNG BỘ DỰ ÁN CỦA BẠN' : 'EXPORT WORKSPACE CONFIGS'}</div>
                        <p className="text-[8px] text-gray-500 font-mono">{lang === 'vn' ? 'Kết xuất toàn bộ gói thiết lập ra file cấu hình máy khách (.json)' : 'Compile complete settings into single client profile (.json)'}</p>
                      </div>
                      <button
                        onClick={() => {
                          try {
                            const configPackage = {
                              defaultImageModel,
                              defaultVideoModel,
                              isAutoAiRouter,
                              outputQuality,
                              fpsSetting,
                              aspectRatioSetting,
                              defaultVoiceEngine,
                              promptArchitecture,
                              renderQueueStrategy,
                              workspacePreset,
                              advancedSliders: {
                                seed: advancedSeed,
                                consistency: advancedConsistency,
                                charLock: advancedCharLock,
                                productLock: advancedProductLock,
                                motion: advancedMotion,
                                camera: advancedCameraFreedom,
                                physics: advancedPhysics
                              },
                              exportedAt: new Date().toISOString()
                            };
                            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(configPackage, null, 2));
                            const dlAnchorElem = document.createElement('a');
                            dlAnchorElem.setAttribute("href",     dataStr     );
                            dlAnchorElem.setAttribute("download", `hidro_os_settings_${Date.now()}.json`);
                            dlAnchorElem.click();
                            setMaintenanceLogs(p => [`[${new Date().toLocaleTimeString()}] [SYSTEM CONFIG] Settings backup compile downloaded successfully.`, ...p.slice(0, 10)]);
                          } catch {}
                        }}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[9px] font-mono border border-white/5 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Download className="w-3 h-3 text-gray-400" />
                        <span>{lang === 'vn' ? 'Tải backup cấu hình' : 'Export Profile'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Advanced Rendering Options (Sliders) */}
                  <div className="p-6 rounded-3xl border border-white/10 bg-[#0A0A0A] backdrop-blur-xl space-y-6">
                    <h4 className="text-xs font-mono font-extrabold tracking-wider text-white uppercase flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="flex items-center gap-2">🕹️ {lang === 'vn' ? 'ĐIỀU CHỈNH HỆ SỐ KẾT XUẤT NÂNG CAO' : 'ADVANCED RENDERING SYSTEMS (COEFFICIENTS)'}</span>
                      <button 
                        onClick={() => {
                          setAdvancedSeed('42');
                          setAdvancedConsistency(85);
                          setAdvancedCharLock(90);
                          setAdvancedProductLock(75);
                          setAdvancedMotion(60);
                          setAdvancedCameraFreedom(50);
                          setAdvancedPhysics(40);
                          localStorage.setItem('hidro_advanced_seed', '42');
                          localStorage.setItem('hidro_adv_consistency', '85');
                          localStorage.setItem('hidro_adv_charlock', '90');
                          localStorage.setItem('hidro_adv_productlock', '75');
                          localStorage.setItem('hidro_adv_motion', '60');
                          localStorage.setItem('hidro_adv_camera', '50');
                          localStorage.setItem('hidro_adv_physics', '40');
                          setMaintenanceLogs(p => [`[${new Date().toLocaleTimeString()}] [COEFFICIENTS] Reset rendering parameters to OS standard.`, ...p.slice(0, 10)]);
                        }}
                        className="text-[9px] font-mono text-[#D9FF1F] hover:underline cursor-pointer"
                      >
                        {lang === 'vn' ? 'ĐẶT LẠI' : 'RESET'}
                      </button>
                    </h4>

                    <div className="space-y-4">
                      {/* Seed input */}
                      <div>
                        <div className="flex justify-between items-center mb-1 text-[9px] font-mono uppercase">
                          <span className="font-bold text-gray-300">{lang === 'vn' ? 'Seed Mặc Định (Render Seed)' : 'Renderer Core Seed'}</span>
                          <span className="text-gray-500 font-bold">{advancedSeed}</span>
                        </div>
                        <input 
                          type="text"
                          value={advancedSeed}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9-]/g, '');
                            setAdvancedSeed(val);
                            localStorage.setItem('hidro_advanced_seed', val);
                          }}
                          placeholder="-1 for random"
                          className="w-full bg-black/60 text-xs text-white p-2 px-3 rounded-lg border border-white/10 font-mono focus:border-[#D9FF1F] outline-none transition-all placeholder:text-gray-700 font-bold"
                        />
                      </div>

                      {/* Sliders Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { label: lang === 'vn' ? 'Độ Nhất Quán Cảnh' : 'Consistency Strength', val: advancedConsistency, set: setAdvancedConsistency, key: 'hidro_adv_consistency', min: 10, max: 100, unit: '%' },
                          { label: lang === 'vn' ? 'Khóa DNA Nhân Vật' : 'Character Lock Strength', val: advancedCharLock, set: setAdvancedCharLock, key: 'hidro_adv_charlock', min: 10, max: 100, unit: '%' },
                          { label: lang === 'vn' ? 'Khóa Thiết Kế Sản Phẩm' : 'Product Lock Strength', val: advancedProductLock, set: setAdvancedProductLock, key: 'hidro_adv_productlock', min: 10, max: 100, unit: '%' },
                          { label: lang === 'vn' ? 'Cường Độ Chuyển Động' : 'Motion Intensity', val: advancedMotion, set: setAdvancedMotion, key: 'hidro_adv_motion', min: 0, max: 100, unit: '%' },
                          { label: lang === 'vn' ? 'Độ Tự Do Camera' : 'Camera Freedom Angle', val: advancedCameraFreedom, set: setAdvancedCameraFreedom, key: 'hidro_adv_camera', min: 0, max: 100, unit: '%' },
                          { label: lang === 'vn' ? 'Mô Phỏng Vật Lý Lõi' : 'Physics Simulation Level', val: advancedPhysics, set: setAdvancedPhysics, key: 'hidro_adv_physics', min: 0, max: 100, unit: '%' },
                        ].map((s) => (
                          <div key={s.key} className="space-y-1 bg-white/[0.01] border border-white/5 p-2.5 rounded-xl">
                            <div className="flex justify-between items-center text-[9px] font-mono">
                              <span className="text-gray-400 font-bold">{s.label}</span>
                              <span className="text-[#D9FF1F] font-black">{s.val}{s.unit}</span>
                            </div>
                            <input 
                              type="range"
                              min={s.min}
                              max={s.max}
                              value={s.val}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                s.set(val);
                                localStorage.setItem(s.key, String(val));
                              }}
                              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#D9FF1F]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panel Right: System Diagnostics & Maintenance Feed (5 cols) */}
                <div className="lg:col-span-5 p-6 rounded-3xl border border-white/10 bg-[#0A0A0A] backdrop-blur-xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono font-extrabold tracking-wider text-white uppercase flex items-center justify-between border-b border-white/5 pb-3">
                      <span>⚙️ {lang === 'vn' ? 'LOG CHẨN ĐOÁN THỜI GIAN THỰC' : 'TELEMETRY & LOGGING FEEDS'}</span>
                      <button
                        onClick={() => {
                          setMaintenanceLogs([
                            `[${new Date().toLocaleTimeString()}] [CACHE CLEANED] Cleared 15.42MB local rendering previews.`,
                            `[${new Date().toLocaleTimeString()}] Buffer garbage collection fully executed.`
                          ]);
                        }}
                        className="text-[8px] font-mono text-[#D9FF1F] hover:underline cursor-pointer"
                      >
                        {lang === 'vn' ? 'XÓA CACHE' : 'CLEAR CACHE'}
                      </button>
                    </h4>

                    {/* Logger terminal */}
                    <div className="bg-black/60 border border-white/5 p-3 rounded-xl space-y-1.5 h-[120px] overflow-y-auto scrollbar-thin text-[8px] font-mono text-emerald-400 select-text leading-relaxed">
                      {maintenanceLogs.map((log, index) => (
                        <div key={index} className="truncate">
                          <span className="text-[#D9FF1F] font-bold">●</span> {log}
                        </div>
                      ))}
                    </div>

                    <div className="text-[10px] font-mono text-gray-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Ingress Tunnel Node:</span>
                        <span className="text-white font-bold select-all">PORT 3000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sandbox Platform:</span>
                        <span className="text-white font-bold select-all">VITE ENGINE DEV MODE</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center gap-2 mt-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-mono font-extrabold text-[#61ff8f] uppercase">
                      {lang === 'vn' ? 'HÀNG RÀO AN TOÀN KẾT NỐI KHỐI KẾT XUẤT' : 'RENDER ENGINES LINK COMPLETED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </section>
      </main>

      {/* ☕ Donate Modal Overlay Popup */}
      {isDonateModalOpen && renderDonateModal()}

      {/* ☕ Donate Pop-up Toast */}
      {donateToast && renderDonateToast()}
    </div>
  );
}

// Sub Component: Interactive Card Grid Layout
function ProjectInteractiveCard({ p, onSelect, onToggleFavorite }: { key?: string; p: Project; onSelect: (proj: Project) => void; onToggleFavorite: (id: string) => void }) {
  const { lang } = useLanguage();
  const statusColors: Record<string, string> = {
    'Completed': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
    'Generating Images': 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse',
    'Writing': 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
    'Draft': 'bg-[var(--panel-hover)] text-[var(--text-muted)] border border-[var(--border)]',
    'Archived': 'bg-zinc-900 text-zinc-500'
  };

  const currentStatus = p.status || 'Draft';

  return (
    <div className="relative group p-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] hover:border-[var(--accent)] hover:bg-[var(--panel-hover)] transition-all duration-300 flex flex-col justify-between">
      <div className="cursor-pointer" onClick={() => onSelect(p)}>
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-[var(--text-muted)] font-semibold">{p.id}</span>
          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${statusColors[currentStatus] || statusColors['Draft']}`}>
            {currentStatus}
          </span>
        </div>

        <h4 className="text-xs font-bold text-[var(--text-main)] mt-2 truncate group-hover:text-[var(--accent)] transition-colors uppercase font-mono">
          {p.name}
        </h4>
        <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-1 leading-relaxed">
          {p.description || (lang === 'vn' ? 'Không có mô tả chi tiết dự án.' : 'No project workflow details provided.')}
        </p>

        <div className="flex gap-1.5 flex-wrap mt-3 text-[8px] font-mono uppercase">
          <span className="px-1.5 py-0.5 bg-teal-500/15 text-teal-300 border border-teal-500/10 rounded">{p.type}</span>
          <span className="px-1.5 py-0.5 bg-blue-500/15 text-blue-300 border border-blue-500/10 rounded">{p.platform}</span>
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-3 mt-3 flex items-center justify-between text-[10px] font-mono">
        <button 
          onClick={() => onSelect(p)}
          className="text-[var(--accent)] hover:underline flex items-center gap-1 font-semibold text-[10px] cursor-pointer"
        >
          <span>{lang === 'vn' ? 'BÀN LÀM VIỆC' : 'WORKSTATION'}</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>

        <button 
          onClick={() => onToggleFavorite(p.id)}
          className={`p-1 rounded transition cursor-pointer ${p.isFavorite ? 'text-amber-400' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>
    </div>
  );
}

// Sub Component: Helper Aggregator Box
function AssetItemPanel({ text, label }: { key?: number; text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const colorMap: Record<string, string> = {
    CH: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5',
    PR: 'border-blue-500/20 text-blue-400 bg-blue-500/5',
    BG: 'border-purple-500/20 text-purple-400 bg-purple-500/5',
    ST: 'border-amber-500/20 text-amber-400 bg-amber-500/5'
  };

  const prefix = label.substring(0, 2);
  const colorClass = colorMap[prefix] || 'border-slate-800 text-slate-400 bg-slate-900/20';

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-3 rounded-xl border ${colorClass} flex flex-col justify-between gap-2 transition duration-300 hover:brightness-110`}>
      <div className="font-mono text-[9px] font-bold tracking-wider opacity-80">{label} ASSET PROMPT</div>
      <p className="text-[10px] text-slate-300 leading-relaxed font-sans font-medium italic line-clamp-2">"{text}"</p>
      <button 
        onClick={handleCopy}
        className="text-[9px] font-mono uppercase bg-slate-950 border border-slate-900 rounded py-1 hover:bg-slate-900 text-slate-400 focus:outline-none shrink-0"
      >
        {copied ? '✓ COPIED' : 'COPY BASE BRIEF'}
      </button>
    </div>
  );
}

// Sub Component: Mini Cloud Storage Status Ticks
function CloudStorageStatus() {
  const { isGDriveConnected } = useProjects();
  return (
    <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-[9px] font-mono uppercase shrink-0">
      <span className={`w-1.5 h-1.5 rounded-full ${isGDriveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
      <span className="text-slate-500">{isGDriveConnected ? 'CLOUD_SECURE' : 'LOCAL_ONLY'}</span>
    </div>
  );
}
