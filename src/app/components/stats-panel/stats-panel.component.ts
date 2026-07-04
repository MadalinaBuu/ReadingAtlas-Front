import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book } from '../../models/book.model';

interface Stats {
  totalBooks: number;
  totalCountries: number;
  favoriteGenre: string;
  averageRating: number;
  booksWithLocation: number;
}

@Component({
  selector: 'app-stats-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-panel.component.html',
  styleUrl: './stats-panel.component.scss'
})
export class StatsPanelComponent implements OnChanges {
  @Input() books: Book[] = [];
  stats?: Stats;

  ngOnChanges(): void {
    this.calculateStats();
  }

  private calculateStats(): void {
    if (!this.books.length) return;

    // Tari unice
    const countries = this.books
      .filter(b => b.location?.isConfirmed)
      .map(b => b.location!.country)
      .filter((c): c is string => !!c);
    const uniqueCountries = new Set(countries);

    // Gen preferat
    const genreCounts = this.books
      .filter(b => b.genre)
      .reduce((acc, b) => {
        acc[b.genre!] = (acc[b.genre!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    const favoriteGenre = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Rating mediu
    const ratedBooks = this.books.filter(b => b.rating);
    const avgRating = ratedBooks.length
      ? ratedBooks.reduce((sum, b) => sum + b.rating!, 0) / ratedBooks.length
      : 0;

    this.stats = {
      totalBooks: this.books.length,
      totalCountries: uniqueCountries.size,
      favoriteGenre,
      averageRating: Math.round(avgRating * 10) / 10,
      booksWithLocation: this.books.filter(b => b.location?.isConfirmed).length
    };
  }
}