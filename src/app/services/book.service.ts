import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Book, CreateBook } from '../models/book.model';
import { Location, CreateLocation } from '../models/location.model';
import { GeminiLocation, SuggestLocationRequest } from '../models/gemini-location.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Books
  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/books`);
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/books/${id}`);
  }

  addBook(book: CreateBook): Observable<Book> {
    const payload = {
      ...book,
      dateRead: book.dateRead || null,
      rating: book.rating || null
    };
    return this.http.post<Book>(`${this.apiUrl}/books`, payload);
  }

  updateBook(id: number, book: CreateBook): Observable<Book> {
    const payload = {
      ...book,
      dateRead: book.dateRead || null,
      rating: book.rating || null
    };
    return this.http.put<Book>(`${this.apiUrl}/books/${id}`, payload);
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
    return this.http.post<GeminiLocation>(`${this.apiUrl}/locations/suggest`, request)
      .pipe(
        catchError((error) => {
        console.log(error);
          if (error.status === 429) {
            return throwError(() => new Error("You've reached your AI suggestion limit for today. Please try again tomorrow!"));
          }
          console.log(this);
          return throwError(() => new Error('Could not get suggestion. Try again in a moment.'));
        })
      );
  }

  reverseGeocode(lat: number, lng: number): Observable<any> {
    return this.http.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
  }

  checkDuplicate(title: string, author: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/books/check-duplicate`, {
      params: { title, author }
    });
  }

  // Location processing status
  getLocationStatus(): Observable<{ total: number; withLocation: number; isComplete: boolean }> {
    return this.http.get<{ total: number; withLocation: number; isComplete: boolean }>(`${this.apiUrl}/books/location-status`);
  }
}