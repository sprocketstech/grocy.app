import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router, ActivatedRoute, UrlSerializer, PRIMARY_OUTLET } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class ErrorInterceptor implements HttpInterceptor {

    constructor(private router: Router, 
                private activatedRoute : ActivatedRoute,
                private serializer: UrlSerializer) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status !== 401) {
                const error = err.error && err.error.message ? err.error.message : err.statusText;
                // found error -- navigate to error page
                let url = this.activatedRoute.snapshot['_routerState'].url;
                const tree = this.serializer.parse(url);
                const g = tree.root.children[PRIMARY_OUTLET];
                if (g && g.segments.length > 0 && g.segments[0].path === "error") {
                    url = tree.queryParams.returnUrl;
                }
                this.router.navigate(['/error'], { queryParams: { status: err.status, message: error, returnUrl: url } });
                return throwError(err);
            }
        }));
    }
}