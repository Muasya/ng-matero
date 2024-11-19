import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, catchError, iif, map, merge, of, share, switchMap, tap, throwError } from 'rxjs';
import { filterObject, isEmptyObject } from './helpers';
import { User } from './interface';
import { LoginService } from './login.service';
import { TokenService } from './token.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly loginService = inject(LoginService);
  private readonly tokenService = inject(TokenService);

  private user$ = new BehaviorSubject<User>({});
  private change$ = merge(
    this.tokenService.change(),
    this.tokenService.refresh().pipe(switchMap(() => this.refresh()))
  ).pipe(
    switchMap(() => this.assignUser()),
    share()
  );

  init() {
    return new Promise<void>(resolve => this.change$.subscribe(() => resolve()));
  }

  change() {
    return this.change$;
  }

  // check() {
  //   return this.tokenService.valid();
  // }

  check(): boolean {
    // Check if we have user data - implies logged in with session
    return !isEmptyObject(this.user$.value) ; // No more token validity check, since its handled by sessions
  }

  // login(username: string, password: string) {
  //   return this.loginService.login(username, password).pipe(
  //     tap(token => this.tokenService.set(token)),
  //     map(() => this.check())
  //   );
  // }

  login(username: string, password: string) {
    return this.loginService.login(username, password).pipe(
        // Assuming backend sets a cookie - no need to manually set token here
        tap(() => this.fetchUser()), // Fetch user details after successful login (sets user$ value)
        map(() => this.check()) // Check auth state (should be true now)
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
      tap(() => this.user$.next({})), // Clear user data on logout
      map(() => !this.check())
    );
  }

  private fetchUser() {  // New method: fetch user data from backend
    this.loginService.me().pipe(
        tap(user => this.user$.next(user)),
        catchError(err => {
          if (err.status === 401){ // Handle unauthorized error (session might have expired on the backend)
            this.user$.next({}); // Clear user information
          }
          return throwError(() => err); // Re-throw the error for other handling if needed
        })
      ).subscribe();  // Ensure the request is made
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
    return iif(() => this.check(), this.loginService.menu(), of([]));
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
