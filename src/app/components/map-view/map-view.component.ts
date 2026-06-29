import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
import * as L from 'leaflet';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-map-view',
  standalone: true,
  template: `<div id="map" style="height: 500px; width: 100%; border-radius: 12px;"></div>`,
  styles: [`
    :host { display: block; }
  `]
})
export class MapViewComponent implements OnInit, OnDestroy, OnChanges {
  @Input() books: Book[] = [];

  private map!: L.Map;
  private markers: L.Marker[] = [];

  ngOnInit(): void {
    this.initMap();
  }

  ngOnChanges(): void {
    if (this.map) {
      this.updateMarkers();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
  this.map = L.map('map').setView([45.0, 25.0], 4);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(this.map);

  // Fix icon - folosim CDN in loc de fisiere locale
 const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

  this.updateMarkers();
}

  private updateMarkers(): void {
    // Sterge markerii vechi
    this.markers.forEach(m => m.remove());
    this.markers = [];

    // Adauga markeri pentru cartile cu locatie confirmata
    this.books
      .filter(b => b.location?.isConfirmed)
      .forEach(book => {
        if (book.location) {
          const marker = L.marker([book.location.lat, book.location.lng])
            .bindPopup(`
              <strong>${book.title}</strong><br>
              ${book.author}<br>
              ${book.location.placeName}, ${book.location.country}
              ${book.rating ? '<br>⭐ ' + book.rating + '/5' : ''}
            `)
            .addTo(this.map);
          this.markers.push(marker);
        }
      });
  }
}