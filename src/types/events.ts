export interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'global' | 'personal';
  description?: string;
  color?: string;
}

export interface EventsByYear {
  [year: number]: Event[];
}
