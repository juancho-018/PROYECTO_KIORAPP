import type { IHttpClient } from '../core/http/HttpClient';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiResponse {
  response: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  } | null;
}

export interface DashboardInsights {
  insight: string;
  trend_percentage: number;
  trend_direction: 'up' | 'down';
  trend_comparison: string;
  timestamp: string;
}

export class AiService {
  constructor(private httpClient: IHttpClient) {}

  async ask(message: string, conversation: ChatMessage[] = []): Promise<AiResponse> {
    const response = await this.httpClient.post<AiResponse>('/ai/ask', {
      message,
      conversation,
    });

    if (!response.ok || !response.data) {
      throw new Error(response.error ?? 'Error al contactar al asistente');
    }

    return response.data;
  }

  async getInsights(): Promise<DashboardInsights> {
    const response = await this.httpClient.get<DashboardInsights>('/ai/insights');

    if (!response.ok || !response.data) {
      throw new Error(response.error ?? 'Error al obtener insights');
    }

    return response.data;
  }
}
