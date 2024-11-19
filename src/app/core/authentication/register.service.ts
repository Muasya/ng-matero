import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'; // Import environment for base URL


export const baseUrl = environment.baseLink;  // Make sure the base URL is accessible to the service


@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  protected readonly http = inject(HttpClient);

  register(username: string, password: string, confirmPassword: string) { // Add confirmPassword
    return this.http.post(`${baseUrl}/register`, { username, password, confirmPassword }, { withCredentials: true }); // Send credentials, withCredentials: true for cross-origin requests
  }
}

