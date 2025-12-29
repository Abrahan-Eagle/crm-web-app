export interface Note {
  id: string;
  level: string;
  description: string;
  created_at: string;
  author: {
    id: string;
    first_name: string;
    last_name: string;
  };
}
