
export class StockDetail {
    Location : string;
    Amount : number;
}

export class Stock {
    ProductId: number;
    ProductGroupId: number;
    Name : string;
    Amount : number;
    Loading = false;
    DetailsLoaded = false;
    Details: StockDetail[];
}