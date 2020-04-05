import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { GrocyService } from '../../services/grocy.service';
import { Stock, StockDetail } from '../../models/stock';
import { Location } from '../../models/location';
import { Product } from '../../models/product';

@Component({
  selector: 'app-add-stock-dialog',
  templateUrl: './add-stock-dialog.component.html',
  styleUrls: ['./add-stock-dialog.component.scss']
})
export class AddStockDialogComponent implements OnInit {
  item: Stock;
  addNew: boolean;
  locations: Location[];
  addForm: FormGroup;
  busy: number;
  error: string;
  hasError: boolean;
  products: Product[];

  constructor(private grocy : GrocyService, 
              private fb: FormBuilder,
              protected ref: NbDialogRef<AddStockDialogComponent>) { 
    this.hasError = false;
    this.addForm = this.fb.group({
      selectedProduct: [''],
      quantity: [1, Validators.required],
      location: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.addNew = !this.item;
    if (this.addNew) {
      this.busy++;
      this.grocy.getAllProducts().subscribe(res => {
        this.products = res;
        this.f.selectedProduct.setValue(this.products[0].Id);
        this.updateProduct();
        this.busy--;
      });
    }
    this.busy = 0;
    this.locations = this.grocy.getLocations();
    this.f.location.setValue(this.locations[0].Id);
  }

  get f(){
    return this.addForm.controls;
  }

  ok() {
    this.busy = 1;
    // save the item
    this.grocy.addStock(this.item.ProductId, this.f.location.value, this.f.quantity.value)
    .subscribe(
      () => this.handleSuccess(),
      err => this.handleError(err)
    );
  }

  cancel() {
    this.ref.close();
  }

  updateProduct() {
    let product = this.products[0];
    for (let i=0; i < this.products.length; ++i) {
      if (this.products[i].Id === this.f.selectedProduct.value) {
        product = this.products[i];
      }
    }
    this.item = new Stock();
    this.item.Name = product.Name;
    this.item.Amount = 0;
    this.item.ProductId = parseInt(product.Id, 10) || 0;
  }

  private findLocationName(id : string) : string {
    for (let i=0; i < this.locations.length; ++i) {
      if (this.locations[i].Id === id) {
        return this.locations[i].Name;
      }
    }
    return '';
  }

  private handleSuccess() {
    // fix up the in-memory copy to avoid a round trip to the server
    const amount = parseInt(this.f.quantity.value, 10);
    this.item.Amount = parseInt("" + this.item.Amount, 10) + amount;
    let found = false;
    const locName = this.findLocationName(this.f.location.value)
    if (!this.item.DetailsLoaded) {
      this.item.Details = [] as StockDetail[];
    }
    for (let i = 0 ; i < this.item.Details.length; ++i) {
      if (this.item.Details[i].Location == locName) {
        found = true;
        this.item.Details[i].Amount += amount;
        break;
      }
    }
    if (!found) {
      let sd = new StockDetail();
      sd.Amount = amount;
      sd.Location = this.findLocationName(this.f.location.value);
      this.item.Details.push(sd)
    }

    this.busy--;
    this.hasError = false;
    this.ref.close(this.item);
  }

  private handleError(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 0 || error.status === 404) {
        errorMessage = "Invalid or incorrect URL";
      } else if (error.status === 401) {
        errorMessage = "Invalid or incorrect API Key";
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    this.error = 'Error updating stock: ' + errorMessage;
    this.hasError = true;
    this.busy--;
  }

}
