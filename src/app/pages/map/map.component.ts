import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapViewComponent } from '../../components/map-view/map-view.component';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [MapViewComponent, CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit {
  books: Book[] = [];
  isLoading = true;

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}