import { Component, OnInit } from '@angular/core';

import { StakingType } from '../../enums';

@Component({
  selector: 'app-staking-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css']
})
export class StakingSceneComponent implements OnInit {

  StakingTypeEnum = StakingType;

  constructor() { }

  ngOnInit() {
  }

  onSetup() {
  }
}
