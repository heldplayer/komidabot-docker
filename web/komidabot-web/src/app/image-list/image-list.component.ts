import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.scss']
})
export class ImageListComponent implements OnInit {

  images: Image[] = [
    {
      url: '/assets/twemoji/1f35d.png',
      description: 'Pasta original',
    },
    {
      url: '/assets/twemoji/1f35d-vegan.png',
      description: 'Pasta original with upper V',
    },
    {
      url: '/assets/twemoji/1f35d-Dvegan.png',
      description: 'Pasta original with lower V',
    },
    {
      url: '/assets/twemoji/1f35d-Dvegan-dark.png',
      description: 'Pasta original with darker lower V',
    },
    {
      url: '/assets/twemoji/1f35d-alt.png',
      description: 'Pasta green',
    },
    {
      url: '/assets/twemoji/1f35d-vegan-alt.png',
      description: 'Pasta green with upper V',
    },
    {
      url: '/assets/twemoji/1f35d-Dvegan-alt.png',
      description: 'Pasta green with lower V',
    },
    {
      url: '/assets/twemoji/1f35d-Dvegan-alt-dark.png',
      description: 'Pasta green with darker lower V',
    },
    {
      url: '/assets/twemoji/1f35d-alt-alt.png',
      description: 'Pasta greener',
    },
    {
      url: '/assets/twemoji/1f35d-vegan-alt-alt.png',
      description: 'Pasta greener with upper V',
    },
    {
      url: '/assets/twemoji/1f35d-Dvegan-alt-alt.png',
      description: 'Pasta greener with lower V',
    },
    {
      url: '/assets/twemoji/1f35d-Dvegan-alt-alt-dark.png',
      description: 'Pasta greener with darker lower V',
    },
  ];

  constructor() {
  }

  ngOnInit(): void {
  }

}

interface Image {
  url: string;
  description: string;
}
