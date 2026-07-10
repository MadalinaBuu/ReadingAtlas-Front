import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';
import { MapViewComponent } from '../../components/map-view/map-view.component';
import { GeminiLocation } from '../../models/gemini-location.model';
import { CreateLocation } from '../../models/location.model';
import { BookFormComponent } from "../../components/book-form/book-form.component";
import { CreateBook } from '../../models/book.model';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, MapViewComponent, BookFormComponent],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.scss'
})
export class BookDetailComponent implements OnInit {
  book?: Book;
  isLoading = true;
  showDeleteConfirm = false;
  showFullNotes = false;

  // AI suggestion
  suggestedLocation?: GeminiLocation;
  isLoadingSuggestion = false;
  locationConfirmed = false;
  suggestionError = '';

  showEditForm = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.bookService.getBookById(id).subscribe({
      next: (book) => {
        this.book = book;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/books']);
      }
    });
  }

  onSuggestLocation(): void {
    if (!this.book) return;
    this.isLoadingSuggestion = true;
    this.suggestionError = '';
    this.suggestedLocation = undefined;
    this.locationConfirmed = false;

    this.bookService.suggestLocation({
      title: this.book.title,
      author: this.book.author
    }).subscribe({
      next: (location) => {
        this.suggestedLocation = location;
        this.isLoadingSuggestion = false;
      },
      error: (error) => {
        this.suggestionError = error.message || 'Could not get suggestion. Try again in a moment.';
        this.isLoadingSuggestion = false;
      }
    });
  }

  onConfirmLocation(): void {
    if (!this.book || !this.suggestedLocation) return;

    const location: CreateLocation = {
      bookId: this.book.id,
      placeName: this.suggestedLocation.placeName,
      country: this.suggestedLocation.country,
      lat: this.suggestedLocation.lat,
      lng: this.suggestedLocation.lng,
      description: this.suggestedLocation.context,
      isAiSuggested: true,
      isConfirmed: true
    };

    this.bookService.addLocation(location).subscribe({
      next: () => {
        // Reincarcam cartea ca sa vedem locatia pe harta
        this.bookService.getBookById(this.book!.id).subscribe(b => {
          this.book = b;
          this.suggestedLocation = undefined;
          this.locationConfirmed = true;
        });
      },
      error: () => console.error('Error saving location')
    });
  }

  onDelete(): void {
    if (!this.book) return;
    this.bookService.deleteBook(this.book.id).subscribe({
      next: () => this.router.navigate(['/books']),
      error: () => console.error('Error deleting book')
    });
  }

  getRatingStars(rating: number): string {
    return '⭐'.repeat(rating);
  }

  goBack(): void {
    this.router.navigate(['/books']);
  }

  onEditSaved(event: { book: CreateBook, location?: GeminiLocation }): void {
    if (!this.book) return;

    this.bookService.updateBook(this.book.id, event.book).subscribe({
      next: (updatedBook) => {
        // Daca avem locatie noua confirmata, o salvam
        if (event.location) {
          const location: CreateLocation = {
            bookId: this.book!.id,
            placeName: event.location.placeName,
            country: event.location.country,
            lat: event.location.lat,
            lng: event.location.lng,
            description: event.location.context,
            isAiSuggested: true,
            isConfirmed: true
          };

          // Daca cartea are deja locatie, o actualizam; altfel o adaugam
          if (this.book!.location) {
            this.bookService.updateLocation(this.book!.location.id, location).subscribe({
              next: () => {
                this.bookService.getBookById(this.book!.id).subscribe(b => {
                  this.book = b;
                  this.showEditForm = false;
                });
              }
            });
          } else {
            this.bookService.addLocation(location).subscribe({
              next: () => {
                this.bookService.getBookById(this.book!.id).subscribe(b => {
                  this.book = b;
                  this.showEditForm = false;
                });
              }
            });
          }
        } else {
          // Fara locatie noua, reincarcam cartea
          this.bookService.getBookById(updatedBook.id).subscribe(b => {
            this.book = b;
            this.showEditForm = false;
          });
        }
      },
      error: () => console.error('Error updating book')
    });
  }
}