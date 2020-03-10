import {Component} from '@angular/core';

@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.scss']
})
export class ImageListComponent {

  images: Image[] = [
    {
      url: '/assets/twemoji/1f375-alt.png',
      description: 'Soup',
    },
    {
      url: '/assets/twemoji/1f375-alt-vegan.png',
      description: 'Soup Vegan',
    },
    {
      url: '/assets/twemoji/1f354.png',
      description: 'Daily',
    },
    {
      url: '/assets/twemoji/1f354-vegan.png',
      description: 'Daily Vegan',
    },
    {
      url: '/assets/twemoji/1f35d.png',
      description: 'Pasta',
    },
    {
      url: '/assets/twemoji/1f35d-vegan.png',
      description: 'Pasta Vegan',
    },
    {
      url: '/assets/twemoji/1f969.png',
      description: 'Grill',
    },
    {
      url: '/assets/twemoji/1f969-vegan.png',
      description: 'Grill Vegan',
    },
    {
      url: '/assets/twemoji/1f957.png',
      description: 'Salad',
    },
    {
      url: '/assets/twemoji/1f957-vegan.png',
      description: 'Salad Vegan',
    },
    {
      url: '/assets/twemoji/1f956.png',
      description: 'Sub',
    },
    {
      url: '/assets/twemoji/1f956-vegan.png',
      description: 'Sub Vegan',
    },
  ];

  constructor() {
  }

}

interface Image {
  url: string;
  description: string;
}
