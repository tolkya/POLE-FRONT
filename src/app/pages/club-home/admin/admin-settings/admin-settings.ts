import { Component, input, OnInit, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Club } from '../../../../core/models';
import { ClubService } from '../../../../core/services/club.service';
import { ToastService } from '../../../../core/services/toast.service';
import { UserClubsService } from '../../../../core/services/user-clubs.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-settings',
  imports: [ReactiveFormsModule, InputTextModule, TextareaModule, ButtonModule, SelectButtonModule, FormsModule],
  templateUrl: './admin-settings.html',
  styleUrl: './admin-settings.scss',
})
export class AdminSettings implements OnInit {
  readonly clubId = input.required<number>();

  private readonly clubService       = inject(ClubService);
  private readonly toast             = inject(ToastService);
  private readonly userClubsService  = inject(UserClubsService);
  private readonly mediaBase         = environment.api.mediaBaseUrl;

  club    = signal<Club | null>(null);
  loading = signal(true);
  error   = signal(false);

  // Sauvegarde en cours par section (évite de bloquer tout le formulaire)
  savingInfo   = signal(false);
  savingLogo   = signal(false);
  savingPolicy = signal(false);

  // Aperçu logo avant envoi
  logoPreview = signal<string | null>(null);
  logoFile    = signal<File | null>(null);

  // Options joinPolicy pour p-selectButton
  readonly policyOptions = [
    { label: 'Automatique',  value: 'AUTO_ACCEPT' },
    { label: 'Sur validation', value: 'MANUAL_VALIDATION' },
  ];

  readonly infoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.infoForm = this.fb.group({
      name:        ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      email:       ['', [Validators.email]],
      phone:       [''],
      street:      [''],
      postalCode:  [''],
      city:        [''],
    });
  }

  ngOnInit(): void {
    this.clubService.getClub(this.clubId()).subscribe({
      next: (club) => {
        this.club.set(club);
        this.infoForm.patchValue({
          name:        club.name,
          description: club.description ?? '',
          email:       club.email ?? '',
          phone:       club.phone ?? '',
          street:      club.street ?? '',
          postalCode:  club.postalCode ?? '',
          city:        club.city ?? '',
        });
        this.loading.set(false);
      },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  // Section Informations
  saveInfo(): void {
    if (this.infoForm.invalid) return;
    this.savingInfo.set(true);
    const val = this.infoForm.value;
    this.clubService.updateClub(this.clubId(), {
      name:        val.name,
      description: val.description || undefined,
      email:       val.email       || undefined,
      phone:       val.phone       || undefined,
      street:      val.street      || undefined,
      postalCode:  val.postalCode  || undefined,
      city:        val.city        || undefined,
    }).subscribe({
      next: (club) => {
        this.club.set(club);
        this.toast.success('Informations mises à jour');
        this.savingInfo.set(false);
      },
      error: () => { this.toast.error('Erreur lors de la sauvegarde'); this.savingInfo.set(false); },
    });
  }

  // Section Logo
  logoUrl(): string | null {
    const path = this.club()?.logoUrl;
    if (!path) return null;
    return path.startsWith('http') ? path : this.mediaBase + path;
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    // Validation taille (2 Mo max) et type
    if (file.size > 2 * 1024 * 1024) {
      this.toast.error('Le fichier ne doit pas dépasser 2 Mo');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      this.toast.error('Format accepté : JPG, PNG, WebP, SVG');
      return;
    }
    this.logoFile.set(file);
    // Aperçu immédiat via FileReader
    const reader = new FileReader();
    reader.onload = (e) => this.logoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  uploadLogo(): void {
    const file = this.logoFile();
    if (!file) return;
    this.savingLogo.set(true);
    this.clubService.uploadLogo(this.clubId(), file).subscribe({
      next: (club) => {
        this.club.set(club);
        this.logoPreview.set(null);
        this.logoFile.set(null);
        this.toast.success('Logo mis à jour');
        this.savingLogo.set(false);
        // Met à jour le signal global pour que la sidenav se rafraîchisse
        this.userClubsService.fetchUserClubs().subscribe();
      },
      error: () => { this.toast.error('Erreur lors de l\'upload'); this.savingLogo.set(false); },
    });
  }

  cancelLogo(): void {
    this.logoPreview.set(null);
    this.logoFile.set(null);
  }

  // Section Inscription
  savePolicy(value: 'AUTO_ACCEPT' | 'MANUAL_VALIDATION'): void {
    this.savingPolicy.set(true);
    this.clubService.updateClub(this.clubId(), { joinPolicy: value }).subscribe({
      next: (club) => {
        this.club.set(club);
        this.toast.success('Politique d\'inscription mise à jour');
        this.savingPolicy.set(false);
      },
      error: () => { this.toast.error('Erreur lors de la sauvegarde'); this.savingPolicy.set(false); },
    });
  }

  copyCode(): void {
    const code = this.club()?.clubCode;
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      this.toast.success('Code copié dans le presse-papier');
    });
  }
}