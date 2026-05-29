import React from 'react';
import { useBackgroundQueue } from '../context/BackgroundQueueContext';
import { useLanguage } from '../utils/i18n';
import { ShieldCheck, ArrowRight, Layers, ImageIcon, Activity } from 'lucide-react';

export default function ProjectRecoveryPopup() {
  const { lang } = useLanguage();
  const { recoveryNotice, dismissRecovery, activeProject } = useBackgroundQueue();

  if (!recoveryNotice || !activeProject) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in"
      id="project_recovery_popup"
    >
      <div className="w-full max-w-md bg-[#090909] border border-[#66FF99]/20 rounded-3xl p-7 space-y-6 text-center shadow-[0_0_60px_rgba(102,255,153,0.15)] relative overflow-hidden">
        {/* Glow detail background */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-[#66FF99]/[0.03] rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-[#4DA6FF]/[0.03] rounded-full blur-2xl pointer-events-none" />

        {/* Dynamic header icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#66FF99]/10 border border-[#66FF99]/30 flex items-center justify-center mx-auto text-[#66FF99] animate-pulse">
          <ShieldCheck className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono tracking-widest text-[#66FF99] uppercase font-bold block">
            {lang === 'en' ? 'CRASH RECOVERY SYSTEM' : 'HỆ THỐNG KHÔI PHỤC TIẾN TRÌNH'}
          </span>
          <h3 className="text-lg font-display font-black text-white tracking-tight leading-tight uppercase">
            {lang === 'en' ? 'PROJECT RESTORED' : 'ĐÃ KHÔI PHỤC DỰ ÁN'}
          </h3>
          <p className="text-xs text-gray-400 font-sans leading-relaxed">
            {lang === 'en' 
              ? 'Our persistent storage engine recovered your active studio session and synchronized background operations securely.' 
              : 'Bộ lưu trữ đồng bộ thời gian thực đã khôi phục phiên làm việc và đồng bộ hóa tiến trình sản xuất an toàn.'}
          </p>
        </div>

        {/* Quantified Recovered stats */}
        <div className="p-4 rounded-2xl bg-black border border-white/5 space-y-3 font-mono text-xs text-left">
          <div className="flex justify-between items-center text-gray-400">
            <span className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              {lang === 'en' ? 'Scenes Recovered' : 'Phân cảnh lưu cứu:'}
            </span>
            <span className="text-white font-bold">{recoveryNotice.scenesCount} scenes</span>
          </div>

          <div className="flex justify-between items-center text-gray-400">
            <span className="flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-yellow-500" />
              {lang === 'en' ? 'Images Finished' : 'Ảnh render hoàn tất:'}
            </span>
            <span className="text-emerald-400 font-bold">{recoveryNotice.imagesCompleted} complete</span>
          </div>

          <div className="flex justify-between items-center text-gray-400">
            <span className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#66FF99]" />
              {lang === 'en' ? 'Queued / Rendering' : 'Trong hàng đợi:'}
            </span>
            <span className="text-[#4DA6FF] font-bold">{recoveryNotice.renderingCount} active</span>
          </div>
        </div>

        <button
          onClick={dismissRecovery}
          className="w-full py-3.5 rounded-xl bg-[#66FF99] hover:bg-[#66FF99]/90 text-black font-semibold text-xs tracking-wider font-mono uppercase transition-all shadow-[0_0_20px_rgba(102,255,153,0.15)] hover:scale-102 flex items-center justify-center gap-2 cursor-pointer font-bold"
          id="btn_recovery_dismiss"
        >
          {lang === 'en' ? 'RESUME STUDIO WORK' : 'TIẾP TỤC LÀM VIỆC'}
          <ArrowRight className="w-4 h-4 text-black" />
        </button>
      </div>
    </div>
  );
}
