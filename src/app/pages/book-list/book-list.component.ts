import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookFormComponent } from '../../components/book-form/book-form.component';
import { CreateBook } from '../../models/book.model';
import { CreateLocation } from '../../models/location.model';
import { GeminiLocation } from '../../models/gemini-location.model';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, BookFormComponent],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss'
})
export class BookListComponent {
  showForm = false;

  constructor(private bookService: BookService) {}

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
      },
      error: () => console.error('Error saving book')
    });
  }
}