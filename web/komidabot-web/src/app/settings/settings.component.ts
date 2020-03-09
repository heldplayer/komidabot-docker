import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {SettingsService} from "../settings.service";
import {CampusService} from "../campus.service";
import {ApiResponse, Campus} from "../entities";
import {map} from "rxjs/operators";
import {AppConfigService} from "../app-config.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  language$: Observable<string>;
  startup$: Observable<StartupInfo>;

  campus1$: Observable<CampusSelectionInfo>;
  campus2$: Observable<CampusSelectionInfo>;
  campus3$: Observable<CampusSelectionInfo>;
  campus4$: Observable<CampusSelectionInfo>;
  campus5$: Observable<CampusSelectionInfo>;
  campusSettings: Observable<CampusSelectionInfo>[];

  campuses$: Observable<Campus[]>;

  showSubscriptionButton$: Observable<boolean>;

  constructor(
    private settings: SettingsService,
    private campusService: CampusService,
    private appConfig: AppConfigService,
  ) {
    this.language$ = this.settings.getLanguage();
    this.startup$ = this.settings.getStartup()
      .pipe(map(value => new StartupInfo(value)));

    this.campus1$ = this.settings.getCampusMonday()
      .pipe(map(value => new CampusSelectionInfo(value, this.settings.setCampusMonday)));

    this.campus2$ = this.settings.getCampusTuesday()
      .pipe(map(value => new CampusSelectionInfo(value, this.settings.setCampusTuesday)));

    this.campus3$ = this.settings.getCampusWednesday()
      .pipe(map(value => new CampusSelectionInfo(value, this.settings.setCampusWednesday)));

    this.campus4$ = this.settings.getCampusThursday()
      .pipe(map(value => new CampusSelectionInfo(value, this.settings.setCampusThursday)));

    this.campus5$ = this.settings.getCampusFriday()
      .pipe(map(value => new CampusSelectionInfo(value, this.settings.setCampusFriday)));

    this.campusSettings = [this.campus1$, this.campus2$, this.campus3$, this.campus4$, this.campus5$];

    this.campuses$ = this.campusService.getAllCampuses()
      .pipe(
        ApiResponse.awaitReady(),
      );

    this.showSubscriptionButton$ = this.appConfig.config.pipe(
      map(config => config.api_endpoint === '/api-dev/')
    );
  }

  ngOnInit(): void {
  }

  setLanguage(language: string) {
    this.settings.setLanguage(language);
  }

  setStartup(startup: boolean) {
    this.settings.setStartup(startup);
  }
}

class CampusSelectionInfo {
  constructor(
    public campus: number | null,
    public setter: (value: number | null) => void,
  ) {
  }

  public setValue(element: EventTarget) {
    const value = (<HTMLOptionElement>element).value;
    if (value === 'null') {
      this.setter(null);
    }
    this.setter(parseInt(value));
  }
}


class StartupInfo {
  constructor(
    public value: boolean,
  ) {
  }
}
