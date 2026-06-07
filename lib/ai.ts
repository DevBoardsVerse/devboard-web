import { api} from '@/lib/api'; // adjust path if different

export interface SuggestTaskResult {
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
}

export async function suggestTask(
  title: string,
  description?: string,
): Promise<SuggestTaskResult> {
  try {
    const { data: res } = await api.post<{ data: SuggestTaskResult }>('/ai/suggest-task', {
      title,
      description,
    });
    return res.data;
  } catch (err: any) {
    console.error('[AI] suggest error:', err.response?.data ?? err.message);
    throw err;
  }
}