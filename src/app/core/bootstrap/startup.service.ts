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


  the_menu : Menu[] = [
      {
        route: 'dashboard',
        name: 'dashboard',
        type: 'link',
        icon: 'dashboard'
      },
      {
        route: 'clients',
        name: 'clients',
        type: 'link',
        icon: 'group'
      },
      {
        route: 'design',
        name: 'design',
        type: 'sub',
        icon: 'color_lens',
        children: [
          {
            route: 'colors',
            name: 'colors',
            type: 'link',
            icon: 'colorize'
          },
          {
            route: 'icons',
            name: 'icons',
            type: 'link',
            icon: 'flag'
          }
        ],
        permissions: {
          only: [
            'ADMIN',
            'MANAGER'
          ]
        }
      },
      {
        route: 'forms',
        name: 'forms',
        type: 'sub',
        icon: 'description',
        children: [
          {
            route: 'elements',
            name: 'form-elements',
            type: 'link'
          },
          {
            route: 'dynamic',
            name: 'dynamic-form',
            type: 'link'
          },
          {
            route: 'select',
            name: 'select',
            type: 'link'
          },
          {
            route: 'datetime',
            name: 'datetime',
            type: 'link'
          }
        ],
        permissions: {
          except: 'GUEST'
        }
      },
      {
        route: 'tables',
        name: 'tables',
        type: 'sub',
        icon: 'format_line_spacing',
        children: [
          {
            route: 'kitchen-sink',
            name: 'kitchen-sink',
            type: 'link'
          },
          {
            route: 'remote-data',
            name: 'remote-data',
            type: 'link'
          }
        ],
        permissions: {
          except: 'GUEST'
        }
      },
      {
        route: '/',
        name: 'sessions',
        type: 'sub',
        icon: 'question_answer',
        children: [
          {
            route: '403',
            name: '403',
            type: 'link'
          },
          {
            route: '404',
            name: '404',
            type: 'link'
          },
          {
            route: '500',
            name: '500',
            type: 'link'
          }
        ],
        permissions: {
          only: 'ADMIN'
        }
      },
      {
        route: 'profile',
        name: 'profile',
        type: 'sub',
        icon: 'person',
        children: [
          {
            route: 'overview',
            name: 'overview',
            type: 'link'
          },
          {
            route: 'settings',
            name: 'settings',
            type: 'link'
          }
        ]
      },
      {
        route: 'https://example.com/blog',
        name: 'blog',
        type: 'extTabLink',
        icon: 'subject',
        permissions: {
          only: 'ADMIN'
        }
      }
    ];



  /**
   * Load the application only after get the menu or other essential informations
   * such as permissions and roles.
   */
  // load() {
  //   return new Promise<void>((resolve, reject) => {
  //     this.authService
  //       .change()
  //       .pipe(
  //         tap(user => this.setPermissions(user)),
  //         switchMap(() => this.authService.menu()),
  //         tap(menu => this.setMenu(menu))
  //       )
  //       .subscribe({
  //         next: () => resolve(),
  //         error: () => resolve(),
  //       });
  //   });
  // }

  // load() {
  //   return new Promise<void>((resolve, reject) => {
  //     console.log('[StartupService:load] Loading started...');
  //     this.authService.change().pipe(
  //         tap(user => {
  //           this.setPermissions(user);
  //           console.log('[StartupService:load] User from Auth Service:', user);
  //         }),
  //         switchMap(() => this.authService.menu()),
  //         tap(menu => {
  //           this.setMenu(this.the_menu);
  //           console.log('[StartupService:load] Menu from Auth Service:', menu);
  //         })
  //       )
  //       .subscribe({
  //         next: () => {
  //           console.log('[StartupService:load] Loading complete.');
  //           resolve();
  //         },
  //         error: (error) => {
  //           console.error('[StartupService:load] Loading failed:', error);
  //           resolve();  // Resolve even on error to avoid blocking app initialization.
  //         },
  //       });
  //   });
  // }

  load() {
    return new Promise<void>(resolve => {
      console.log('[StartupService:load] Loading started...');

      this.authService.updateUserAndAuthState().subscribe({  // Use the new method
        next: () => {
          console.log('[StartupService:load] User and auth state updated.');
          this.menuService.addNamespace(this.the_menu, 'menu'); // Use injected MenuService
          this.menuService.set(this.the_menu);
          console.log('[StartupService:load] Menu loaded:', this.the_menu);
          resolve();
        },
        error: (error) => {
            console.error('[StartupService:load] Error updating user/auth or menu:', error);
            resolve(); // Ensure initialization doesn't block
        },
      });
    });
  }

  private setMenu(menu: Menu[]) {
    this.menuService.addNamespace(menu, 'menu');
    this.menuService.set(menu);
  }

  private setPermissions(user: User) {
    // In a real app, you should get permissions and roles from the user information.
    const permissions = ['canAdd', 'canDelete', 'canEdit', 'canRead'];
    this.permissonsService.loadPermissions(permissions);
    this.rolesService.flushRoles();
    this.rolesService.addRoles({ ADMIN: permissions });

    // Tips: Alternatively you can add permissions with role at the same time.
    // this.rolesService.addRolesWithPermissions({ ADMIN: permissions });
  }
}
