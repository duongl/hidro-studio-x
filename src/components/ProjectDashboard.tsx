import React, { useState } from 'react';
import { useProjects, SyncLog } from '../context/ProjectContext';
import { useBackgroundQueue } from '../context/BackgroundQueueContext';
import { useLanguage } from '../utils/i18n';
import { Project, SocialPlatform, ProjectType } from '../types';
import { 
  Folder, Star, Trash2, Copy, Archive, FolderSymlink, Search, 
  Plus, Settings, Database, Server, RefreshCw, Calendar, 
  ExternalLink, FileVideo, CheckCircle2, AlertCircle, Sparkles, 
  FileText, ShieldCheck, HelpCircle, HardDrive, Layout, 
  Image as ImageIcon, HelpCircle as HelpIcon, ArrowUpRight, ArrowLeft, Languages
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
    clearTrash, localStorageUsage, gdriveUsage, importProjectFile
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

  // Localization dict
  const dbT = {
    en: {
      studioTitle: "HIDRO AI STUDIO",
      studioVersion: "CREATIVE OS V2.0",
      overview: "Dashboard Overview",
      allProjects: "All Projects",
      assetsLib: "Assets Aggregator",
      templates: "Production Blueprints",
      cloudStorage: "Cloud Storage",
      coreSettings: "System Settings",
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
      clientIdHeader: "OAuth Credentials Setting"
    },
    vn: {
      studioTitle: "HIDRO AI STUDIO",
      studioVersion: "HỆ ĐIỀU HÀNH V2.0",
      overview: "Tổng Quan Bản Điều Khiển",
      allProjects: "Danh Sách Dự Án",
      assetsLib: "Kho Tài Nguyên Tổng Hợp",
      templates: "Mẫu Thiết Kế Sản Xuất",
      cloudStorage: "Lưu Trữ Google Drive",
      coreSettings: "Cài Đặt Hệ Thống",
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
      clientIdHeader: "Cấu Hình Thông Số OAuth Client ID"
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
    <div className="flex h-screen w-full bg-slate-950 font-sans text-slate-100 overflow-hidden" id="cro-studio-main-frame">
      {/* 🔮 Left Sidebar - Glass Panel */}
      <aside className="w-64 border-r border-slate-800/60 bg-slate-950/40 backdrop-blur-md flex flex-col justify-between p-4 z-10" id="sidebar-controls">
        <div className="space-y-6">
          {/* Brand/Lounge Logo */}
          <div className="p-3 bg-gradient-to-r from-teal-500/10 via-emerald-500/15 to-blue-500/10 border border-emerald-500/25 rounded-2xl flex items-center gap-3 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 mix-blend-color-dodge filter blur-xl opacity-80 animate-pulse"></div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold tracking-tight text-white leading-tight">{t('studioTitle')}</h2>
              <p className="text-[10px] font-mono tracking-widest text-emerald-400/80 mt-0.5">{t('studioVersion')}</p>
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
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.05)]' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  {isActive && <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-400 rounded-r"></span>}
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  {view.label}
                  {view.id === 'storage' && isGDriveConnected && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Global bottom components */}
        <div className="space-y-3 pt-4 border-t border-slate-800/60 font-mono text-[10px] text-slate-500">
          <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-slate-800/50">
            <span className="flex items-center gap-1.5"><Languages className="w-3.5 h-3.5 text-slate-400" /> Language</span>
            <button 
              onClick={() => setLang(lang === 'vn' ? 'en' : 'vn')}
              className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold uppercase transition hover:bg-emerald-500/30"
            >
              {lang === 'vn' ? 'VIETNAMESE' : 'ENGLISH'}
            </button>
          </div>
          <div>HIDRO STUDIO OPERATIONAL FRAME</div>
        </div>
      </aside>

      {/* 🚀 Main Workstation Client Workspace Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-950/20" id="workbench-dashboard-main">
        {/* Dynamic Matrix Stream Accent Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.02),transparent_40%)] pointer-events-none"></div>

        {/* Header Ribbon View */}
        <header className="h-16 border-b border-slate-800/60 bg-slate-950/60 backdrop-blur-md flex items-center justify-between px-6 z-15">
          {/* Deep Global Context Search Box */}
          <div className="w-96 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-slate-900/60 hover:bg-slate-900/90 focus:bg-slate-900 text-[11px] text-slate-200 pl-10 pr-4 py-2 rounded-xl border border-slate-800/80 focus:border-emerald-500/60 focus:outline-none transition-all placeholder:text-slate-600 focus:shadow-[0_0_15px_rgba(16,185,129,0.06)]"
            />
          </div>

          {/* Settings panel triggers / user indicators */}
          <div className="flex items-center gap-4">
            {isGDriveConnected ? (
              <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-emerald-500/25">
                <img src={gdriveUser?.picture} alt="Avatar" className="w-5 h-5 rounded-full referrerPolicy='no-referrer'" />
                <span className="text-[10px] font-semibold text-slate-300 font-mono text-ellipsis overflow-hidden max-w-[100px]">{gdriveUser?.name}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-900/40 px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] text-slate-400 font-mono">
                <Server className="w-3.5 h-3.5 text-slate-600" />
                <span>LOCAL_BUFFER</span>
              </div>
            )}

            {/* Quick Create CTA */}
            <button 
              onClick={onOpenWizard}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-bold transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:brightness-110 flex items-center gap-1.5"
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
              <div className="p-6 rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900/50 via-slate-900/10 to-slate-900/40 relative overflow-hidden backdrop-blur-xl">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_right,rgba(16,185,129,0.06),transparent_70%)] pointer-events-none"></div>
                <h1 className="text-xl font-bold tracking-tight text-white mb-1.5">{t('welcomeBack')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Operator</span></h1>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">{t('subWelcome')}</p>
                <div className="flex gap-4 mt-4 text-[10px] font-mono">
                  <div className="px-3 py-1.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    STATUS: READY_MATRIX
                  </div>
                  <div className="px-3 py-1.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    ACTIVE PROJECT COUNT: {projects.length}
                  </div>
                </div>
              </div>

              {/* Bento Grid Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-sm">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{t('localQuota')}</p>
                  <p className="text-xl font-bold text-slate-200 mt-1 font-mono">{localStorageUsage}</p>
                  <p className="text-[9px] text-slate-500 mt-1.5">~5MB Local Browser limit safely protected.</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-sm col-span-2 relative overflow-hidden">
                  <div className="absolute right-4 top-4">
                    <CloudStorageStatus />
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{t('gDriveProvider')}</p>
                  <p className="text-xl font-bold text-slate-200 mt-1 font-mono">
                    {isGDriveConnected ? 'Sync Stream Armed' : 'Unsynchronized'}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-1.5 font-mono">
                    {isGDriveConnected ? `Root: /Hidro_AI_Studio/` : 'Click left sidebar Cloud Storage tab to pair Google Drive.'}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-sm flex flex-col justify-between">
                  <div>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-purple-500 text-purple-950 float-right font-mono">STABLE</span>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">AI Engines</p>
                  </div>
                  <p className="text-xs font-semibold text-slate-300 mt-2">Imagen 4 + Veo 3.1</p>
                </div>
              </div>

              {/* Active / Projects grid view */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">{t('favTitle')}</h3>
                  <button onClick={() => setCurrentView('projects')} className="text-[10pt] font-semibold text-emerald-400 hover:underline flex items-center gap-1 font-mono">
                    <span>Manage all</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {projects.filter(p => p.isFavorite).slice(0, 4).length > 0 ? (
                    projects.filter(p => p.isFavorite).slice(0, 4).map(p => (
                      <ProjectInteractiveCard key={p.id} p={p} onSelect={onSelectProject} onToggleFavorite={toggleFavorite} />
                    ))
                  ) : (
                    <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center col-span-2 text-slate-500 text-xs">
                      No pinned workflows. Click the star icon on any project.
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Board List */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">{t('recentActivity')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {projects.length > 0 ? (
                    projects.slice(0, 4).map(p => (
                      <ProjectInteractiveCard key={p.id} p={p} onSelect={onSelectProject} onToggleFavorite={toggleFavorite} />
                    ))
                  ) : (
                    <div className="p-10 rounded-2xl border border-dashed border-slate-800 text-center col-span-2 text-slate-500 text-xs">
                      No active workflows yet. Click button above to initialize your creative board.
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic .hidro Import Box */}
              <div className="p-6 rounded-2xl border border-emerald-500/20 bg-slate-900/10 backdrop-blur-md relative overflow-hidden">
                <div className="absolute right-0 bottom-0 top-0 w-24 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none"></div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>{t('importBtn')}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Restore any offline kịch bản worksheet in seconds. Drag-n-drop or select any `.hidro` workflow dump file.
                    </p>
                  </div>
                  <div>
                    <label className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 cursor-pointer text-xs font-semibold text-slate-200 transition inline-block">
                      <span>CHOOSE WORKPLAY FILE</span>
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
                          Modified: {new Date(p.lastModified).toLocaleDateString()}
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
                            <span>CLONE</span>
                          </button>

                          <button
                            onClick={() => p.isArchived ? unarchiveProject(p.id) : archiveProject(p.id)}
                            className="text-slate-400 hover:text-amber-400 flex items-center gap-1"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            <span>{p.isArchived ? 'UNARCHIVE' : 'ARCHIVE'}</span>
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
                            <span>EXPORT</span>
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
                  <span>Interactive Templates Gallery</span>
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
                        <span className="text-[10px] text-slate-500 font-mono">{temp.sceneCount} Scenes • {temp.duration}s</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1.5 group-hover:text-emerald-400 transition-colors uppercase font-mono">
                        {temp.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-sans">{temp.desc}</p>
                    </div>

                    <div className="border-t border-slate-900 pt-3 mt-4 flex items-center justify-between text-[9px] font-mono">
                      <span className="text-slate-500">Models: {temp.imageModel} • {temp.videoModel}</span>
                      <button 
                        onClick={() => handleCreateFromTemplate(temp)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 transition hover:bg-emerald-500/35 uppercase flex items-center gap-1"
                      >
                        <span>Instantiate Blueprint</span>
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
                  <span>Global Brand Asset Aggregator</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">{t('assetLibDesc')}</p>
              </div>

              {/* Character blocks */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Captured Characters DNA ({aggregatedAssets.characters.length})</h4>
                <div className="grid grid-cols-2 gap-3">
                  {aggregatedAssets.characters.map((text, i) => (
                    <AssetItemPanel key={i} text={text} label="CHARACTER" />
                  ))}
                </div>
              </div>

              {/* Product blocks */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">Identified Products Engine ({aggregatedAssets.products.length})</h4>
                <div className="grid grid-cols-2 gap-3">
                  {aggregatedAssets.products.map((text, i) => (
                    <AssetItemPanel key={i} text={text} label="PRODUCT" />
                  ))}
                </div>
              </div>

              {/* Background briefs */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">Extracted Environments & BGs ({aggregatedAssets.backgrounds.length})</h4>
                <div className="grid grid-cols-2 gap-3">
                  {aggregatedAssets.backgrounds.map((text, i) => (
                    <AssetItemPanel key={i} text={text} label="BACKGROUND" />
                  ))}
                </div>
              </div>

              {/* Cinematic styles */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">Style Formats ({aggregatedAssets.styles.length})</h4>
                <div className="grid grid-cols-2 gap-3">
                  {aggregatedAssets.styles.map((text, i) => (
                    <AssetItemPanel key={i} text={text} label="STYLE" />
                  ))}
                </div>
              </div>
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

              {/* TRASH CONTROLS SECTION */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <h3 className="text-sm font-mono font-bold tracking-wider text-rose-400 uppercase flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>{t('trashBinTitle')}</span>
                  </h3>
                  {trashBin.length > 0 && (
                    <button
                      onClick={clearTrash}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-bold font-mono uppercase"
                    >
                      {t('emptyTrashBtn')}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {trashBin.length > 0 ? (
                    trashBin.map((p) => (
                      <div key={p.id} className="p-4 rounded-xl border border-slate-900 bg-slate-950/60 flex flex-col justify-between group">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="font-mono text-[9px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                              TRASHED {p.id}
                            </span>
                            <span className="text-[9px] text-slate-600 font-mono">Deleted: {p.deletedAt ? new Date(p.deletedAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-400 mt-2 truncate group-hover:text-slate-200 transition-colors">
                            {p.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{p.description || "No info provided."}</p>
                        </div>

                        <div className="border-t border-slate-900 pt-3 mt-4 flex items-center justify-between text-[10px] font-mono">
                          <button
                            onClick={() => restoreProjectFromTrash(p.id)}
                            className="text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>{t('restore')}</span>
                          </button>
                          <button
                            onClick={() => permanentlyDeleteProject(p.id)}
                            className="text-rose-500 hover:underline"
                          >
                            {t('permanentlyDelete')}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center col-span-2 text-slate-600 text-xs font-mono border border-dashed border-slate-900 rounded-xl">
                      Trash Bin is clean. No safety-deleted projects found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* F. VIEW: SETTINGS VIEW */}
          {currentView === 'settings' && (
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 space-y-6">
              <h3 className="text-sm font-mono font-bold tracking-widest text-slate-200 uppercase border-b border-slate-900 pb-3">
                Creative OS Settings & Configurations
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase font-bold mb-2">Default Image Model Engine</label>
                    <select className="w-full bg-slate-900 text-xs text-slate-300 font-mono p-3 rounded-lg border border-slate-800 outline-none focus:border-emerald-500">
                      <option value="Imagen 4">Imagen 4 Pro Commercial (Fine-tuned)</option>
                      <option value="Nano Banana Pro">Nano Banana Pro Flash (Rapid Prototype)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase font-bold mb-2">Default Motion Dynamics Engine</label>
                    <select className="w-full bg-slate-900 text-xs text-slate-300 font-mono p-3 rounded-lg border border-slate-800 outline-none focus:border-emerald-500">
                      <option value="Veo 3.1 Quality">Veo 3.1 Cinematic Quality (1080p, Frame consistent)</option>
                      <option value="Omni Flash">Omni Flash Speed (H264, 720p)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 bg-slate-900/20 p-5 rounded-xl border border-slate-900 leading-relaxed font-mono text-[10px] text-slate-500">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Active Framework Metadata</h4>
                  <div>Node Ingress Port: 3000 (Internal proxy redirect configured)</div>
                  <div>React Framework: v18.3.1 via Vite dev mode</div>
                  <div>HMR State: DISCIPLINED (DISABLE_HMR=true, Static triggers only)</div>
                  <div>Operational sandbox ID: fd262fde-13f1</div>
                  <div className="pt-2 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-slate-400 font-bold">CORE PIPELINE SECURITY CERTIFIED</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </section>
      </main>
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
    'Draft': 'bg-slate-900 text-slate-400 border border-slate-800',
    'Archived': 'bg-zinc-900 text-zinc-500'
  };

  const currentStatus = p.status || 'Draft';

  return (
    <div className="relative group p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:border-emerald-500/30 hover:bg-slate-950 transition-all duration-300 flex flex-col justify-between">
      <div className="cursor-pointer" onClick={() => onSelect(p)}>
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-slate-500 font-semibold">{p.id}</span>
          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${statusColors[currentStatus] || statusColors['Draft']}`}>
            {currentStatus}
          </span>
        </div>

        <h4 className="text-xs font-bold text-slate-100 mt-2 truncate group-hover:text-emerald-400 transition-colors uppercase font-mono">
          {p.name}
        </h4>
        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 leading-relaxed">
          {p.description || "No project workflow details provided."}
        </p>

        <div className="flex gap-1.5 flex-wrap mt-3 text-[8px] font-mono uppercase">
          <span className="px-1.5 py-0.5 bg-teal-500/15 text-teal-300 border border-teal-500/10 rounded">{p.type}</span>
          <span className="px-1.5 py-0.5 bg-blue-500/15 text-blue-300 border border-blue-500/10 rounded">{p.platform}</span>
        </div>
      </div>

      <div className="border-t border-slate-900 pt-3 mt-3 flex items-center justify-between text-[10px] font-mono">
        <button 
          onClick={() => onSelect(p)}
          className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold text-[10px]"
        >
          <span>WORKSTATION</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>

        <button 
          onClick={() => onToggleFavorite(p.id)}
          className={`p-1 rounded transition ${p.isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
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
