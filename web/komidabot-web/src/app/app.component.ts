import {Component, OnInit} from '@angular/core';
import {CheckForUpdateService} from "./check-for-update.service";
import {FacebookMessengerService} from "./facebook-messenger.service";
import {DeviceDetectorService} from "ngx-device-detector";

@Component({
  selector: 'app-component',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  deviceInfo: DeviceInfo;
  displaySplash: boolean;

  // noinspection JSUnusedLocalSymbols
  constructor(
    private deviceService: DeviceDetectorService,
    // Add here to force starting this service
    private updateService: CheckForUpdateService,
    private messengerService: FacebookMessengerService,
  ) {
  }

  ngOnInit(): void {
    const ua = this.deviceService.userAgent;
    // Add custom check for facebook, as it's not possible to add the app to your homescreen from their browser
    const isFacebook = ua.indexOf("FBAN") > -1 || ua.indexOf("FBAV") > -1;

    this.deviceInfo = {
      user_agent: this.deviceService.userAgent,
      browser: this.deviceService.browser,
      browser_version: this.deviceService.browser_version,
      device: this.deviceService.device,
      os: this.deviceService.os,
      os_version: this.deviceService.os_version,
      is_desktop: this.deviceService.isDesktop(),
      is_tablet: this.deviceService.isTablet(),
      is_mobile: this.deviceService.isMobile(),
      is_facebook: isFacebook,
    };
    console.log(this.deviceService.getDeviceInfo());

    this.displaySplash = true; //this.deviceInfo.is_mobile || this.deviceInfo.is_tablet
  }

  splashComplete() {
    this.displaySplash = false;
  }
}

interface DeviceInfo {
  user_agent: string;
  browser: string;
  browser_version: string;
  device: string;
  os: string;
  os_version: string;
  is_desktop: boolean;
  is_tablet: boolean;
  is_mobile: boolean;
  is_facebook: boolean;
}
