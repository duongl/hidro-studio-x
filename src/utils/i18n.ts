export type Language = 'en' | 'vn';

export interface TranslationSchema {
  // Global & Header
  appTitle: string;
  appSubtitle: string;
  keyActive: string;
  liteSimulation: string;
  closeProject: string;
  closeBoard: string;
  wipeConfirm: string;
  activeMatrix: string;
  secureTransfer: string;
  footerStatus: string;

  // Tabs
  tabAssets: string;
  tabDirector: string;
  tabScripting: string;
  tabVisuals: string;
  tabMotion: string;
  tabMastering: string;
  tabInspector: string;

  // Stage Completion & Breadcrumbs
  assetsComplete: string;
  directorComplete: string;
  scriptComplete: string;
  visualsRunning: string;
  visualsComplete: string;
  motionLocked: string;
  motionComplete: string;
  masteringLocked: string;
  masteringComplete: string;

  // Wizard (ProjectWizard)
  initializePipeline: string;
  stepIndicator: string;
  cancelBtn: string;
  cinematicProjectName: string;
  nameDesc: string;
  namePlaceholder: string;
  sysProductionType: string;
  typeDesc: string;
  targetPlatform: string;
  platformDesc: string;
  configureEngines: string;
  engineTypeDesc: string;
  imageModelLabel: string;
  movieModelLabel: string;
  bestFor: string;
  pacingScenes: string;
  pacingDesc: string;
  expectedVideoDuration: string;
  durationLabelDesc: string;
  secondsLabel: string;
  recommendedCalc: string;
  sceneCountLabel: string;
  sceneCountDesc: string;
  manualOverride: string;
  suggestedScenesLabel: string;
  resetToRecommend: string;
  previousBtn: string;
  nextBtn: string;
  compileProjectBtn: string;
  recommendedOption: string;

  // Assets Stage (AssetsManager)
  brandAssetsTitle: string;
  brandAssetsDesc: string;
  analysisDispatch: string;
  charBaseline: string;
  charPlaceholder: string;
  prodBaseline: string;
  prodPlaceholder: string;
  bgBaseline: string;
  bgPlaceholder: string;
  styleBaseline: string;
  stylePlaceholder: string;
  switchToText: string;
  switchToUpload: string;
  uploadPngJpg: string;
  changeImageBtn: string;
  missingAssetsAlert: string;
  uploadStepIndicator: string;

  // Asset Flow & DNA Extraction
  charUpload: string;
  prodUpload: string;
  bgUpload: string;
  styleUpload: string;
  analyzeAssetsBtn: string;
  extractingDna: string;
  charDnaExtracted: string;
  prodDnaExtracted: string;
  bgDnaExtracted: string;
  styleDnaExtracted: string;
  continueToDirector: string;
  dnaChecklistHeader: string;
  dnaChecklistSub: string;

  // Success Dialogs / Flows
  successTitle: string;
  assetSuccessMsg: string;
  directorSuccessMsg: string;
  scriptSuccessMsg: string;
  visualSuccessMsg: string;
  motionSuccessMsg: string;

  // AI Director (AIDirector)
  directorTitle: string;
  directorSubtitle: string;
  dispatchWriter: string;
  dnaLockSequenceRequired: string;
  directorDeepScanDesc: string;
  extractDnaAndAnalyze: string;
  contactingDirector: string;
  statesScanningVb: string;
  statesChromExt: string;
  statesLockChar: string;
  statesLockProd: string;
  statesLockStyle: string;
  statesFormIntent: string;
  safeseedSec: string;
  safeInjectedChrome: string;
  lockedDnaChains: string;
  audPlatformRes: string;
  audienceInsight: string;
  platformComp: string;
  affiliateMarketingPriority: string;
  cinematicDnaRules: string;
  microHook: string;
  visualSpectrum: string;
  soundVoiceNarrative: string;
  promptInjEngineArmed: string;
  promptInjDesc: string;
  generateScriptBtn: string;

  // Scripting Workspace (ScriptingWorkspace)
  scriptingTitle: string;
  scriptingDesc: string;
  dispatchImager: string;
  aiGenerateScriptTab: string;
  directPasteScriptTab: string;
  directorialDirective: string;
  aiFocusPlaceholder: string;
  aiSceneCountHelper: string;
  pasteRawContent: string;
  autoDeconstructEnabled: string;
  pasteDescPlaceholder: string;
  generateScriptBlocksBtn: string;
  deconstructLayoutBtn: string;
  playbookCompiledBtn: string;
  compilingSceneStructures: string;
  staplingDnaLocks: string;
  autoCalculatingAction: string;
  formattingDialogueSym: string;
  noPlaybookYet: string;
  noPlaybookDesc: string;
  startImageGenerationBtn: string;

  // Visuals Queue (VisualsQueue)
  visualsPipelineTitle: string;
  visualsPipelineDesc: string;
  stopRenderQueue: string;
  startRenderQueue: string;
  exportSuite: string;
  downloadImagesPack: string;
  exportPromptPack: string;
  exportJsonSchema: string;
  exportTxtDraft: string;
  queueActive: string;
  compilingScene: string;
  noParallelInterference: string;
  sceneLabel: string;
  statusRendering: string;
  statusLocked: string;
  statusFailed: string;
  statusPending: string;
  engineRetryInjector: string;
  attemptOf: string;
  voiceoverNarration: string;
  actionCol: string;
  styleCol: string;
  downloadAllBtn: string;
  continueToVideoBtn: string;

  // Motion Beta (VideoModule)
  motionTitle: string;
  motionSubtitle: string;
  motionBetaBadge: string;
  enginesListDesc: string;
  directorAdvisory: string;
  motionSimulatedBetaDesc: string;
  sceneMotionDirectives: string;
  mappedOnEngine: string;
  stableVideoPrompt: string;
  cameraActuator: string;
  physicsStrength: string;
  copiedText: string;
  copyActuator: string;
  copyPhysics: string;
  continueToMasteringBtn: string;

  // Mastering Beta (MasteringModule)
  masteringTitle: string;
  masteringSubtitle: string;
  timelineWaveformTitle: string;
  previewAudioSynced: string;
  masterNarratorTrack: string;
  voiceoverLabel: string;
  ambientMusicTrack: string;
  ambientWaveBed: string;
  audioAlignmentLocked: string;
  atmosTuning: string;
  voiceProfilePresets: string;
  backgroundAcoustics: string;
  stereoDepth: string;
  purityThreshold: string;
  dynamicRangeLimit: string;
  closeProjectBtn: string;
  resetWipePrompt: string;
}

export const TRANSLATIONS: Record<Language, TranslationSchema> = {
  en: {
    appTitle: "HIDRO STUDIO 2.0",
    appSubtitle: "Apple Glass Architecture",
    keyActive: "DIRECTOR KEY ACTIVE",
    liteSimulation: "LITE SIMULATION DISPATCH",
    closeProject: "Close Board",
    closeBoard: "[ CLOSE PROJECT ]",
    wipeConfirm: "Wipe active studio cache and reload fresh board?",
    activeMatrix: "Active Matrix Ready",
    secureTransfer: "HIDRO AI STUDIO NETWORK VER 2.0.47 // DESIGNED WITH SECURE TRANSFERS",
    footerStatus: "PLATFORM: VITE+EXPRESS CLOUD RUN CONTAINER",

    tabAssets: "1. Brand Assets",
    tabDirector: "2. AI Director",
    tabScripting: "3. Scripting",
    tabVisuals: "4. Visuals (Render)",
    tabMotion: "5. Motion (Beta)",
    tabMastering: "6. Mastering (Beta)",
    tabInspector: "Prompt Inspector",

    assetsComplete: "✓ Assets Complete",
    directorComplete: "✓ AI Director Complete",
    scriptComplete: "✓ Script Complete",
    visualsRunning: "⟳ Visuals Running",
    visualsComplete: "✓ Visuals Complete",
    motionLocked: "🔒 Motion Locked",
    motionComplete: "✓ Motion Complete",
    masteringLocked: "🔒 Mastering Locked",
    masteringComplete: "✓ Mastering Complete",

    initializePipeline: "Initialize Pipeline",
    stepIndicator: "Step {step} of 5",
    cancelBtn: "[ CANCEL ]",
    cinematicProjectName: "Name your cinematic project",
    nameDesc: "Provide an inspiring name indicating the product, affiliate campaign or brand focus.",
    namePlaceholder: "e.g., Portable Blender Launch Viral",
    sysProductionType: "Select System Production Type",
    typeDesc: "Adapts hook styles, pacing intervals, and core scripting copy templates.",
    targetPlatform: "Target Social Commerce Platform",
    platformDesc: "Tunes technical video layouts, safety margins, and resolution locks.",
    configureEngines: "Configure AI Generation Engines",
    engineTypeDesc: "Fine-tuned setup optimized for standard production layers.",
    imageModelLabel: "IMAGE MODEL (PREMIUM GENERATION)",
    movieModelLabel: "VIDEO MODEL (MOTION DYNAMICS)",
    bestFor: "Best for",
    pacingScenes: "Configure Target Pacing & Scenes",
    pacingDesc: "Balancing render velocity",
    expectedVideoDuration: "Expected Video Duration",
    durationLabelDesc: "Desired total video runtime in seconds.",
    secondsLabel: "seconds",
    recommendedCalc: "Recommended scene calculation",
    sceneCountLabel: "Scene Count",
    sceneCountDesc: "Cell count of storyboard blocks generated in sequence.",
    manualOverride: "MANUAL OVERRIDE",
    suggestedScenesLabel: "Suggested",
    resetToRecommend: "[ Reset to Recommend ]",
    previousBtn: "PREVIOUS",
    nextBtn: "NEXT",
    compileProjectBtn: "COMPILE PROJECT",
    recommendedOption: "★ Recommended",

    brandAssetsTitle: "1. Brand Assets Injection",
    brandAssetsDesc: "Define character, product and style baselines to generate continuous DNA Locks.",
    analysisDispatch: "ANALYSIS DISPATCH",
    charBaseline: "Character baseline",
    charPlaceholder: "e.g. Asian female, mid 20s, long dark sleek hair, elegant light cream-colored tailored office suit, looking at camera smiling softly.",
    prodBaseline: "Product baseline",
    prodPlaceholder: "e.g. Portable Blender, cylindrical sleek white body, clear acrylic bottle, silver metallic power button glowing on base.",
    bgBaseline: "Background baseline",
    bgPlaceholder: "e.g. Minimalist contemporary kitchen scene, marble islands, glowing LED backlighting, warm diffuse background elements.",
    styleBaseline: "Cinematic Style baseline",
    stylePlaceholder: "e.g. Premium Apple lifestyle TVC commercial, macro closeups, 8k glass refractions, moody backlight focus, shallow depth gradient.",
    switchToText: "Switch to text desc",
    switchToUpload: "Switch to image upload",
    uploadPngJpg: "Upload PNG / JPG",
    changeImageBtn: "CHANGE IMAGE",
    missingAssetsAlert: "Fill in or upload image configurations for all 4 asset baselines to lock down DNA.",
    uploadStepIndicator: "Upload Step",

    charUpload: "Character Upload",
    prodUpload: "Product Upload",
    bgUpload: "Background Upload",
    styleUpload: "Style Upload",
    analyzeAssetsBtn: "ANALYZE ASSETS",
    extractingDna: "Extracting DNA...",
    charDnaExtracted: "Character DNA Extracted",
    prodDnaExtracted: "Product DNA Extracted",
    bgDnaExtracted: "Background DNA Extracted",
    styleDnaExtracted: "Style DNA Extracted",
    continueToDirector: "CONTINUE TO AI DIRECTOR",
    dnaChecklistHeader: "DNA EXTRACTION PIPELINE",
    dnaChecklistSub: "Ready to run cinematic chromosomal extraction.",

    successTitle: "Pipeline Update Successful",
    assetSuccessMsg: "Asset analysis completed successfully. DNA locked parameters freeze details correctly.",
    directorSuccessMsg: "AI Director complete. Marketing and voice variables locked successfully.",
    scriptSuccessMsg: "Scripting deconstruction complete. All scenes synchronized.",
    visualSuccessMsg: "Visual rendering pipeline completed. All scene cards formatted successfully.",
    motionSuccessMsg: "Camera angles and motion settings frozen for mastering compilation.",

    directorTitle: "2. AI Director Workspace",
    directorSubtitle: "Synthesizes brand assets into consistent structural prompt rules. Saves molecular memory permanently.",
    dispatchWriter: "DISPATCH WRITER",
    dnaLockSequenceRequired: "DNA Lock Sequence Required",
    directorDeepScanDesc: "Director needs to run deep micro-scans across your baseline text or image references to freeze character ratios and product geometry.",
    extractDnaAndAnalyze: "EXTRACT DNA LOCKS & ANALYZE CAMPAIGN",
    contactingDirector: "CONTACTING DIRECTOR PROTOCOLS...",
    statesScanningVb: "SCANNING ASSET BRIEF VECTORS...",
    statesChromExt: "RUNNING CHROMATIC EXTRACTION...",
    statesLockChar: "LOCKING DNA CHAINS (CHARACTER)...",
    statesLockProd: "LOCKING DNA CHAINS (PRODUCT)...",
    statesLockStyle: "LOCKING DNA CHAINS (STYLE)...",
    statesFormIntent: "FORMULATING INTENT PATTERNS...",
    safeseedSec: "SEED SECURE: CRYPTOGRAPHIC ENTROPY BUFFERING",
    safeInjectedChrome: "INJECTING PIXEL CHROMOSOMES INTO PIPELINE LOGIC...",
    lockedDnaChains: "Locked DNA Chains (Consistent Memory)",
    audPlatformRes: "Audience & Platform Resonance",
    audienceInsight: "AUDIENCE INSIGHT",
    platformComp: "PLATFORM COMPETITOR ANGLE",
    affiliateMarketingPriority: "AFFILIATE MARKETING VALUE (PRIORITY)",
    cinematicDnaRules: "Cinematic DNA Design Rules",
    microHook: "MICRO-HOOK STRATEGY",
    visualSpectrum: "VISUAL COLOR SPECTRUM & CAMERA KEY",
    soundVoiceNarrative: "SOUND & VOICE NARRATIVE PROMPT",
    promptInjEngineArmed: "PROMPT INJECTION ENGINE ARMED",
    promptInjDesc: "We have locked these 4 DNA parameters into the secure prompt injection layer. Script Generation and Visual scene assets will now automatically append these values to prevent hallucinations.",
    generateScriptBtn: "GENERATE SCRIPT",

    scriptingTitle: "3. Screenplay Logic & Deconstruction",
    scriptingDesc: "Author scripts using AI generation, or paste human drafts. Automated scene subdivision and DNA lock mapping.",
    dispatchImager: "DISPATCH IMAGER",
    aiGenerateScriptTab: "AI Generate Script",
    directPasteScriptTab: "Direct Paste Script",
    directorialDirective: "Directorial Directive & Tone Focus",
    aiFocusPlaceholder: "e.g. A high-energy workout promo describing health benefits and convenient sizing. Energetic voice, witty remarks, focus on instant mixing.",
    aiSceneCountHelper: "AI automatically maps these directions to launch exactly {count} scene cards.",
    pasteRawContent: "Paste Raw Content Copy",
    autoDeconstructEnabled: "[ AUTO-DECONSTRUCT ENABLED ]",
    pasteDescPlaceholder: "Paste script copy. Express scenes with Narrator copy, character positions or scene tags. AI reads context dynamically.",
    generateScriptBlocksBtn: "GENERATE SCRIPT BLOCKS",
    deconstructLayoutBtn: "DECONSTRUCT & LAYOUT SCENES",
    playbookCompiledBtn: "Playbook Compiled",
    compilingSceneStructures: "Compiling Scene Structures...",
    staplingDnaLocks: "STAPLING CHARACTER DNA LOCKS",
    autoCalculatingAction: "AUTOCALCULATING ACTION FRAME SHATTER VALUES...",
    formattingDialogueSym: "FORMATTING DIALOGUE SYNAPSE OVERLAYS",
    noPlaybookYet: "No Screenplay Generated Yet",
    noPlaybookDesc: "Write or paste outlines to build character scenes first. Once finalized, individual scenes are dynamically matched to our image and key rendering pipelines.",
    startImageGenerationBtn: "START IMAGE GENERATION",

    visualsPipelineTitle: "4. Unified Visual Scene Pipeline & Render Chain",
    visualsPipelineDesc: "Queue actions lock sequence processing to render assets sequentially.",
    stopRenderQueue: "Stop Render Queue",
    startRenderQueue: "Start Linear Render Queue",
    exportSuite: "[ EXPORT SUITE ]",
    downloadImagesPack: "Download Images Pack",
    exportPromptPack: "Export Prompt Pack",
    exportJsonSchema: "Export JSON Schema",
    exportTxtDraft: "Export TXT Draft",
    queueActive: "QUEUE ACTIVE",
    compilingScene: "Sequentially compiling Scene {current} of {total}...",
    noParallelInterference: "[ NO PARALLEL INTERFERENCE ]",
    sceneLabel: "SCENE",
    statusRendering: "Rendering",
    statusLocked: "Locked",
    statusFailed: "Failed",
    statusPending: "Pending",
    engineRetryInjector: "[ ENGINE RETRY INJECTOR ]",
    attemptOf: "ATTEMPT {attempt} OF {max}",
    voiceoverNarration: "VOICEOVER / NARRATION",
    actionCol: "ACTION",
    styleCol: "STYLE",
    downloadAllBtn: "DOWNLOAD ALL",
    continueToVideoBtn: "CONTINUE TO VIDEO",

    motionTitle: "5. Motion Dynamics Engine",
    motionSubtitle: "Export advanced camera prompts, physics weight triggers, and motion descriptions formulated to bypass typical AI hallucinations.",
    motionBetaBadge: "BETA PIPELINE",
    enginesListDesc: "Directives formulated dynamically.",
    directorAdvisory: "DIRECTOR ADVISORY // NO RENDERING ACTIVE",
    motionSimulatedBetaDesc: "Motion rendering functions are currently locked in simulated Beta. Use the buttons below to copy structural Camera rig directions, custom Motion presets, and voice guides to execute perfectly in your external console!",
    sceneMotionDirectives: "SCENE {number} MOTION DIRECTIVES",
    mappedOnEngine: "MAPPED ON ENGINE CONFIG",
    stableVideoPrompt: "STABLE VIDEO MOTION PROMPT (DNA LOCKED)",
    cameraActuator: "CAMERA ACTUATOR",
    physicsStrength: "PHYSICS STRENGTH",
    copiedText: "COPIED",
    copyActuator: "[ COPY ACTUATOR ]",
    copyPhysics: "[ COPY PHYSICS ]",
    continueToMasteringBtn: "CONTINUE TO MASTERING",

    masteringTitle: "6. Mastering Console & Audio Synthesizer",
    masteringSubtitle: "Post-production timelines. Orchestrate high-fidelity vocals, synchronized sound overlays, and ambient acoustics matching scene transitions.",
    timelineWaveformTitle: "MULTIPLEX SEQUENCER // DOLBY SYNAPSE",
    previewAudioSynced: "[ PREVIEW AUDIO SYNCED ]",
    masterNarratorTrack: "MASTER NARRATOR TRACK",
    voiceoverLabel: "VOICE OVER",
    ambientMusicTrack: "AMBIENT MUSIC BED TRACK",
    ambientWaveBed: "AMBIENT WAVE BED",
    audioAlignmentLocked: "Audio alignment layers are locked. Voice triggers will compile into single production blocks in upcoming studio revisions.",
    atmosTuning: "Atmos Tuning",
    voiceProfilePresets: "Voice Profile Presets",
    backgroundAcoustics: "Background Acoustics",
    stereoDepth: "Stereo Depth",
    purityThreshold: "Purity Threshold",
    dynamicRangeLimit: "Dynamic Range Limit",
    closeProjectBtn: "[ CLOSE PROJECT ]",
    resetWipePrompt: "Wipe active studio cache?"
  },
  vn: {
    appTitle: "HIDRO AI STUDIO 2.0",
    appSubtitle: "Kiến trúc Kính Apple",
    keyActive: "KHÓA ĐẠO DIỄN HOẠT ĐỘNG",
    liteSimulation: "ĐIỀU PHỐI MÔ PHỎNG LITE",
    closeProject: "Đóng Dự Án",
    closeBoard: "[ ĐỐNG DỰ ÁN ]",
    wipeConfirm: "Xóa bộ nhớ đính kèm đang hoạt động và tải lại bảng mới?",
    activeMatrix: "Ma trận Hoạt động Sẵn sàng",
    secureTransfer: "HỆ THỐNG HIDRO AI STUDIO PHIÊN BẢN 2.0.47 // TRUYỀN TẢI BẢO MẬT",
    footerStatus: "NỀN TẢNG: CONTAINER CHẠY CLOUD RUN VITE+EXPRESS",

    tabAssets: "1. Tài Nguyên Thương Hiệu",
    tabDirector: "2. Đạo Diễn AI",
    tabScripting: "3. Kịch Bản",
    tabVisuals: "4. Hình Ảnh (Kết Xuất)",
    tabMotion: "5. Chuyển Động (Beta)",
    tabMastering: "6. Hòa Âm (Beta)",
    tabInspector: "Kiểm Tra Prompt",

    assetsComplete: "✓ Tài Nguyên Hoàn Thành",
    directorComplete: "✓ Đạo Diễn AI Hoàn Thành",
    scriptComplete: "✓ Kịch Bản Hoàn Thành",
    visualsRunning: "⟳ Hình Ảnh Đang Chạy",
    visualsComplete: "✓ Hình Ảnh Hoàn Thành",
    motionLocked: "🔒 Chuyển Động Khóa",
    motionComplete: "✓ Chuyển Động Hoàn Thành",
    masteringLocked: "🔒 Hòa Âm Khóa",
    masteringComplete: "✓ Hòa Âm Hoàn Thành",

    initializePipeline: "Khởi tạo Đường ống",
    stepIndicator: "Bước {step} trên 5",
    cancelBtn: "[ HỦY BỎ ]",
    cinematicProjectName: "Đặt tên cho dự án điện ảnh của bạn",
    nameDesc: "Cung cấp một cái tên truyền cảm hứng biểu thị sản phẩm, chiến dịch tiếp thị liên kết hoặc thương hiệu chính.",
    namePlaceholder: "Ví dụ: Chiến dịch lan tỏa ra mắt Máy xay cầm tay",
    sysProductionType: "Chọn Loại hình Sản xuất Hệ thống",
    typeDesc: "Điều chỉnh phong cách thu hút (hook), khoảng thời gian giãn cách nhịp độ và khuôn mẫu kịch bản gốc.",
    targetPlatform: "Nền tảng Thương mại Xã hội Mục tiêu",
    platformDesc: "Định dạng các bố cục video kỹ thuật, tỷ lệ lề an toàn và mức khóa độ phân giải.",
    configureEngines: "Cấu hình Động cơ Tạo AI",
    engineTypeDesc: "Cài đặt tinh chỉnh được tối ưu hóa cho các lớp sản xuất tiêu chuẩn.",
    imageModelLabel: "MẪU HÌNH ẢNH (TẠO CHẤT LƯỢNG CAO)",
    movieModelLabel: "MẪU VIDEO (ĐỘNG LỰC CHUYỂN ĐỘNG)",
    bestFor: "Tốt nhất cho",
    pacingScenes: "Cấu hình Nhịp độ & Phân cảnh Mục tiêu",
    pacingDesc: "Cân bằng tốc độ kết xuất hình ảnh",
    expectedVideoDuration: "Thời lượng Video Dự kiến",
    durationLabelDesc: "Tổng thời lượng video mong muốn tính bằng giây.",
    secondsLabel: "giây",
    recommendedCalc: "Công thức khuyến nghị phân cảnh",
    sceneCountLabel: "Số lượng Phân cảnh",
    sceneCountDesc: "Số lượng ô phân cảnh storyboard được tạo nối tiếp tuần tự.",
    manualOverride: "GHI ĐÈ THỦ CÔNG",
    suggestedScenesLabel: "Khuyến nghị",
    resetToRecommend: "[ Đặt lại về Khuyến nghị ]",
    previousBtn: "QUAY LẠI",
    nextBtn: "TIẾP THEO",
    compileProjectBtn: "BIÊN SOẠN DỰ ÁN",
    recommendedOption: "★ Khuyên dùng",

    brandAssetsTitle: "1. Đưa Vào Tài Nguyên Thương Hiệu",
    brandAssetsDesc: "Xác định các nền tảng nhân vật, sản phẩm và phong cách để tạo khóa DNA đồng nhất liên tục.",
    analysisDispatch: "GỬI PHÂN TÍCH",
    charBaseline: "Nhân vật nền tảng",
    charPlaceholder: "Ví dụ: Người phụ nữ châu Á, giữa tuổi 20, tóc đen dài bóng, bộ vest công sở trang nhã màu kem nhạt, nhìn vào camera mỉm cười nhẹ nhàng.",
    prodBaseline: "Sản phẩm nền tảng",
    prodPlaceholder: "Ví dụ: Máy xay cầm tay, thiết kế thân máy màu trắng bóng bẩy, bình acrylic trong suốt, nút nguồn kim loại màu bạc phát sáng ở chân đế.",
    bgBaseline: "Bối cảnh nền tảng",
    bgPlaceholder: "Ví dụ: Căn bếp đương đại tối giản, quầy đảo bằng đá cẩm thạch, đèn LED nền ấm áp phát sáng dịu đằng sau.",
    styleBaseline: "Phong cách quay nền tảng",
    stylePlaceholder: "Ví dụ: Phim quảng cáo phong cách sống Apple đẳng cấp, cận cảnh macro, khúc xạ thủy tinh 8k, ánh sáng ngược giàu tâm trạng, độ sâu mờ dịu.",
    switchToText: "Chuyển sang mô tả văn bản",
    switchToUpload: "Chuyển sang tải ảnh lên",
    uploadPngJpg: "Tải PNG / JPG",
    changeImageBtn: "THAY ĐỔI ẢNH",
    missingAssetsAlert: "Vui lòng điền thông tin hoặc tải ảnh cấu hình cho cả 4 tài nguyên thương hiệu để khóa chặt DNA hệ thống.",
    uploadStepIndicator: "Bước Tải lên",

    charUpload: "Tải lên Nhân vật",
    prodUpload: "Tải lên Sản phẩm",
    bgUpload: "Tải lên Bối cảnh",
    styleUpload: "Tải lên Phong cách",
    analyzeAssetsBtn: "PHÂN TÍCH ASSETS",
    extractingDna: "Đang trích xuất DNA...",
    charDnaExtracted: "Đã Trích Xuất Character DNA",
    prodDnaExtracted: "Đã Trích Xuất Product DNA",
    bgDnaExtracted: "Đã Trích Xuất Background DNA",
    styleDnaExtracted: "Đã Trích Xuất Style DNA",
    continueToDirector: "TIẾP TỤC ĐẠO DIỄN AI",
    dnaChecklistHeader: "ĐƯỜNG ỐNG TRÍCH XUẤT DNA",
    dnaChecklistSub: "Sẵn sàng chạy quá trình trích xuất nhiễm sắc thể điện ảnh.",

    successTitle: "Cập nhật Đường ống Thành công",
    assetSuccessMsg: "Cú phân tích tài nguyên hoàn thành. Khóa DNA đã đóng băng các biến số chính xác.",
    directorSuccessMsg: "Đạo diễn AI hoàn tất. Đã khóa các biến số tiếp thị thương mại và định hướng giọng nói.",
    scriptSuccessMsg: "Biên soạn phân mảnh kịch bản hoàn tất. Tất cả phân cảnh đã được đồng bộ hóa.",
    visualSuccessMsg: "Mạch tạo hình ảnh hoàn thành. Tất cả phân cảnh đã sẵn sàng.",
    motionSuccessMsg: "Đã đông băng góc máy quay và thiết lập chuyển động bổ sung cho hòa âm.",

    directorTitle: "2. Không Gian Làm Việc Đạo Diễn AI",
    directorSubtitle: "Tổng hợp tài nguyên sản phẩm thành các quy tắc prompt đồng nhất tuyệt đối. Cất giữ bộ nhớ vĩnh viễn.",
    dispatchWriter: "ĐIỀU PHỐI BIÊN KỊCH",
    dnaLockSequenceRequired: "Yêu cầu Trình tự Khóa DNA",
    directorDeepScanDesc: "Bộ phận đạo diễn cần chạy quy trình quét siêu lân cận trên tài nguyên ảnh hoặc bài mô tả của bạn để khóa chính xác cấu trúc hình học nhân vật và sản phẩm.",
    extractDnaAndAnalyze: "TRÍCH XUẤT KHÓA DNA & PHÂN TÍCH CHIẾN DỊCH",
    contactingDirector: "ĐANG GIAO TIẾP VỚI GIAO THỨC ĐẠO DIỄN...",
    statesScanningVb: "ĐANG QUÉT CÁC GRAPH VECTƠ TÀI NGUYÊN...",
    statesChromExt: "ĐANG TRIỂN KHAI TRÍCH XUẤT SẮC ĐỘ...",
    statesLockChar: "ĐANG KHÓA CHỖI DNA (NHÂN VẬT)...",
    statesLockProd: "ĐANG KHÓA CHỖI DNA (SẢN PHẨM)...",
    statesLockStyle: "ĐANG KHÓA CHỖI DNA (PHONG CÁCH)...",
    statesFormIntent: "ĐANG CÔNG THỨC HÓA CẤU TRÚC Ý ĐỒ...",
    safeseedSec: "MÃ SEED AN TOÀN: ĐANG ĐỆM ENTROPY MẬT MÃ",
    safeInjectedChrome: "ĐANG BƠM NHIỄM SẮC THỂ ĐIỂM ẢNH VÀO LOGIC ĐƯỜNG ỐNG...",
    lockedDnaChains: "Các Chuỗi DNA Đã Khóa (Bộ nhớ Đồng nhất)",
    audPlatformRes: "Khả năng Cộng hưởng Nền tảng & Khách hàng",
    audienceInsight: "THÔNG TIN CHI TIẾT KHÁCH HÀNG",
    platformComp: "GÓC ĐỘ CẠNH TRANH NỀN TẢNG",
    affiliateMarketingPriority: "GIÁ TRỊ TIẾP THỊ LIÊN KẾT (ƯU TIÊN)",
    cinematicDnaRules: "Quy tắc Thiết kế DNA Điện ảnh",
    microHook: "CHIẾN LƯỢC MÓC NỐI (HOOK) SIÊU LÂN CẬN",
    visualSpectrum: "QUY CHUẨN MÀU CẢNH THỊ GIÁC & GÓC QUAY",
    soundVoiceNarrative: "PROMPT ĐÀI TỪ & ĐỊNH HƯỚNG ÂM THANH",
    promptInjEngineArmed: "HỆ THỐNG PHUN PROMPT ĐÃ LÊN ĐẠN",
    promptInjDesc: "Chúng tôi đã lưu giữ 4 tham số DNA này vào lớp phun của prompt bảo mật. Quá trình tạo Kịch bản và Tài nguyên hình ảnh phân cảnh giờ đây sẽ tự động kế thừa để triệt tiêu các lỗi biến dạng.",
    generateScriptBtn: "TẠO KỊCH BẢN",

    scriptingTitle: "3. Logic Kịch Bản & Phân rã Phân cảnh",
    scriptingDesc: "Tác giả kịch bản bằng bộ sinh AI hoặc dán trực tiếp bản thảo tay của con người. Tự động chia nhỏ phân cảnh và map khóa DNA.",
    dispatchImager: "ĐIỀU PHỐI ĐỒ HỌA",
    aiGenerateScriptTab: "AI Tạo Kịch Bản",
    directPasteScriptTab: "Phác Thảo Dán Trực Tiếp",
    directorialDirective: "Chỉ thị Đạo diễn & Định hướng Tông giọng",
    aiFocusPlaceholder: "Ví dụ: Video giới thiệu tập luyện năng lượng cao mô tả lợi ích sức khỏe và kích cỡ thuận tiện. Tông giọng sôi động, nhận xét dí dỏm, tập trung vào máy lắc cầm tay.",
    aiSceneCountHelper: "AI tự động ánh xạ các chỉ thị này để xây dựng chuẩn xác {count} phân cảnh kịch bản.",
    pasteRawContent: "Dán trực tiếp văn bản nội dung của bạn",
    autoDeconstructEnabled: "[ TỰ ĐỘNG PHÂN TÍCH ĐÃ BẬT ]",
    pasteDescPlaceholder: "Dán nội dung kịch bản vào đây. Diễn đạt phân cảnh bằng phần thoại của Người kể chuyện, vị trí nhân vật hoặc thẻ chỉ thị cảnh quay. AI sẽ đọc bối cảnh một cách động.",
    generateScriptBlocksBtn: "TẠO PHÂN CẢNH KỊCH BẢN",
    deconstructLayoutBtn: "PHÂN TÍCH & PHÂN BỐ CẤU TRÚC PHÂN CẢNH",
    playbookCompiledBtn: "Kịch Bản Đã Biên Soạn",
    compilingSceneStructures: "Đang Biên Soạn Cấu Trúc Phân Cảnh...",
    staplingDnaLocks: "ĐANG ĐÍNH CHẶT KHÓA DNA NHÂN VẬT...",
    autoCalculatingAction: "TỰ ĐỘNG TÍNH TOÁN SAI SỐ KHUNG HÌNH HÀNH ĐỘNG...",
    formattingDialogueSym: "ĐANG ĐỊNH DẠNG CÁC LỚP CHỒNG THOẠI SYNAPSE...",
    noPlaybookYet: "Chưa Có Kịch Bản Nào Được Tạo",
    noPlaybookDesc: "Hãy viết nháp hoặc dán đề cương để xây dựng các phân cảnh trước. Khi hoàn tất, các phân cảnh riêng lẻ sẽ được ánh xạ động trực tiếp sang đường ống tạo hình ảnh.",
    startImageGenerationBtn: "BẮT ĐẦU TẠO ẢNH",

    visualsPipelineTitle: "4. Mạch Tạo Hình Ảnh Phân Cảnh Đồng Nhất",
    visualsPipelineDesc: "Các hành động xếp hàng sẽ thực hiện quá trình khóa tuần tự để kết xuất tất cả tài nguyên liên tục.",
    stopRenderQueue: "Dừng Hàng Chờ Kết Xuất",
    startRenderQueue: "Bắt đầu Hàng Chờ Kết Xuất Tuần Tự",
    exportSuite: "[ BỘ EXPORT TIỆN ÍCH ]",
    downloadImagesPack: "Tải Xuống Gói Hình Ảnh",
    exportPromptPack: "Xuất Gói Prompt Phân Cảnh",
    exportJsonSchema: "Xuất Định dạng dữ liệu JSON",
    exportTxtDraft: "Xuất Bản Thảo Văn Bản TXT",
    queueActive: "HÀNG CHỜ ĐANG CHẠY",
    compilingScene: "Đang biên soạn tuần tự Phân cảnh {current} trên {total}...",
    noParallelInterference: "[ KHÔNG CAN THIỆP SONG SONG ]",
    sceneLabel: "PHÂN CẢNH",
    statusRendering: "Đang Kết Xuất",
    statusLocked: "Đồng Bộ",
    statusFailed: "Thất Bại",
    statusPending: "Đang Chờ",
    engineRetryInjector: "[ BỘ PHUN THỬ LẠI KẾT XUẤT ]",
    attemptOf: "THỬ LẠI LẦN {attempt} TRÊN {max}",
    voiceoverNarration: "VĂN BẢN THOẠI KỊCH BẢN",
    actionCol: "HÀNH ĐỘNG",
    styleCol: "PHONG CÁCH",
    downloadAllBtn: "TẢI TẤT CẢ",
    continueToVideoBtn: "CHUYỂN QUA VIDEO",

    motionTitle: "5. Động Cơ Động Lực Chuyển Động",
    motionSubtitle: "Xuất các prompt camera nâng cao, mức độ tác động vật lý và mô tả chuyển động để triệt tiêu lỗi hỏng hình ảnh của AI.",
    motionBetaBadge: "ĐƯỜNG ỐNG BETA",
    enginesListDesc: "Các chỉ thị chuyển động được biên soạn động tương ứng.",
    directorAdvisory: "CẢNH BÁO ĐẠO DIỄN // CHƯA CÓ KẾT XUẤT VIDEO TRỰC TIẾP",
    motionSimulatedBetaDesc: "Chức năng kết xuất video hiện tại đang nằm ở giai đoạn Beta mô phỏng. Sử dụng các nút copy bên dưới để sao chép chuẩn xác hướng dẫn vị trí Camera, định hướng Vật lý và thiết lập Giọng nói để chạy chuẩn xác trên bảng console {engine} ngoài của bạn!",
    sceneMotionDirectives: "CHỈ THỊ CHUYỂN ĐỘNG PHÂN CẢNH {number}",
    mappedOnEngine: "ĐƯỢC ÁNH XẠ TRONG CẤU HÌNH ĐỘNG CƠ",
    stableVideoPrompt: "PROMPT CHUYỂN ĐỘNG VIDEO ỔN ĐỊNH (ĐÃ IN VẾT DNA)",
    cameraActuator: "ĐIỀU HƯỚNG GÓC CAMERA",
    physicsStrength: "CƯỜNG ĐỘ VẬT LÝ BIẾN ĐỘNG",
    copiedText: "ĐÃ SAO CHÉP",
    copyActuator: "[ SAO CHÉP LỆNH CAMERA ]",
    copyPhysics: "[ SAO CHÉP VẬT LÝ ]",
    continueToMasteringBtn: "TIẾP TỤC ĐẾN HÒA ÂM",

    masteringTitle: "6. Bảng Điều Hòa Âm & Tổng Hợp Âm Thanh",
    masteringSubtitle: "Trục thời gian hậu kỳ. Phối hợp giọng thoại chất lượng cao, các dải âm thanh hiệu ứng đồng bộ và mảng âm nền khít với chuyển đoạn cảnh.",
    timelineWaveformTitle: "BỘ ĐIỀU PHỐI ĐA KÊNH // DOLBY SYNAPSE",
    previewAudioSynced: "[ XEM TRƯỚC ĐÃ ĐỒNG BỘ ÂM THANH ]",
    masterNarratorTrack: "KÊNH GIỌNG THOẠI CHÍNH",
    voiceoverLabel: "THOẠI NARRATOR",
    ambientMusicTrack: "KÊNH NHẠC NỀN KHÔNG GIAN BỔ TRỢ",
    ambientWaveBed: "SÓNG ÂM NỀN NHẠC",
    audioAlignmentLocked: "Các lớp căn chỉnh âm thanh hiện đang bị khóa. Trình kích hoạt giọng nói sẽ biên soạn tích hợp vào một gói duy nhất trong các phiên bản cập nhật tới.",
    atmosTuning: "Hòa Âm Không Gian",
    voiceProfilePresets: "Hồ Sơ Giọng Nói Mẫu",
    backgroundAcoustics: "Âm Thanh Không Gian Nền",
    stereoDepth: "Độ Sâu Âm Trường",
    purityThreshold: "Ngưỡng Độ Sạch",
    dynamicRangeLimit: "Giới Hạn Dải Động",
    closeProjectBtn: "[ ĐÓNG DỰ ÁN ]",
    resetWipePrompt: "Xóa toàn bộ lưu trữ của bộ biên soạn đang tải?"
  }
};

import React, { createContext, useContext, useState } from 'react';

// Translator helper
export function translate(lang: Language, key: keyof TranslationSchema, variables?: Record<string, string | number>): string {
  const translationsForLang = TRANSLATIONS[lang];
  let text = translationsForLang[key] || TRANSLATIONS['en'][key] || '';
  if (variables) {
    Object.entries(variables).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return text;
}

interface LanguageContextProps {
  lang: Language;
  t: (key: keyof TranslationSchema, variables?: Record<string, string | number>) => string;
  setLang: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('hidro_studio_lang');
      if (stored === 'en' || stored === 'vn') {
        return stored;
      }
    } catch (e) {}
    return 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('hidro_studio_lang', newLang);
    } catch (e) {}
  };

  const t = (key: keyof TranslationSchema, variables?: Record<string, string | number>) => {
    return translate(lang, key, variables);
  };

  return React.createElement(
    LanguageContext.Provider,
    { value: { lang, t, setLang } },
    children
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
