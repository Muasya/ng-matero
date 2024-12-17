import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { MtxButtonModule } from '@ng-matero/extensions/button';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';

import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '@core/authentication';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MtxButtonModule,
    TranslateModule,
    MatIconModule
  ],
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  ngOnInit() { // Add an ngOnInit lifecycle hook
    if (this.auth.checkAuth()) { // Check if user is already authenticated
      this.router.navigate(['/']); // Redirect to the main/dashboard route
    }
  }

  isSubmitting = false;
  hide = true;

  loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    // rememberMe: [false],
  });

  get username() {
    return this.loginForm.get('username')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  get rememberMe() {
    return this.loginForm.get('rememberMe')!;
  }

  // login() {
  //   this.isSubmitting = true;

  //   this.auth
  //     .login(this.username.value, this.password.value)
  //     .pipe(filter(authenticated => authenticated))
  //     .subscribe({
  //       next: () => {
  //         this.router.navigateByUrl('/');
  //       },
  //       error: (errorRes: HttpErrorResponse) => {
  //         if (errorRes.status === 422) {
  //           const form = this.loginForm;
  //           const errors = errorRes.error.errors;
  //           Object.keys(errors).forEach(key => {
  //             form.get(key === 'email' ? 'username' : key)?.setErrors({
  //               remote: errors[key][0],
  //             });
  //           });
  //         }
  //         this.isSubmitting = false;
  //       },
  //     });
  // }

//   login() {
//     this.isSubmitting = true;
//     this.auth.login(this.username.value, this.password.value).subscribe({
//         next: () => {
//             this.router.navigateByUrl('/');
//         },
//         error: (errorRes: HttpErrorResponse) => {
//           if (errorRes.status === 422) {
//             const form = this.loginForm;
//             const errors = errorRes.error.errors;
//             Object.keys(errors).forEach(key => {
//               form.get(key === 'email' ? 'username' : key)?.setErrors({
//                 remote: errors[key][0],
//               });
//             });
//           }
//           this.isSubmitting = false;
//         },
//         complete: () => {
//           this.isSubmitting = false; // Ensure this is always set to false, even on success
//         }
//     });
// }

login() {
  this.isSubmitting = true;  // Set loading state
  this.auth.login(this.username.value, this.password.value).subscribe({
      next: () => this.router.navigate(['/']), // Redirect only after a successful login
      error: (e: any) => {
        console.error(e);
        this.isSubmitting = false;
      },
      complete: () => this.isSubmitting = false, // Ensure loading state is reset
  });
}


}
