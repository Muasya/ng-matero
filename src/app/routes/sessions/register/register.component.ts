import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router'; // Import Router
import { ToastrService } from 'ngx-toastr'; // Import ToastrService

import { RegisterService } from '../../../../app/core/authentication/register.service';
import { AuthService } from '@core/authentication'; // Import AuthService

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,
    MatIconModule
  ],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private auth = inject(AuthService);

  hide = true;
  protected readonly registerService = inject(RegisterService);
  private toast = inject(ToastrService); // Inject ToastrService
  protected readonly router = inject(Router); // Inject the Router

  registerForm = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
    },
    {
      validators: [this.matchValidator('password', 'confirmPassword')],
    }
  );

  matchValidator(source: string, target: string) {
    return (control: AbstractControl) => {
      const sourceControl = control.get(source)!;
      const targetControl = control.get(target)!;
      if (targetControl.errors && !targetControl.errors.mismatch) {
        return null;
      }
      if (sourceControl.value !== targetControl.value) {
        targetControl.setErrors({ mismatch: true });
        return { mismatch: true };
      } else {
        targetControl.setErrors(null);
        return null;
      }
    };
  }

  register() {
    if (this.registerForm.invalid) {
      return;
    }

    const username = this.registerForm.get('username')?.value?.trim();
    const password = this.registerForm.get('password')?.value?.trim();
    const confirmPassword = this.registerForm.get('confirmPassword')?.value?.trim();
    // put default role as client
    const role = 'client';


    // Check if any of the values are null/undefined
    if (!username || !password || !confirmPassword) {
      if (!username) this.toast.error('Please provide a username');
      if (!password) this.toast.error('Please provide a password');
      if (!confirmPassword) this.toast.error('Please confirm the password');
      if (!this.registerForm.get('acceptTerms')?.value) this.toast.error('Please accept the terms and conditions');
      return;
    }

    if (password !== confirmPassword) {
      this.toast.error('Passwords do not match!');
      return;
    }

    this.registerService.register(username, password, confirmPassword, role).subscribe({
      next: () => {
        this.toast.success('Registration successful. Logging in...');
        // Manually log in the user after successful registration
        this.auth.login(username, password).subscribe({ // call login in authService
          next: () => {
            this.router.navigate(['/']);
          },
          error: (loginErr) => {
             this.toast.error(loginErr.error?.message || 'Login after registration failed.');
          }
        });
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Registration failed.');
      },
    });

  }


}
