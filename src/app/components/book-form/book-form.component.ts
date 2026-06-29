import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CreateBook } from '../../models/book.model';
import { GeminiLocation } from '../../models/gemini-location.model';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
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

  onSubmit(): void {
    if (this.form.valid) {
      this.bookSubmitted.emit({
        book: this.form.value,
        location: this.locationConfirmed ? this.suggestedLocation : undefined
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.form.reset();
    this.suggestedLocation = undefined;
    this.locationConfirmed = false;
    this.cancelled.emit();
  }
}