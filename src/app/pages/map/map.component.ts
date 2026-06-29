import { Component } from '@angular/core';
import { MapViewComponent } from '../../components/map-view/map-view.component';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [MapViewComponent],
  template: `
    <div class="container-fluid py-4">
      <h1 class="mb-4">Reading Atlas</h1>
      <app-map-view [books]="books" />
    </div>
  `
})
export class MapComponent {
  // Date de test pana conectam API-ul
  books: Book[] = [
    {
      id: 1,
      title: 'Prietenii mei',
      author: 'Fredrik Backman',
      createdAt: new Date().toISOString(),
      location: {
        id: 1,
        bookId: 1,
        placeName: 'Stockholm',
        country: 'Suedia',
        lat: 59.3293,
        lng: 18.0686,
        isAiSuggested: true,
        isConfirmed: true
      }
    }
  ];
}