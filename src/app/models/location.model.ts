export interface Location {
  id: number;
  bookId: number;
  placeName: string;
  country?: string;
  lat: number;
  lng: number;
  description?: string;
  isAiSuggested: boolean;
  isConfirmed: boolean;
}

export interface CreateLocation {
  bookId: number;
  placeName: string;
  country?: string;
  lat: number;
  lng: number;
  description?: string;
  isAiSuggested: boolean;
  isConfirmed: boolean;
}