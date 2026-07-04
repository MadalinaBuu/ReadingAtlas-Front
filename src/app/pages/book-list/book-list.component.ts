import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookFormComponent } from '../../components/book-form/book-form.component';
import { CreateBook, Book } from '../../models/book.model';
import { CreateLocation } from '../../models/location.model';
import { GeminiLocation } from '../../models/gemini-location.model';
import { BookService } from '../../services/book.service';
import { StatsPanelComponent } from "../../components/stats-panel/stats-panel.component";

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, BookFormComponent, FormsModule, StatsPanelComponent],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss'
})
export class BookListComponent implements OnInit {
  showForm = false;
  books: Book[] = [];
  filteredBooks: Book[] = [];
  isLoading = true;

  // Filtre
  filterGenre = '';
  filterYear = '';
  filterAuthor = '';

  get availableGenres(): string[] {
    const genres = this.books
      .map(b => b.genre)
      .filter((g): g is string => !!g);
    return [...new Set(genres)].sort();
  }

  get availableYears(): string[] {
    const years = this.books
      .map(b => b.dateRead ? new Date(b.dateRead).getFullYear().toString() : null)
      .filter((y): y is string => !!y);
    return [...new Set(years)].sort().reverse();
  }

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.isLoading = true;
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  applyFilters(): void {
    this.filteredBooks = this.books.filter(book => {
      const matchesGenre = !this.filterGenre || book.genre === this.filterGenre;
      const matchesYear = !this.filterYear || 
        (book.dateRead && new Date(book.dateRead).getFullYear().toString() === this.filterYear);
      const matchesAuthor = !this.filterAuthor || 
        book.author.toLowerCase().includes(this.filterAuthor.toLowerCase());
      return matchesGenre && matchesYear && matchesAuthor;
    });
  }

  resetFilters(): void {
    this.filterGenre = '';
    this.filterYear = '';
    this.filterAuthor = '';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!this.filterGenre || !!this.filterYear || !!this.filterAuthor;
  }

  onBookSubmitted(event: { book: CreateBook, location?: GeminiLocation }): void {
    this.bookService.addBook(event.book).subscribe({
      next: (savedBook) => {
        if (event.location) {
          const location: CreateLocation = {
            bookId: savedBook.id,
            placeName: event.location.placeName,
            country: event.location.country,
            lat: event.location.lat,
            lng: event.location.lng,
            description: event.location.context,
            isAiSuggested: true,
            isConfirmed: true
          };
          this.bookService.addLocation(location).subscribe();
        }
        this.showForm = false;
        this.loadBooks();
      },
      error: () => console.error('Error saving book')
    });
  }
}