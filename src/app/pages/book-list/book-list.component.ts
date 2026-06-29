import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookFormComponent } from '../../components/book-form/book-form.component';
import { CreateBook } from '../../models/book.model';
import { CreateLocation } from '../../models/location.model';
import { GeminiLocation } from '../../models/gemini-location.model';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, BookFormComponent],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss'
})
export class BookListComponent implements OnInit {
  showForm = false;
  books: Book[] = [];
  isLoading = true;

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.isLoading = true;
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
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