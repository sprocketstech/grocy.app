import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GrocyService } from '../../services/grocy.service';
import { NbDialogRef } from '@nebular/theme';
import { Stock } from '../../models/stock';
import { Location } from '../../models/location';

@Component({
  selector: 'app-consume-stock-dialog',
  templateUrl: './consume-stock-dialog.component.html',
  styleUrls: ['./consume-stock-dialog.component.scss']
})
export class ConsumeStockDialogComponent implements OnInit {
  item: Stock;
  consumeForm: FormGroup;
  locations: Location[];
  busy: boolean;
  error: string;
  hasError: boolean;

  constructor(private grocy : GrocyService, 
              private fb: FormBuilder,
              protected ref: NbDialogRef<ConsumeStockDialogComponent>) {
    this.hasError = false;
    this.consumeForm = this.fb.group({
      quantity: [1, Validators.required],
      location: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.busy = false;
    this.locations = this.grocy.getLocations();
    this.f.location.setValue(this.findLocationId(this.item.Details[0].Location));
  }


  ok() {
    this.busy = true;
    // save the item
    this.grocy.consumeStock(this.item.ProductId, this.f.location.value, this.f.quantity.value)
    .subscribe(
      () => this.handleSuccess(),
      err => this.handleError(err)
    );
  }

  cancel() {
    this.ref.close();
  }

  validLocations() : Location[] {
    let r = [] as Location[];
    for (let i=0; i < this.item.Details.length; ++i) {
      r.push(this.findLocationByName(this.item.Details[i].Location));
    }
    return r;
  }

  get f(){
    return this.consumeForm.controls;
  }

  private findLocationId(name : string) : string {
    for (let i=0; i < this.locations.length; ++i) {
      if (this.locations[i].Name === name) {
        return this.locations[i].Id;
      }
    }
    return '';
  }

  private findLocationName(id : string) : string {
    for (let i=0; i < this.locations.length; ++i) {
      if (this.locations[i].Id === id) {
        return this.locations[i].Name;
      }
    }
    return '';
  }

  private findLocationByName(name : string) : Location {
    for (let i=0; i < this.locations.length; ++i) {
      if (this.locations[i].Name === name) {
        return this.locations[i];
      }
    }
    return null;
  }


  private handleSuccess() {
    // fix up the in-memory copy to avoid a round trip to the server
    const amount = parseInt(this.f.quantity.value, 10);
    this.item.Amount = parseInt("" + this.item.Amount, 10) - amount;
    const locName = this.findLocationName(this.f.location.value)
    for (let i = 0 ; i < this.item.Details.length; ++i) {
      if (this.item.Details[i].Location == locName) {
        this.item.Details[i].Amount -= amount;
        if (this.item.Details[i].Amount === 0) {
          this.item.Details.splice(i, 1);
        }
        break;
      }
    }
    this.busy = false;
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
    this.busy = false;
  }

}
