import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(private electronService: ElectronService) { }

  public applicationVersion;

  ngOnInit() {
    this.applicationVersion = this.electronService.remote.app.getVersion();
  }

}
