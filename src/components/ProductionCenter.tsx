import React, { useState } from 'react';
import { useBackgroundQueue } from '../context/BackgroundQueueContext';
import { useLanguage } from '../utils/i18n';
import { 
  Zap, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ChevronUp, 
  ChevronDown, 
  RefreshCw, 
  Clock, 
  Layers, 
  Trash2,
  Cpu,
  Tv,
  FileText,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';

export default function ProductionCenter() {
  const { lang, t } = useLanguage();
  const { 
    jobs, 
    restartJob, 
    cancelJob, 
    clearQueue, 
    startVisualProduction, 
    stopVisualProduction,
    isVisualProductionRunning,
    activeProject
  } = useBackgroundQueue();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'history'>('all');

  if (!activeProject) return null;

  const runningAndPending = jobs.filter(j => j.status === 'running' || j.status === 'pending');
  const completedAndFailed = jobs.filter(j => j.status === 'completed' || j.status === 'failed');

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'active') return job.status === 'running' || job.status === 'pending';
    if (activeTab === 'history') return job.status === 'completed' || job.status === 'failed';
    return true; // 'all'
  });

  const getJobIcon = (type: string) => {
    switch (type) {
      case 'asset_analysis':
        return <Layers className="w-3.5 h-3.5 text-[#4DA6FF]" />;
      case 'director_analysis':
        return <Cpu className="w-3.5 h-3.5 text-[#66FF99]" />;
      case 'script_generation':
        return <FileText className="w-3.5 h-3.5 text-indigo-400" />;
      case 'image_generation':
        return <ImageIcon className="w-3.5 h-3.5 text-yellow-500" />;
      case 'prompt_generation':
        return <Zap className="w-3.5 h-3.5 text-[#66FF99]" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string, attempts: number) => {
    switch (status) {
      case 'running':
        return (
          <span className="flex items-center gap-1 text-[9px] font-mono bg-[#66FF99]/10 text-[#66FF99] border border-[#66FF99]/20 px-1.5 py-0.5 rounded uppercase font-bold animate-pulse">
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
            {lang === 'en' ? 'Rendering' : 'Đang chạy'}
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-[9px] font-mono bg-white/5 text-gray-400 border border-white/5 px-1.5 py-0.5 rounded uppercase font-bold text-nowrap">
            <Clock className="w-2.5 h-2.5 text-gray-500" />
            {lang === 'en' ? 'In Queue' : 'Chờ nạp'}
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            {lang === 'en' ? 'Ready' : 'Xong'}
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-[9px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded uppercase font-bold text-nowrap">
            <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
            {lang === 'en' ? `Failed` : `Thất bại`}
          </span>
        );
      default:
        return null;
    }
  };

  const totalJobsCount = jobs.length;
  const runningCount = jobs.filter(j => j.status === 'running').length;
  const pendingCount = jobs.filter(j => j.status === 'pending').length;

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end max-w-sm sm:max-w-md w-[320px] sm:w-[400px] select-none"
      id="production_center_root"
    >
      {/* COLLAPSED FLOATING BADGE BANNER */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-black/85 backdrop-blur-md border border-white/10 hover:border-[#66FF99]/40 text-white cursor-pointer shadow-2xl transition-all hover:scale-[1.02] active:scale-98"
          id="btn_production_center_open"
        >
          <div className="relative">
            <div className={`p-1.5 rounded-lg bg-[#66FF99]/10 border border-[#66FF99]/20 text-[#66FF99] ${runningCount > 0 ? 'animate-bounce' : ''}`}>
              <Tv className="w-4 h-4" />
            </div>
            {runningCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#66FF99] animate-ping" />
            )}
          </div>
          <div className="text-left font-mono">
            <span className="text-[10px] tracking-widest text-gray-400 uppercase block font-bold">
              {lang === 'en' ? 'PRODUCTION CENTER' : 'TRUNG TÂM SẢN XUẤT'}
            </span>
            <div className="flex items-center gap-1.5 text-[9px] text-[#66FF99] font-bold">
              {runningCount > 0 ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-[#66FF99]" />
                  <span>
                    {lang === 'en' ? `${runningCount} job render running` : `Đang xử lý ${runningCount} dữ liệu`}
                  </span>
                </>
              ) : pendingCount > 0 ? (
                <span className="text-[#4DA6FF]">
                  {lang === 'en' ? `${pendingCount} queued in pipeline` : `${pendingCount} cảnh đang xếp hàng`}
                </span>
              ) : (
                <span className="text-gray-500">
                  {lang === 'en' ? 'System idle. Stream active.' : 'Hệ thống rảnh rỗi. Đang chờ.'}
                </span>
              )}
            </div>
          </div>
          <ChevronUp className="w-4 h-4 text-gray-500" />
        </button>
      )}

      {/* EXPANDED RICH CONTROL PANEL */}
      {isOpen && (
        <div className="w-full bg-[#070707]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4.5 space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-fade-in text-xs max-h-[500px] flex flex-col overflow-hidden">
          {/* Panel Header */}
          <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#66FF99]/5 border border-[#66FF99]/20 text-[#66FF99]">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-white text-xs tracking-wider uppercase">
                  {lang === 'en' ? 'PRODUCTION PIPELINE' : 'TIẾN TRÌNH SẢN XUẤT'}
                </h3>
                <span className="text-[9px] font-mono text-gray-500 block leading-none">
                  {lang === 'en' ? 'Active background render engine' : 'Phát sóng cảnh quay nền thời gian thực'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md hover:bg-white/5 text-gray-500 hover:text-white transition-colors cursor-pointer"
                title={lang === 'en' ? 'Collapse panel' : 'Thu nhỏ bảng'}
                id="btn_production_center_close"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Stats Grid & Interactive Controllers */}
          <div className="grid grid-cols-2 gap-2 bg-black p-3 rounded-xl border border-white/5 font-mono text-[10px]">
            <div className="space-y-1">
              <span className="text-gray-500 block">{lang === 'en' ? 'PIPELINE QUEUE' : 'XẾP HÀNG CHỜ RENDER:'}</span>
              <div className="text-white font-bold flex items-center gap-1.5 text-xs">
                {jobs.length > 0 ? (
                  <>
                    <span className="text-[#66FF99] font-black">{runningCount}</span> / 
                    <span className="text-gray-400 font-medium">{pendingCount} {lang === 'en' ? 'waiting' : 'đợi'}</span>
                  </>
                ) : (
                  <span className="text-gray-600">Empty</span>
                )}
              </div>
            </div>

            <div className="space-y-1 text-right">
              <span className="text-gray-500 block">{lang === 'en' ? 'VISUAL RENDER CONTROL' : 'BẬT TẮT SẢN XUẤT:'}</span>
              <div className="flex justify-end gap-1.5">
                {isVisualProductionRunning ? (
                  <button
                    onClick={stopVisualProduction}
                    className="px-2 py-1 rounded bg-amber-400/10 border border-amber-400/20 text-amber-400 hover:bg-amber-400/20 transition-all font-bold text-[9px] uppercase cursor-pointer"
                  >
                    {lang === 'en' ? 'PAUSE PIPELINE' : 'TẠM DỪNG'}
                  </button>
                ) : (
                  <button
                    onClick={startVisualProduction}
                    className="px-2 py-1 rounded bg-[#66FF99]/10 border border-[#66FF99]/20 text-[#66FF99] hover:bg-[#66FF99]/20 transition-all font-bold text-[9px] uppercase cursor-pointer"
                  >
                    {lang === 'en' ? 'RUN PIPELINE' : 'CHẠY TIẾN TRÌNH'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex bg-black p-0.5 rounded-lg border border-white/5 gap-1 text-[10px] font-mono shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1 rounded transition-all cursor-pointer ${activeTab === 'all' ? 'bg-white/5 text-white font-bold' : 'text-gray-500 hover:text-white'}`}
            >
              {lang === 'en' ? 'All' : 'Tất cả'} ({totalJobsCount})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-1 rounded transition-all cursor-pointer ${activeTab === 'active' ? 'bg-[#66FF99]/10 text-[#66FF99] font-bold border border-[#66FF99]/15' : 'text-gray-500 hover:text-[#66FF99]'}`}
            >
              {lang === 'en' ? 'Active' : 'Đang xử lý'} ({runningCount + pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1 rounded transition-all cursor-pointer ${activeTab === 'history' ? 'bg-white/5 text-gray-300 font-bold' : 'text-gray-500 hover:text-white'}`}
            >
              {lang === 'en' ? 'History' : 'Lịch sử'} ({completedAndFailed.length})
            </button>
          </div>

          {/* Jobs Lists - Scrollable Box */}
          <div className="flex-1 overflow-y-auto max-h-[220px] pr-1 space-y-2 scrollbar-thin scrollbar-thumb-white/10 text-[11px] leading-snug">
            {filteredJobs.length === 0 ? (
              <div className="p-8 text-center text-gray-600 font-mono italic">
                {lang === 'en' ? 'No tracked compilation jobs' : 'Chưa có phân cảnh nào trong hàng đợi'}
              </div>
            ) : (
              filteredJobs.slice().reverse().map(job => (
                <div 
                  key={job.id} 
                  className={`p-3 rounded-xl border relative overflow-hidden transition-all ${
                    job.status === 'running' 
                      ? 'bg-[#66FF99]/[0.02] border-[#66FF99]/20 shadow-xs' 
                      : job.status === 'failed'
                      ? 'bg-rose-500/[0.01] border-rose-500/10'
                      : 'bg-black/35 border-white/5'
                  }`}
                >
                  {/* Job Header */}
                  <div className="flex justify-between items-start gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="p-1 rounded-md bg-white/[0.02] border border-white/5 shrink-0">
                        {getJobIcon(job.type)}
                      </div>
                      <span className="font-bold text-white truncate max-w-[150px] font-mono">
                        {job.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {getStatusBadge(job.status, job.attempts)}
                      
                      {job.status === 'failed' && (
                        <button
                          onClick={() => restartJob(job.id)}
                          className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                          title={lang === 'en' ? 'Retry Job' : 'Chạy lại phân cảnh'}
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      )}

                      {(job.status === 'pending' || job.status === 'failed') && (
                        <button
                          onClick={() => cancelJob(job.id)}
                          className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-colors cursor-pointer"
                          title={lang === 'en' ? 'Remove job' : 'Hủy bỏ'}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress slide bar */}
                  {job.status === 'running' && (
                    <div className="mb-2">
                      <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.02]">
                        <div 
                          className="h-full bg-gradient-to-r from-[#4DA6FF] to-[#66FF99] transition-all duration-300 rounded-full"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1 text-[9px] font-mono text-gray-500 leading-none">
                        <span>{job.progress}% COMPLETE</span>
                        {job.attempts > 0 && <span>ATTEMPT {job.attempts}/3</span>}
                      </div>
                    </div>
                  )}

                  {/* Descriptions */}
                  <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Error reports */}
                  {job.error && (
                    <div className="mt-1.5 p-1 px-2 rounded bg-rose-500/5 border border-rose-500/10 text-[9px] font-mono text-rose-400 leading-normal">
                      Error: {job.error}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Bottom cleaning toolbar */}
          {completedAndFailed.length > 0 && (
            <div className="flex justify-between items-center border-t border-white/5 pt-2 shrink-0">
              <span className="text-[9px] font-mono text-gray-650 uppercase">
                {lang === 'en' ? `${completedAndFailed.length} history files` : `Đã lưu trữ ${completedAndFailed.length} lịch sử`}
              </span>
              <button
                onClick={clearQueue}
                className="text-[9px] font-mono flex items-center gap-1 text-gray-500 hover:text-gray-300 cursor-pointer"
              >
                <Trash2 className="w-3 h-3 text-gray-500" />
                {lang === 'en' ? 'CLEAR HISTORY' : 'XÓA LỊCH SỬ RENDER'}
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
