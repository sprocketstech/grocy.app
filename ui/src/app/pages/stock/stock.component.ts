import { Component, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { GrocyService } from '../../services/grocy.service';
import { Stock } from '../../models/stock';
import { AddStockDialogComponent } from '../../components/add-stock-dialog/add-stock-dialog.component';
import { ConsumeStockDialogComponent } from '../../components/consume-stock-dialog/consume-stock-dialog.component';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit {
  loading: boolean;
  stock : Stock[];
  constructor(private grocy : GrocyService,
              private dialogService : NbDialogService) { 
    
    this.loading = false;
  }

  ngOnInit(): void {
    this.loading = true;
    this.grocy.getAllStock().subscribe(res => {
      this.stock = res;
      this.loading = false;
    });
  }

  addStock(stockItem : Stock) {
    const dialogRef = this.dialogService.open(AddStockDialogComponent, { 
      context: {
        item: stockItem
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
