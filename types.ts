

export enum Platform {
  YOUTUBE = 'YouTube',
  FACEBOOK = 'Facebook'
}

export enum ContentType {
  POST = 'Post',
  SHORT = 'Short/Reel',
  SCRIPT = 'Video Script'
}

export interface GeneratedContent {
  title: string;
  body: string;
  hashtags: string[];
  imagePrompt?: string;
}

export interface TrendResult {
  query: string;
  summary: string;
  sources: { title: string; url: string }[];
}

export interface MockComment {
  id: string;
  user: string;
  text: string;
  platform: Platform;
  timestamp: string;
  avatar: string;
}

export interface ChartData {
  name: string;
  yt: number;
  fb: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}
