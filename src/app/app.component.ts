import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { BookService } from './services/book.service';
import { interval, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  locationStatus: { total: number; withLocation: number; isComplete: boolean } | null = null;
  private pollingSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private bookService: BookService
  ) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get showLocationProgress(): boolean {
    return !!this.locationStatus && !this.locationStatus.isComplete;
  }

  ngOnInit(): void {
    if (this.isLoggedIn) {
      this.startPolling();
    }
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  private startPolling(): void {
    // Check immediately, then every 5 seconds
    this.pollingSubscription = interval(5000)
      .pipe(switchMap(() => this.bookService.getLocationStatus()))
      .subscribe({
        next: (status) => {
          this.locationStatus = status;
          if (status.isComplete) {
            this.pollingSubscription?.unsubscribe();
          }
        },
        error: () => {
          // Silently ignore polling errors, will retry on next interval
        }
      });

    // Also fetch once immediately, don't wait 5s for the first check
    this.bookService.getLocationStatus().subscribe({
      next: (status) => (this.locationStatus = status),
      error: () => {}
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}