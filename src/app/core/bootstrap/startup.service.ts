import { Injectable, inject } from '@angular/core';
import { AuthService, User } from '@core/authentication';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { switchMap, tap } from 'rxjs';
import { Menu, MenuService } from './menu.service';

@Injectable({
  providedIn: 'root',
})
export class StartupService {
  private readonly authService = inject(AuthService);
  private readonly menuService = inject(MenuService);
  private readonly permissonsService = inject(NgxPermissionsService);
  private readonly rolesService = inject(NgxRolesService);

  the_menu: Menu[] = [
    { route: 'dashboard', name: 'dashboard', type: 'link', icon: 'dashboard' },
    { route: 'clients', name: 'clients', type: 'link', icon: 'group' },
    { route: 'design', name: 'design', type: 'sub', icon: 'color_lens', children: [
        { route: 'colors', name: 'colors', type: 'link', icon: 'colorize' },
        { route: 'icons', name: 'icons', type: 'link', icon: 'flag' }
      ], permissions: { only: ['ADMIN', 'MANAGER'] } },
    { route: 'forms', name: 'forms', type: 'sub', icon: 'description', children: [
        { route: 'elements', name: 'form-elements', type: 'link' },
        { route: 'dynamic', name: 'dynamic-form', type: 'link' },
        { route: 'select', name: 'select', type: 'link' },
        { route: 'datetime', name: 'datetime', type: 'link' }
      ], permissions: { except: 'GUEST' } },
    { route: 'tables', name: 'tables', type: 'sub', icon: 'format_line_spacing', children: [
        { route: 'kitchen-sink', name: 'kitchen-sink', type: 'link' },
        { route: 'remote-data', name: 'remote-data', type: 'link' }
      ], permissions: { except: 'GUEST' } },
    { route: '/', name: 'sessions', type: 'sub', icon: 'question_answer', children: [
        { route: '403', name: '403', type: 'link' },
        { route: '404', name: '404', type: 'link' },
        { route: '500', name: '500', type: 'link' }
      ], permissions: { only: 'ADMIN' } },
    { route: 'profile', name: 'profile', type: 'sub', icon: 'person', children: [
        { route: 'overview', name: 'overview', type: 'link' },
        { route: 'settings', name: 'settings', type: 'link' }
      ] },
    { route: 'https://example.com/blog', name: 'blog', type: 'extTabLink', icon: 'subject', permissions: { only: 'ADMIN' } }
  ];

  load() {
    return new Promise<void>(resolve => {
      this.authService.updateUserAndAuthState().subscribe({
        next: () => {
          this.menuService.addNamespace(this.the_menu, 'menu');
          this.menuService.set(this.the_menu);
          resolve();
        },
        error: (error) => {
          resolve();
        },
      });
    });
  }

  private setPermissions(user: User) {
    const permissions = ['canAdd', 'canDelete', 'canEdit', 'canRead'];
    this.permissonsService.loadPermissions(permissions);
    this.rolesService.flushRoles();
    this.rolesService.addRoles({ ADMIN: permissions });
  }
}

