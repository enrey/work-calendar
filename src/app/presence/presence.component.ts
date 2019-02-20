import { ContextStoreService } from './../store/context-store.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-presence',
  templateUrl: './presence.component.html',
  styleUrls: ['./presence.component.scss']
})
export class PresenceComponent implements OnInit, OnDestroy {
  constructor(private route: ActivatedRoute, private contextStoreService: ContextStoreService) {}

  id: string;
  private sub: any;

  ngOnInit() {
    this.id = this.route.snapshot.params.id
      ? this.route.snapshot.params.id
      : this.contextStoreService.getSelectedUser();
    // alert(this.id);
    // this.sub = this.route.params.subscribe(params => {
    //   this.id = +params['id']; // (+) converts string 'id' to a number
    //   alert(this.id);

    //   // In a real app: dispatch action to load the details here.
    // });
  }

  ngOnDestroy() {
    // this.sub.unsubscribe();
  }
}
