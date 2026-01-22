
export interface Story {
  id: string;
  text: string;
  timestamp: number;
  isUserSubmitted: boolean;
}

export interface GeminiResponse {
  story: string;
}
