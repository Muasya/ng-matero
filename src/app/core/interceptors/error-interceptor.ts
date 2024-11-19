import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export enum STATUS {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastrService);

  private readonly errorPages = [STATUS.FORBIDDEN, STATUS.NOT_FOUND, STATUS.INTERNAL_SERVER_ERROR];

  // private getMessage = (error: HttpErrorResponse) => {
  //   if (error.error?.message) {
  //     return error.error.message;
  //   }

  //   if (error.error?.msg) {
  //     return error.error.msg;
  //   }

  //   return `${error.status} ${error.statusText}`;
  // };

  private getMessage(error: HttpErrorResponse) {

    // Prioritize the server's detailed error message
    if (error.error?.msg) { // check for msg if available
      return error.error?.msg;
    } else if (error.error?.error) {
      return error.error?.error;  // Use error.error.error
    } else if (error.error && typeof error.error === 'string') {
      return error.error;          // Use error.error directly if it's a string
    } else if (error.error && typeof error.error === 'object' && 'message' in error.error) {
      return error.error.message;  // Use error.error.message if it's an object property
    } else if (error.message) {
        return error.message;
    }

    // Fallback to the status and text if no server message is found
    return `${error.status} ${error.statusText}`; 
  }

  // intercept(req: HttpRequest<unknown>, next: HttpHandler) {
  //   return next.handle(req).pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  // }

  intercept(req: HttpRequest<unknown>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (this.errorPages.includes(error.status)) {
      this.router.navigateByUrl(`/${error.status}`, {
        skipLocationChange: true,
      });
    } else {
      console.error('ERROR', error);
      // this.toast.error(this.getMessage(error));
      if (!(this.errorPages.includes(error.status))) { // Check to prevent double error log
        this.toast.error(this.getMessage(error)); // It will now use the improved getMessage
      }
      if (error.status === STATUS.UNAUTHORIZED) {
        this.router.navigateByUrl('/auth/login');
      }
    }

    return throwError(() => error);
  }
}
