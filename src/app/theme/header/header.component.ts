import { Component, EventEmitter, Input, Output, ViewEncapsulation, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import screenfull from 'screenfull';

import { BrandingComponent } from '../widgets/branding.component';
import { NotificationComponent } from '../widgets/notification.component';
import { TranslateComponent } from '../widgets/translate.component';
import { UserComponent } from '../widgets/user.component';

import { CustomizerComponent } from '../customizer/customizer.component';
import { AppSettings, SettingsService } from '@core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  host: {
    class: 'matero-header',
  },
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    MatTabsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    BrandingComponent,
    NotificationComponent,
    TranslateComponent,
    UserComponent,
    CustomizerComponent,
  ],
})
export class HeaderComponent {
  @Input() showToggle = true;
  @Input() showBranding = false;

  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() toggleSidenavNotice = new EventEmitter<void>();

  private readonly settings = inject(SettingsService);

  toggleFullscreen() {
    if (screenfull.isEnabled) {
      screenfull.toggle();
    }
  }

  updateOptions(options: AppSettings) {
    this.settings.setOptions(options);
    this.settings.setDirection();
    this.settings.setTheme();
  }
}
