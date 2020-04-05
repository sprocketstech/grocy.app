import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, filter } from 'rxjs/operators';
import { Stock, StockDetail } from '../models/stock';
import { Location } from '../models/location';
import { LocalSettings } from '../models/settings';
import { ProductGroup } from '../models/product_group';

class stockProduct {
  name: string;
  product_group_id: string;
}
class stockResult {
  product_id: number;
  amount_aggregated: number;
  product: stockProduct;
}
class stockEntry {
  product_id: number;
  amount: string;
  location_id: number;
}

class location {
  id: string;
  name: string;
  description: string;
}

class productGroupResult {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class GrocyService {
  private httpHeaders : HttpHeaders;
  private currentConfigSubject: BehaviorSubject<LocalSettings>;
  private locations : Location[]
  public currentConfig: Observable<LocalSettings>;
  
  constructor(private http: HttpClient) {
    let config = JSON.parse(localStorage.getItem('grocy_credentials')) as LocalSettings;
    if (!config) {
      config = new LocalSettings();
      config.ShowAllStock = true;
      config.Valid = false;
    }
    this.currentConfigSubject = new BehaviorSubject<LocalSettings>(config);
    this.currentConfig = this.currentConfigSubject.asObservable();
    this.httpHeaders = new HttpHeaders({
        'GROCY-API-KEY': config.APIKey
    });
  }

  public getProductGroups() : Observable<ProductGroup[]> {
    return this.http.get<productGroupResult[]>(this.currentConfigSubject.value?.URL + '/api/objects/product_groups', { headers: this.httpHeaders })
    .pipe(
      map((data : productGroupResult[]) => 
        data.map(item => {
          let r = new ProductGroup();
          r.Id =  parseInt(item.id, 10) || 0;
          r.Name = item.name;
          return r;
        })
      )
    );
  }

  public getAllStock() : Observable<Stock[]> {
    return this.http.get<stockResult[]>(this.currentConfigSubject.value?.URL + '/api/stock', { headers: this.httpHeaders })
      .pipe(
        map((res) => res.filter(r => this.showStock(r))),
        map((data : stockResult[]) => 
          data.map(item => {
            let stock = new Stock();
            stock.ProductId = item.product_id;
            stock.ProductGroupId = parseInt(item.product.product_group_id) || 0;
            stock.Amount = item.amount_aggregated;
            stock.Name = item.product.name;
            return stock;
          })
        )
      );
  }

  public getStockDetails(item : Stock) : Observable<Stock> {
    return this.http.get<stockEntry[]>(this.currentConfigSubject.value?.URL + '/api/stock/products/' + item.ProductId + '/entries', { headers: this.httpHeaders })
    .pipe(
      map((data : stockEntry[]) => {
        let aggr = {};
        for (let i = 0; i < data.length; ++i) {
          if (!aggr.hasOwnProperty(data[i].location_id)) {
            aggr[data[i].location_id] = parseInt(data[i].amount, 10);
          } else {
            aggr[data[i].location_id] += parseInt(data[i].amount, 10);
          }
        }
        item.Details = [] as StockDetail[];

        for (let k in aggr) {
          let detail = new StockDetail();
          detail.Amount = aggr[k];
          detail.Location = this.getLocationById(k).Name;
          item.Details.push(detail);
        }
        item.DetailsLoaded = true;

        // aggregate the items by location id
        return item;
      })
    );
  }

  public addStock(productId : number, locationId : string, quantity : number) : Observable<any> {
    return this.http.post(this.currentConfigSubject.value?.URL + '/api/stock/products/' + productId + '/add', 
      {  
        "amount": quantity,
        "location_id": locationId
      },
      { 
        headers: this.httpHeaders 
      });
  }

  public consumeStock(productId : number, locationId : string, quantity : number) : Observable<any> {
    return this.http.post(this.currentConfigSubject.value?.URL + '/api/stock/products/' + productId + '/consume', 
      {  
        "amount": quantity,
        "location_id": locationId
      },
      { 
        headers: this.httpHeaders 
      });
  }

  public getConfig() : Observable<LocalSettings> {
    return this.testConnection(this.currentConfigSubject?.value);
  }

  public setConfig(config: LocalSettings) {
    return this.testConnection(config);
  }

  getLocations() : Location[] {
    return this.locations;
  }

  getLocationById(id : string) : Location {
    for (var i=0; i < this.locations.length; ++i) {
      if (this.locations[i].Id === id) {
        return this.locations[i];
      }
    }
    return null;
  }

  testConnection(config : LocalSettings) {
    if (!config) {
      return throwError('Configuration not set');
    }
    if (config.URL) {
      this.httpHeaders = new HttpHeaders({
        'GROCY-API-KEY': config.APIKey ? config.APIKey : ""
      });
      return this.http.get<LocalSettings>(config.URL + '/api/system/db-changed-time', { headers: this.httpHeaders})
        .pipe(
          map(data => {return this.handleSuccess(config);}),
          catchError(err => this.handleError(err, config))
        );
    } else {
      let empty = new LocalSettings();
      empty.Valid = false;
      return of(empty);
    }

  }

  handleSuccess(config: LocalSettings) : LocalSettings {
    config.Valid = true;
    this.storeConfig(config);
    this.currentConfigSubject.next(config);
    //load the locations
    this.http.get<location[]>(config.URL + '/api/objects/locations', { headers: this.httpHeaders})
    .pipe(
      map((data : location[]) => 
        data.map(item => {
          let l = new Location();
          l.Id = item.id;
          l.Name = item.name;
          return l;
        })
      )
    )
    .subscribe(res => { this.locations = res; });
    return config;
  }

  handleError(error, config: LocalSettings) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 504) {
        errorMessage = "Grocy is currently unavailable, try again shortly."
      } else if (error.status === 0 || error.status === 404) {
        errorMessage = "Invalid or incorrect URL";
      } else if (error.status === 401) {
        errorMessage = "Invalid or incorrect API Key";
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    return throwError(errorMessage);
  }

  private storeConfig(config: LocalSettings) {
    // store user details and jwt token in local storage to keep user logged in between page refreshes
    localStorage.setItem('grocy_credentials', JSON.stringify(config));
    this.currentConfigSubject.next(config);
  }

  private showStock(item : stockResult) : boolean {
    const config = this.currentConfigSubject?.value;
    return config.ShowAllStock || config.ShowStocksInGroup.indexOf(parseInt(item.product.product_group_id, 10) || 0) > -1;
  }
}
