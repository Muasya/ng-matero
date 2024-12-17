import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, tap } from 'rxjs';

import { Menu } from '@core';
import { Token, User } from './interface';

import { environment } from '../../../environments/environment';
export const baseUrl = environment.baseLink;

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  protected readonly http = inject(HttpClient);

  login(username: string, password: string) {
    // return this.http.post<Token>(`${baseUrl}/auth/login`, { username, password, rememberMe });
    return this.http.post<any>(`${baseUrl}/login`, { username, password }, { withCredentials: true}); // Important: withCredentials for cookies
  }

  refresh(params: Record<string, any>) {
    return this.http.post<Token>(`${baseUrl}/refresh`, params, { withCredentials: true});
  }

  logout() {
    return this.http.post<any>(`${baseUrl}/logout`, {}, { withCredentials: true});
  }

  me() {
    return this.http.post<any>(`${baseUrl}/me`, {}, { withCredentials: true }).pipe(
      tap(user => {})
    );
  }

  menu() {
    return this.http.get<{ menu: Menu[] }>(`${baseUrl}/menu`).pipe(
      map(res => res.menu),
    );
  }


}
