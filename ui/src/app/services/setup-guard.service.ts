import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs/operators';
import { GrocyService } from './grocy.service';

@Injectable({
  providedIn: 'root'
})
export class SetupGuard implements CanActivate {

  constructor(private router: Router, private grocy : GrocyService) {

  }


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.grocy.getConfig()
      .pipe(
        map(res => {
          if (res.Valid) {
            return true;
          } else {
            // not logged in so redirect to login page with the return url
            this.router.navigate(['/setup'], { queryParams: { returnUrl: state.url } });
            return false;
          }
        })
      );
  }
}
