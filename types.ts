import { WebsiteCode } from './services/geminiService';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
