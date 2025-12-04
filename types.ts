export interface StoryPage {
  text: string;
  imagePrompt: string;
  imageUrl?: string;
  isLoadingImage?: boolean;
}

export interface Story {
  title: string;
  pages: StoryPage[];
}

export enum ImageSize {
  Size1K = "1K",
  Size2K = "2K",
  Size4K = "4K"
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
