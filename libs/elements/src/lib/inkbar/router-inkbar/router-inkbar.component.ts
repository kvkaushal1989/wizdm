import { Component, AfterViewInit, OnDestroy, ContentChildren, QueryList, ViewEncapsulation } from '@angular/core';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { RouterInkbarDirective } from './router-inkbar.directive';
import { InkbarComponent } from '../base-inkbar/inkbar.component';
import { InkbarItem, InkbarDirective } from '../base-inkbar/inkbar.directive';
import { Subscription, animationFrameScheduler } from 'rxjs';
import { filter, observeOn } from 'rxjs/operators';
import { $animations } from '../base-inkbar/inkbar.animations';

@Component({
  selector: 'wm-router-inkbar',
  templateUrl: '../base-inkbar/inkbar.component.html',
  styleUrls: ['../base-inkbar/inkbar.component.scss'],
  host: { "class": 'wm-inkbar' },
  inputs: ['color', 'thickness', 'side'],
  outputs: ['done'],
  animations: $animations,
  encapsulation: ViewEncapsulation.None 
})
export class RouterInkbarComponent extends InkbarComponent implements AfterViewInit, OnDestroy {

  // Query for RouterInkbarDirective children
  @ContentChildren(RouterInkbarDirective, { descendants: true }) readonly links: QueryList<InkbarItem>;

  // Query for base InkbarDirective children
  @ContentChildren(InkbarDirective, { descendants: true }) readonly items: QueryList<InkbarItem>;

  private sub: Subscription;

  constructor(private router: Router) { super(); 

    // Detects router navigation end event to trigger inkbar animation
    this.sub = this.router.events.pipe( 
      // Filters navigation end events
      filter((s: RouterEvent) => s instanceof NavigationEnd), 
      // Switch to the AnimationFrame scheduler preventing ExpressionChangedAfterHasBeenChecked() exception without delaying
      observeOn(animationFrameScheduler)
      // Updates the inkbar position
    ).subscribe( () =>  this.update() );   
  }

  // Activates the very first link on Init
  ngAfterViewInit() { this.activateLink( this.links.first ); }

  // Unsubscribes from the router observable
  ngOnDestroy() { this.sub.unsubscribe(); }
  
  // Overrides the update() reverting to the active link
  public update() {
    // Search for the active link or item
    this.activateLink( this.links.find( link => link.isActive ) || this.items.find( link => link.isActive ) );
  }

  private activateLink(link: InkbarItem) {

    if(!!link) { this.activate(link.elm); }
    else { this.clear(); }
  }
}
