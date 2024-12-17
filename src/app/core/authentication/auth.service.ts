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
    return this.loginService.me().pipe(
      tap(user => {
        this.user$.next(user);
        this.isAuthenticated$.next(user.isAuthenticated || false); // Set authentication status
      }),
      catchError(err => {
        this.user$.next({}); // Important: Clear user on error
        this.isAuthenticated$.next(false); // Very important: Set to false on error.
        return of(null);
      }),
      share() // Share the observable to avoid multiple HTTP calls
    );
  }

  // auth.service.ts
  init(): Promise<void> { // init() now uses updateUserAndAuthState()
    return new Promise<void>(resolve => {

        if (this.check()) { // Session active
            this.isAuthenticated$.next(true);
            resolve();
            return;
        }

        this.updateUserAndAuthState().subscribe({
          next: () => {
            resolve();
          },
          error: err => {
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

  check(): boolean {
    // Check if the user object exists in the BehaviorSubject. If it does, it means a session exists server-side.
    return !isEmptyObject(this.user$.value);
  }

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

  logout() {
    return this.loginService.logout().pipe(
      tap(() => console.log('[AuthService:logout] Logout successful')), // Log successful logout
      tap(() => this.user$.next({})), // Clear user data on logout
      tap(() => this.isAuthenticated$.next(false)),
      tap(() => this.tokenService.clear()),
      map(() => !this.check())

    );
  }

  private fetchUser() {
    return this.loginService.me().pipe(
        tap(user => {
            this.user$.next(user);
            this.isAuthenticated$.next(user.isAuthenticated || false); // Important: Set isAuthenticated$
        }),
        catchError(err => {
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
    return iif(() => this.check(), this.loginService.menu().pipe(
      tap(menu => console.log('[AuthService:menu] Menu fetched:', menu)) // Log fetched menu
    ), of([]));
  }

}
