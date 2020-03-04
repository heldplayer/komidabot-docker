import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {DatePipe} from "@angular/common";

@Pipe({
  name: 'localizedDate'
})
export class LocalizedDatePipe implements PipeTransform {

  constructor(
    private translateService: TranslateService,
  ) {
  }

  transform(value: any, capitalize?: boolean, pattern?: string): string | null {
    if (!pattern) {
      pattern = 'EEEE d MMMM';
    }
    const datePipe: DatePipe = new DatePipe(this.translateService.currentLang);
    let result = datePipe.transform(value, pattern);
    if (capitalize && result) {
      result = result.charAt(0).toUpperCase() + result.slice(1);
    }
    return result;
  }
}
