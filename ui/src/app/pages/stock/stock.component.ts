import { Component, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { GrocyService } from '../../services/grocy.service';
import { ActionService, ActionItem } from '../../services/action.service';
import { Stock, StockDetail } from '../../models/stock';
import { AddStockDialogComponent } from '../../components/add-stock-dialog/add-stock-dialog.component';
import { ConsumeStockDialogComponent } from '../../components/consume-stock-dialog/consume-stock-dialog.component';
import { timingSafeEqual } from 'crypto';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit {
  loading: boolean;
  stock : Stock[];
  actions: ActionItem[] = [
    { title: 'Add Stock', icon: 'plus-circle', action: () => this.addStock(null) }
  ];

  constructor(private grocy : GrocyService,
              private dialogService : NbDialogService,
              private actionSvc : ActionService) { 
    
    this.loading = false;
  }

  ngOnInit(): void {
    this.loading = true;
    this.grocy.getAllStock().subscribe(res => {
      this.stock = res;
      this.loading = false;
    });
    this.actionSvc.setActions(this.actions);
  }

  addStock(stockItem : Stock) {
    const dialogRef = this.dialogService.open(AddStockDialogComponent, { 
      context: {
        item: stockItem
      }
    });
    dialogRef.onClose.subscribe((res : Stock) => {
      if (stockItem === null) {
        // See if this add was for something already displayed,
        // if so update it...
        for (let i=0; i < this.stock.length; ++i) {
          if (this.stock[i].ProductId === res.ProductId) {
            this.stock[i].Amount += res.Amount;
            // increment the details
            if (this.stock[i].DetailsLoaded) {
              for (let j=0; j < res.Details.length; ++j) {
                let found = false;
                for (let k=0; k < this.stock[i].Details.length; ++k) {
                  if (res.Details[j].Location === this.stock[i].Details[k].Location) {
                    this.stock[i].Details[k].Amount += res.Details[j].Amount;
                    found = true;
                    break;
                  }
                }
                if (!found) {
                  this.stock[i].Details.push(res.Details[j]);
                }
              } 
            }
            return;
          }
        }
        this.stock.push(res);
      }
    });
  }

  consumeStock(stockItem : Stock) {
    const dialogRef = this.dialogService.open(ConsumeStockDialogComponent, { 
      context: {
        item: stockItem
      }
    });
  }


  retrieveDetails(e, stockItem : Stock) {
    if (!stockItem.DetailsLoaded && !stockItem.Loading) {
      stockItem.Loading = true;
      this.grocy.getStockDetails(stockItem).subscribe(res=> {
        stockItem = res
        stockItem.Loading = false;
      });
    }
  }

}
