import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';

import { NbSidebarService } from '@nebular/theme';
import { NbMenuItem } from '@nebular/theme';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  baseTitle = 'Grocy';
  items: NbMenuItem[] = [
    {
      title: 'Stock',
      expanded: true,
      icon: 'cube',
      link: '/stock'
    },
    {
      title: 'Settings',
      expanded: true,
      icon: 'settings',
      link: '/settings'
    }
  ];

  constructor(private titleService: Title,
                private router : Router,
                private activatedRoute : ActivatedRoute,
                private sidebarService: NbSidebarService) {
    this.titleService.setTitle(this.baseTitle);
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        const child = this.activatedRoute.firstChild;
        if (child && child.snapshot.data['title']) {
          return this.baseTitle + " - " + child.snapshot.data['title'];
        }
        return this.baseTitle;
      })
    ).subscribe((ttl: string) => {
      this.titleService.setTitle(ttl);
    });
  }

  getTitle() : string {
    return this.titleService.getTitle();
  }

  
  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    return false;
  }
}
