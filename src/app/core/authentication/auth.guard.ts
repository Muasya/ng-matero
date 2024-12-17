import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { map, tap } from 'rxjs/operators';

export const authGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // return auth.checkAuth() ? true : router.parseUrl('/auth/login');
  return auth.checkAuth() ? true : router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url }});

};


