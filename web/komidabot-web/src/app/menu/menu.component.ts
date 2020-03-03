import {Component, Input, OnInit} from '@angular/core';
import {Menu, MenuItem} from "../types";
import {FoodType, foodTypeIcons} from "../entities";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  @Input()
  menu: Menu;

  constructor() {
  }

  ngOnInit(): void {
  }

  getItemIconURL(item: MenuItem): string {
    return `https://twemoji.maxcdn.com/v/latest/72x72/${foodTypeIcons[<FoodType>item.type]}.png`;
  }

}
