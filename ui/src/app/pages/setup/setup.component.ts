import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GrocyService } from '../../services/grocy.service';
import { LocalSettings } from '../../models/settings';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {
  hasError = false;
  error = '';
  submitted = false;
  loading = false;
  returnUrl: string;
  settings: LocalSettings;
  setupForm: FormGroup;

  constructor(private fb: FormBuilder, 
    private route: ActivatedRoute,
    private router: Router,
    private grocy : GrocyService) { 

    this.setupForm = this.fb.group({
      URL: ['', Validators.required],
      APIKey: ['', Validators.required]
    });

    this.grocy.getConfig().subscribe(res => {
      this.settings = res;
      this.setupForm.patchValue(res);
      if (res.Valid) {
        this.router.navigate(['/']);
      }
    });
  }

  ngOnInit(): void {
      // get return url from route parameters or default to '/'
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f(){
    return this.setupForm.controls;
  }

  setGrocyConfig() {
    this.loading = true;
    this.settings.URL = this.f.URL.value;
    this.settings.APIKey = this.f.APIKey.value;
    this.grocy.setConfig(this.settings)
    .subscribe((config: LocalSettings) => {
      this.loading = false;
      this.hasError = false;
      this.error = '';
      this.router.navigate([this.returnUrl]);
    },
    error => {
      this.error = error;
      this.hasError = true;
      this.loading = false;
    });
  }

}
