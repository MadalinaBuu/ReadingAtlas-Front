import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

interface ImportResult {
  importedCount: number;
  duplicateCount: number;
  errorCount: number;
  errors: string[];
}

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './import.component.html',
  styleUrl: './import.component.scss'
})
export class ImportComponent {
  private apiUrl = 'https://localhost:7187/api/import';

  selectedFile?: File;
  isLoading = false;
  result?: ImportResult;
  error = '';

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      this.result = undefined;
      this.error = '';
    }
  }

  onImport(): void {
    if (!this.selectedFile) return;

    this.isLoading = true;
    this.result = undefined;
    this.error = '';

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post<ImportResult>(`${this.apiUrl}/csv`, formData).subscribe({
      next: (result) => {
        this.result = result;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error || 'Import failed. Please check your file.';
        this.isLoading = false;
      }
    });
  }

  downloadTemplate(): void {
    window.open(`${this.apiUrl}/template`, '_blank');
  }
}