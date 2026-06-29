import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book, CreateBook } from '../models/book.model';
import { Location, CreateLocation } from '../models/location.model';
import { GeminiLocation, SuggestLocationRequest } from '../models/gemini-location.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'https://localhost:7187/api';

  constructor(private http: HttpClient) {}

  // Books
  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/books`);
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/books/${id}`);
  }

  addBook(book: CreateBook): Observable<Book> {
    return this.http.post<Book>(`${this.apiUrl}/books`, book);
  }

  updateBook(id: number, book: CreateBook): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/books/${id}`, book);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/books/${id}`);
  }

  // Locations
  getLocationByBookId(bookId: number): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl}/locations/book/${bookId}`);
  }

  addLocation(location: CreateLocation): Observable<Location> {
    return this.http.post<Location>(`${this.apiUrl}/locations`, location);
  }

  updateLocation(id: number, location: CreateLocation): Observable<Location> {
    return this.http.put<Location>(`${this.apiUrl}/locations/${id}`, location);
  }

  // AI
  suggestLocation(request: SuggestLocationRequest): Observable<GeminiLocation> {
    return this.http.post<GeminiLocation>(`${this.apiUrl}/locations/suggest`, request);
  }
}