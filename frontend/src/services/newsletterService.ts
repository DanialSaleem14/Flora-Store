import { api } from './api';

export const subscribeNewsletter = (email: string) =>
  api.post<{ success: boolean; message: string }>('/newsletter/subscribe', { email }).then((r) => r.data);
