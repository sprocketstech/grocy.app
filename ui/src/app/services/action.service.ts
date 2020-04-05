import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

export class ActionItem {
  title: string;
  icon: string;
  action: () => void;
};

@Injectable({
  providedIn: 'root'
})
export class ActionService {
  private currentActionsSubject: BehaviorSubject<ActionItem[]>;
  public currentActions: Observable<ActionItem[]>;

  constructor(private router : Router) {
    this.currentActionsSubject = new BehaviorSubject<ActionItem[]>([] as ActionItem[]);
    this.currentActions = this.currentActionsSubject.asObservable();
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => {
        this.currentActionsSubject.next([] as ActionItem[]);
      });
  }

  getActions() : Observable<ActionItem[]> {
    return this.currentActions;
  }

  setActions(acts : ActionItem[]) {
    this.currentActionsSubject.next(acts);
  }
}
