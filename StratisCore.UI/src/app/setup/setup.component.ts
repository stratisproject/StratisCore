import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import { Router } from '@angular/router';
import { GlobalService } from '@shared/services/global.service';

@Component({
  selector: 'setup-component',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css'],
})
export class SetupComponent implements OnInit {
  constructor(private router: Router, private globalService: GlobalService) {}

  public sidechainEnabled: boolean;

  ngOnInit() {
    this.sidechainEnabled = this.globalService.getSidechainEnabled();
  }

  public onCreateClicked() {
    this.router.navigate(['setup/create']);
  }

  public onRecoverClicked() {
    this.router.navigate(['setup/recover']);
  }

  public onBackClicked() {
    this.router.navigate(['login']);
  }
}
