import api from './api';

export interface AIMessage {
  id: number;
  prompt: string;
  response: string;
  requestType: string;
  status: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const sendAIRequest = async (
  businessId: number,
  userId: number,
  prompt: string,
  requestType: string = 'INSIGHT',
): Promise<AIMessage> => {
  try {
    const response = await api.post<ApiResponse<AIMessage>>('/ai/request', {
      businessId,
      userId,
      prompt,
      requestType,
    });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'AI request failed');
  } catch (error: any) {
    console.error('Error sending AI request:', error);
    throw error;
  }
};

export const getAIHistory = async (businessId: number): Promise<AIMessage[]> => {
  try {
    const response = await api.get<ApiResponse<AIMessage[]>>(`/ai/business/${businessId}`);
    if (response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error: any) {
    console.error('Error fetching AI history:', error);
    return [];
  }
};
export const triggerEmailAutomation = async (
  businessId: number,
  userId: number,
): Promise<any> => {
  // This URL should be replaced with the actual n8n Webhook URL
  const N8N_WEBHOOK_URL = 'https://n8n.your-domain.com/webhook/trigger-emails';
  
  try {
    const response = await api.post(N8N_WEBHOOK_URL, {
      businessId,
      userId,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  } catch (error: any) {
    console.error('Error triggering n8n email automation:', error);
    throw error;
  }
};
