import { Location } from './location.model';

export interface Book {
  id: number;
  title: string;
  author: string;
  genre?: string;
  rating?: number;
  dateRead?: string;
  notes?: string;
  createdAt: string;
  location?: Location;
}

export interface CreateBook {
  title: string;
  author: string;
  genre?: string;
  rating?: number;
  dateRead?: string;
  notes?: string;
}