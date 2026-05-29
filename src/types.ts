export type ProjectType =
  | 'Affiliate Marketing'
  | 'Product TVC'
  | 'Marketing Ads'
  | 'TikTok Viral'
  | 'YouTube Automation'
  | 'AI Documentary'
  | 'Business Insight'
  | 'Custom Workflow';

export type SocialPlatform =
  | 'TikTok'
  | 'Shopee Video'
  | 'Facebook'
  | 'Instagram'
  | 'YouTube Shorts'
  | 'YouTube Longform'
  | 'Multi Platform'
  | 'Shopee'
  | 'Lazada'
  | 'Amazon'
  | 'YouTube';

export interface DNAModuleItem {
  id: string;
  name: string; // Name/title of the sub-asset element, e.g. "Character A", "Product Front"
  imageBase64?: string; // stored base64 image data
  fileName?: string; // name of the uploaded file
}

export interface DNAStructure {
  prompt: string; // Text prompt for description or hybrid models
  items: DNAModuleItem[]; // List of multiple uploaded images or sub-items (0 to unlimited)
}

export interface ProjectAssets {
  character: DNAStructure;
  product: DNAStructure;
  background: DNAStructure;
  style: DNAStructure;
}

export function normalizeAssets(assets: any): ProjectAssets {
  const categories: ('character' | 'product' | 'background' | 'style')[] = [
    'character',
    'product',
    'background',
    'style'
  ];
  
  const normalized: Partial<ProjectAssets> = {};
  
  categories.forEach(cat => {
    const raw = assets?.[cat];
    
    // Default
    const defaultStructure: DNAStructure = {
      prompt: '',
      items: []
    };
    
    if (!raw) {
      normalized[cat] = defaultStructure;
      return;
    }
    
    // New format check
    if ('prompt' in raw && Array.isArray(raw.items)) {
      normalized[cat] = {
        prompt: raw.prompt || '',
        items: raw.items
      };
      return;
    }
    
    // Convert old format
    const promptValue = raw.type === 'describe' ? raw.value : '';
    const itemsValue: DNAModuleItem[] = [];
    
    if (raw.type === 'upload' && raw.imageBase64) {
      itemsValue.push({
        id: `old-img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: raw.value || 'Uploaded Image',
        imageBase64: raw.imageBase64,
        fileName: raw.value ? raw.value.replace('Loaded file: ', '') : 'upload.png'
      });
    } else if (raw.type === 'upload' && raw.value) {
      itemsValue.push({
        id: `old-img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: raw.value,
        imageBase64: raw.imageBase64
      });
    }
    
    normalized[cat] = {
      prompt: promptValue || '',
      items: itemsValue
    };
  });
  
  return normalized as ProjectAssets;
}

export interface AssetField {
  type: 'upload' | 'describe';
  value: string; // upload asset name or text description
  imageBase64?: string; // stored base64 image or placeholder
}

export interface DNALock {
  CHARACTER_DNA: string;
  PRODUCT_DNA: string;
  BACKGROUND_DNA: string;
  STYLE_DNA: string;
}

export interface AIDirectorInsight {
  audience: string;
  marketInsight: string;
  competitorAngle: string;
  hookStrategy: string;
  affiliateAngle: string;
  visualDNA: string;
  voiceDNA: string;
  contentStructure: string;
}

export interface SceneCard {
  id: string;
  sceneNumber: number;
  narration: string;
  action: string;
  visualDirection: string;
  imagePrompt: string; // Prompt containing injected DNA
  videoPrompt: string; // Prompt containing injected DNA
  negativePrompt: string;
  cameraPrompt: string;
  motionPrompt: string;
  voicePrompt: string;
  imageUrl?: string;
  status: 'idle' | 'rendering' | 'completed' | 'failed';
  attempts: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  type: ProjectType;
  platform: SocialPlatform;
  sceneCount: number;
  targetDuration: number; // in seconds, editable or auto calculated
  imageModel?: ImageModel;
  videoModel?: VideoModel;
  createdAt: string;
  lastModified: string;
  assets: ProjectAssets;
  dnaLock?: DNALock;
  directorInsight?: AIDirectorInsight;
  scenes: SceneCard[];
  scriptText?: string; // Raw user script input, or AI generated script representation
  scriptInputMode: 'ai' | 'paste';
  assetsAnalyzed?: boolean;
  aiDirectorCompleted?: boolean;
  scriptingCompleted?: boolean;
  visualsCompleted?: boolean;
  motionCompleted?: boolean;
  videoLengthMode?: 'Auto' | '15s' | '30s' | '45s' | '60s' | '90s' | '120s' | 'Custom';
  customVideoLength?: number;
  targetLanguage?: 'Vietnamese' | 'English';
  isFavorite?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  status?: 'Draft' | 'Analyzing' | 'Writing' | 'Generating Images' | 'Generating Videos' | 'Completed' | 'Archived';
  versionHistory?: { id: string; name: string; timestamp: string; data: string }[];
  thumbnailUrl?: string;
}

export type ImageModel =
  | 'Nano Banana Pro'
  | 'Nano Banana 2'
  | 'Imagen 4';

export type VideoModel =
  | 'Omni Flash'
  | 'Veo 3.1 Lite'
  | 'Veo 3.1 Fast'
  | 'Veo 3.1 Quality';

