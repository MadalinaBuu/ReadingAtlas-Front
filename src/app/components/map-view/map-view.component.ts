import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, Input, Output, EventEmitter, NgZone } from '@angular/core';
import * as L from 'leaflet';
import { Book } from '../../models/book.model';
import { GeminiLocation } from '../../models/gemini-location.model';

@Component({
  selector: 'app-map-view',
  standalone: true,
  template: `<div id="map" style="height: 500px; width: 100%; border-radius: 12px;"></div>`,
  styles: [`:host { display: block; }`]
})
export class MapViewComponent implements OnInit, OnDestroy, OnChanges {
  @Input() books: Book[] = [];
  @Input() previewLocation?: GeminiLocation;
  @Output() locationAdjusted = new EventEmitter<{ lat: number, lng: number }>();

  private map!: L.Map;
  private markers: L.Marker[] = [];
  private previewMarker?: L.Marker;

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map) {
      if (changes['books']) this.updateMarkers();
      if (changes['previewLocation']) this.updatePreviewMarker();
    }
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }

  private initMap(): void {
    this.map = L.map('map').setView([45.0, 25.0], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

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
    this.updatePreviewMarker();
  }

  private updateMarkers(): void {
    this.markers.forEach(m => m.remove());
    this.markers = [];

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

  private updatePreviewMarker(): void {
    if (this.previewMarker) {
      this.previewMarker.remove();
      this.previewMarker = undefined;
    }

    if (this.previewLocation) {
      const previewIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      this.previewMarker = L.marker(
        [this.previewLocation.lat, this.previewLocation.lng],
        { draggable: true, icon: previewIcon }
      )
        .bindPopup(`
          <strong>📍 AI Suggestion</strong><br>
          ${this.previewLocation.placeName}, ${this.previewLocation.country}<br>
          <em>Drag to adjust</em>
        `)
        .addTo(this.map);

      // NgZone forteaza Angular sa detecteze schimbarea dupa dragend
      this.previewMarker.on('dragend', (event) => {
        const pos = (event.target as L.Marker).getLatLng();
        this.zone.run(() => {
          this.locationAdjusted.emit({ lat: pos.lat, lng: pos.lng });
        });
      });

      this.map.setView([this.previewLocation.lat, this.previewLocation.lng], 6);
      this.previewMarker.openPopup();
    }
  }
}