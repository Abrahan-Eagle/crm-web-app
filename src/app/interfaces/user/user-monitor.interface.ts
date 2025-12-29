export interface UserEvent {
  user_id: string;
  tenant_id: string | null;
  location: string;
  created_at: string;
  event_name: 'SCREENSHOT' | 'OPEN_CONSOLE' | 'COPY' | 'PRINT' | 'UNAUTHORIZED_URL_ACCESS' | 'WINDOW_SIZE_CHANGE';
  user_agent: string;
  metadata: any;
}
