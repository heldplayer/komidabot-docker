import {Component, OnInit} from '@angular/core';
import {CheckForUpdateService} from "./check-for-update.service";
import {FacebookMessengerService} from "./facebook-messenger.service";

@Component({
  selector: 'app-component',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  // noinspection JSUnusedLocalSymbols
  constructor(
    // Add here to force starting this service
    private updateService: CheckForUpdateService,
    private messengerService: FacebookMessengerService
  ) {
  }

  ngOnInit(): void {
  }

}
