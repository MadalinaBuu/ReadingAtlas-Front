export interface GeminiLocation {
  placeName: string;
  country: string;
  lat: number;
  lng: number;
  context: string;
}

export interface SuggestLocationRequest {
  title: string;
  author: string;
}