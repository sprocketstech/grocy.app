import { Component, OnInit } from '@angular/core';
import { ActionService, ActionItem } from '../../services/action.service';

@Component({
  selector: 'app-action-toolbar',
  templateUrl: './action-toolbar.component.html',
  styleUrls: ['./action-toolbar.component.scss']
})
export class ActionToolbarComponent implements OnInit {
  items: ActionItem[];

  constructor(private actions : ActionService) {
  }

  ngOnInit(): void {
    this.actions.getActions().subscribe(res => {
      this.items = res;
    });
  }

}
