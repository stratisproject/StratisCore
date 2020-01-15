import { Component, OnInit } from '@angular/core';
import { Animations } from '@shared/animations/animations';

@Component({
  selector: 'app-task-bar',
  templateUrl: './task-bar.component.html',
  styleUrls: ['./task-bar.component.scss'],
  animations : Animations.openClose
})
export class TaskBarComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
