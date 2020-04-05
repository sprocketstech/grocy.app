import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GrocyService } from '../../services/grocy.service';
import { LocalSettings } from '../../models/settings';
import { ProductGroup } from '../../models/product_group';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  hasError: boolean;
  error: string;
  settings: LocalSettings;
  setupForm: FormGroup;
  loading: number;
  allGroupsSelected: boolean;
  productGroups: ProductGroup[];

  constructor(private fb: FormBuilder, 
    private grocy : GrocyService) { 

    this.hasError = false;
    this.setupForm = this.fb.group({
      URL: ['', Validators.required],
      APIKey: ['', Validators.required]
    });
    this.loading = 2;
    this.grocy.getConfig().subscribe(res => {
      this.settings = res;
      this.setupForm.patchValue(res);
      this.loading--;
    });
    this.grocy.getProductGroups().subscribe(res => {
      this.productGroups = res;
      this.loading--;
    });

  }
  ngOnInit(): void {
  }

  public showAllStock() : boolean {
    return this.settings && this.settings.ShowAllStock ? true : false;
  }

  public toggleStockGroup(evt: any, id : number) {
    if (!this.settings.ShowStocksInGroup) {
      this.settings.ShowStocksInGroup = [];
    }
    const idx = this.settings.ShowStocksInGroup.indexOf(id);
    if (idx > -1) {
      this.settings.ShowStocksInGroup.splice(idx, 1);
    } else {
      this.settings.ShowStocksInGroup.push(id);
    }
  }

  public groupSelected(id: number) : boolean {
    const ret = this.settings && this.settings.ShowStocksInGroup && this.settings.ShowStocksInGroup.indexOf(id) > -1  ? true : false;
    return ret;
  }


  get f(){
    return this.setupForm.controls;
  }

  public save() {
    this.loading = 1;
    this.settings.URL = this.f.URL.value;
    this.settings.APIKey = this.f.APIKey.value;
    this.grocy.setConfig(this.settings)
    .subscribe((config: LocalSettings) => {
      this.loading--;
      this.hasError = false;
      this.error = '';
    },
    error => {
      this.error = error;
      this.hasError = true;
      this.loading--;
    });
  }

}
