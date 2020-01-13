import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '@shared/services/global.service';
import { Animations } from '@shared/animations/animations';

@Component({
  selector: 'setup-component',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css'],
  animations : Animations.fadeIn
})
export class SetupComponent implements OnInit {
  constructor(private router: Router, private globalService: GlobalService) {}

  public sidechainEnabled: boolean;

  ngOnInit(): void {
    this.sidechainEnabled = this.globalService.getSidechainEnabled();
  }

  public onCreateClicked(): void {
    this.router.navigate(['setup/create']);
  }

  public onRecoverClicked(): void {
    this.router.navigate(['setup/recover']);
  }

  public onBackClicked(): void {
    this.router.navigate(['login']);
  }
}
