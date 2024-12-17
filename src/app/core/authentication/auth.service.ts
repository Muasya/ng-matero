import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, catchError, iif, map, merge, of, share, switchMap, tap } from 'rxjs';
import { filterObject, isEmptyObject } from './helpers';
import { User } from './interface';
import { LoginService } from './login.service';
import { TokenService } from './token.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private isAuthenticated$ = new BehaviorSubject<boolean>(false);

  private readonly loginService = inject(LoginService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  private user$ = new BehaviorSubject<User>({});
  private change$ = merge(
    this.tokenService.change(),
    this.tokenService.refresh().pipe(switchMap(() => this.refresh()))
  ).pipe(
    switchMap(() => this.assignUser()),
    share()
  );

  updateUserAndAuthState() { // New function to fetch and update user state

    console.log('[AuthService:updateUserAndAuthState] Fetching user data...');
    return this.loginService.me().pipe(
      tap(user => {
        console.log('[AuthService:updateUserAndAuthState] User data received:', user);
        this.user$.next(user);
        this.isAuthenticated$.next(user.isAuthenticated || false); // Set authentication status
      }),
      catchError(err => {
        console.error('[AuthService:updateUserAndAuthState] Error fetching user data:', err);
        this.user$.next({}); // Important: Clear user on error
        this.isAuthenticated$.next(false); // Very important: Set to false on error.
        return of(null);
      }),
      share() // Share the observable to avoid multiple HTTP calls
    );
  }

  // init() {
  //   return new Promise<void>(resolve => this.change$.subscribe(() => resolve()));
  // }

  // auth.service.ts
  init(): Promise<void> { // init() now uses updateUserAndAuthState()
    return new Promise<void>(resolve => {

        if (this.check()) { // Session active
            this.isAuthenticated$.next(true);
            console.log('[AuthService:init] Session exists, using existing data.');
            resolve();
            return;
        }

        console.log('[AuthService:init] No session found, fetching user data...');

        this.updateUserAndAuthState().subscribe({
          next: () => {
            console.log('[AuthService:init] Initialization complete.');
            resolve();
          },
          error: err => {
            console.error('[AuthService:init] Error initializing:', err);
            resolve(); // Important for app to continue
          },
        });
    });
  }


  change() {
    return this.change$;
  }

  checkAuth(): boolean {
    return this.isAuthenticated$.value;
  }

  checkUser(): User {
    return this.user$.value;
  }

  // check(): boolean {
  //   // Check if we have user data - implies logged in with session
  //   return !isEmptyObject(this.user$.value) ; // No more token validity check, since its handled by sessions
  // }

  check(): boolean {
    // Check if the user object exists in the BehaviorSubject. If it does, it means a session exists server-side.
    return !isEmptyObject(this.user$.value);
  }


  // login(username: string, password: string) {
  //   return this.loginService.login(username, password).pipe(
  //     tap(token => this.tokenService.set(token)),
  //     map(() => this.check())
  //   );
  // }

  // login(username: string, password: string) {
  //   return this.loginService.login(username, password).pipe(
  //       // Assuming backend sets a cookie - no need to manually set token here
  //       tap(() => this.fetchUser()), // Fetch user details after successful login (sets user$ value)
  //       // In login(), after the call to this.fetchUser():
  //       tap(() => console.log('[AuthService:login] login successful.')),
  //       map(() => this.check()) // Check auth state (should be true now)
  //   );
  // }

  login(username: string, password: string) {
    return this.loginService.login(username, password).pipe(
        tap(() => this.fetchUser().subscribe()), // subscribe here to actually execute the logic inside fetchUser().
        map(() => this.check())
    );
}

  refresh() {
    return this.loginService
      .refresh(filterObject({ refresh_token: this.tokenService.getRefreshToken() }))
      .pipe(
        catchError(() => of(undefined)),
        tap(token => this.tokenService.set(token)),
        map(() => this.check())
      );
  }

  // logout() {
  //   return this.loginService.logout().pipe(
  //     tap(() => this.tokenService.clear()),
  //     map(() => !this.check())
  //   );
  // }

  logout() {
    return this.loginService.logout().pipe(
      tap(() => console.log('[AuthService:logout] Logout successful')), // Log successful logout
      tap(() => this.user$.next({})), // Clear user data on logout
      tap(() => this.isAuthenticated$.next(false)),
      tap(() => this.tokenService.clear()),
      map(() => !this.check())

    );
  }

  // private fetchUser() {  // New method: fetch user data from backend
  //   console.log('[AuthService:fetchUser] Fetching user data...');
  //   return this.loginService.me().pipe(
  //     tap(user => {
  //       this.user$.next(user);
  //       this.isAuthenticated$.next(user.isAuthenticated || false); // Update isAuthenticated$ here
  //       console.log('[AuthService:fetchUser] User data fetched:', user);
  //     }),
  //     catchError(err => {
  //       console.error('[AuthService:fetchUser] Error fetching user data:', err);
  //       this.isAuthenticated$.next(false); // Important: Set to false on error
  //       this.user$.next({}); // Clear user data on error
  //       return of(null); // Return an empty observable to avoid breaking the pipe
  //     })
  //   );
  // }


  private fetchUser() {
    console.log('[AuthService:fetchUser] Fetching user data...');
    return this.loginService.me().pipe(
        tap(user => {
            console.log('[AuthService:fetchUser] User data received:', user);
            this.user$.next(user);
            this.isAuthenticated$.next(user.isAuthenticated || false); // Important: Set isAuthenticated$
        }),
        catchError(err => {
            console.error('[AuthService:fetchUser] Error fetching user data:', err);
            this.user$.next({});
            this.isAuthenticated$.next(false); // VERY IMPORTANT for correct auth guard behavior
            return of(null); // Handle error appropriately
        })
    );
}



  private assignUser() {  // Simplified, No more token check. Session handles it on the server
    if (this.check()) {
      return of(this.user$.getValue()); // Return the user data
    } else {
      return of({}).pipe(tap(user => this.user$.next(user))); // Clear user data if not logged in
    }
  }

  user() {
    return this.user$.pipe(share());
  }

  menu() {
    // return iif(() => this.check(), this.loginService.menu(), of([]));
    console.log('[AuthService:menu] Getting menu...'); // Log before getting menu
    return iif(() => this.check(), this.loginService.menu().pipe(
      tap(menu => console.log('[AuthService:menu] Menu fetched:', menu)) // Log fetched menu
    ), of([]));
  }

  // private assignUser() {
  //   if (!this.check()) {
  //     return of({}).pipe(tap(user => this.user$.next(user)));
  //   }

  //   if (!isEmptyObject(this.user$.getValue())) {
  //     return of(this.user$.getValue());
  //   }

  //   return this.loginService.me().pipe(tap(user => this.user$.next(user)));
  // }
}
