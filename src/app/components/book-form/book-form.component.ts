import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CreateBook } from '../../models/book.model';
import { GeminiLocation } from '../../models/gemini-location.model';
import { BookService } from '../../services/book.service';
import { MapViewComponent } from '../map-view/map-view.component';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MapViewComponent],
  templateUrl: './book-form.component.html',
  styleUrl: './book-form.component.scss'
})
export class BookFormComponent {
  @Output() bookSubmitted = new EventEmitter<{ book: CreateBook, location?: GeminiLocation }>();
  @Output() cancelled = new EventEmitter<void>();

  form: FormGroup;
  suggestedLocation?: GeminiLocation;
  locationConfirmed = false;
  isLoadingSuggestion = false;
  suggestionError = '';
  adjustedCoords?: { lat: number, lng: number };

  genres = ['Fiction', 'Non-fiction', 'Fantasy', 'Thriller', 'Romance',
    'Mystery', 'Historical', 'Science Fiction', 'Biography', 'Other'];

  constructor(private fb: FormBuilder, private bookService: BookService) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      genre: [''],
      rating: [null, [Validators.min(1), Validators.max(5)]],
      dateRead: [''],
      notes: ['']
    });
  }

  get canSuggest(): boolean {
    return this.form.get('title')?.valid === true &&
      this.form.get('author')?.value?.trim().length > 0;
  }

  onSuggestLocation(): void {
    const title = this.form.get('title')?.value;
    const author = this.form.get('author')?.value;

    if (!title || !author) return;

    this.isLoadingSuggestion = true;
    this.suggestionError = '';
    this.suggestedLocation = undefined;
    this.locationConfirmed = false;
    this.adjustedCoords = undefined;

    this.bookService.suggestLocation({ title, author }).subscribe({
      next: (location) => {
        this.suggestedLocation = location;
        this.isLoadingSuggestion = false;
      },
      error: () => {
        this.suggestionError = 'Could not get location suggestion. Try again in a moment.';
        this.isLoadingSuggestion = false;
      }
    });
  }

  onConfirmLocation(): void {
    this.locationConfirmed = true;
  }

 onLocationAdjusted(coords: { lat: number, lng: number }): void {
  this.adjustedCoords = coords;
  this.locationConfirmed = true;

  this.bookService.reverseGeocode(coords.lat, coords.lng).subscribe({
    next: (result) => {
      if (this.suggestedLocation && result.address) {
        this.suggestedLocation = {
          ...this.suggestedLocation,
          lat: coords.lat,
          lng: coords.lng,
          placeName: result.address.city 
            || result.address.town 
            || result.address.village 
            || result.address.county
            || this.suggestedLocation.placeName,
          country: result.address.country || this.suggestedLocation.country
        };
      }
    }
  });
}

  onSubmit(): void {
    if (this.form.valid) {
      const locationToSave = this.suggestedLocation ? {
        ...this.suggestedLocation,
        lat: this.adjustedCoords?.lat ?? this.suggestedLocation.lat,
        lng: this.adjustedCoords?.lng ?? this.suggestedLocation.lng
      } : undefined;

console.log('locationConfirmed:', this.locationConfirmed);
console.log('suggestedLocation:', this.suggestedLocation);
console.log('adjustedCoords:', this.adjustedCoords);
console.log('locationToSave:', locationToSave);

      this.bookSubmitted.emit({
        book: this.form.value,
        location: this.locationConfirmed ? locationToSave : undefined
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.form.reset();
    this.suggestedLocation = undefined;
    this.locationConfirmed = false;
    this.adjustedCoords = undefined;
    this.cancelled.emit();
  }
}