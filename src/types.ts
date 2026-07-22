export type IntelligenceEngine = 'standard' | 'reasoning' | 'creative';

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  base64: string;
  previewUrl?: string;
}

export interface ReplyQuote {
  messageId: string;
  role: 'user' | 'assistant' | 'model';
  snippet: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'model';
  content: string;
  timestamp: string;
  thinkingSteps?: string[];
  sources?: GroundingSource[];
  searchQueries?: string[];
  attachments?: Attachment[];
  videoUrl?: string;
  replyTo?: ReplyQuote;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatSession {
  id: string;
  title: string;
  engine: IntelligenceEngine;
  searchEnabled: boolean;
  messages: Message[];
  createdAt: string;
}
