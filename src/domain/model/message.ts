export type Message = {
  role: 'user' | 'system';
  content: string;
  index: number;
};
