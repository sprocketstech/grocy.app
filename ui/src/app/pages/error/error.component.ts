import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {
  status: number;
  message: string;
  returnUrl: string;
  loading = false;

  constructor(private route: ActivatedRoute, 
              private router: Router) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.status = parseInt(params.status, 10);
      this.message = params.message;
      this.returnUrl = params.returnUrl;
      this.process();
    });
  }

  goToReturn() : void {
    this.loading = true;
    this.router.navigateByUrl(this.returnUrl).then(() => {this.loading = false;})
  }

  process() : void {
    switch (this.status) {
      case 504:
        this.message = 'Grocy is currently unavailable, please check the server and try again.'
        break;
    }
  }

}
