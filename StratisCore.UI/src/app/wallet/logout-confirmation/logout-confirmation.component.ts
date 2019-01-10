import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

import { ApiService } from '../../shared/services/api.service';
import { GlobalService } from '../../shared/services/global.service';
import { ModalService } from '../../shared/services/modal.service';

@Component({
  selector: 'app-logout-confirmation',
  templateUrl: './logout-confirmation.component.html',
  styleUrls: ['./logout-confirmation.component.css']
})
export class LogoutConfirmationComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private router: Router, private apiService: ApiService, private genericModalService: ModalService, private globalService: GlobalService) { }

  public sidechainEnabled: boolean;

  ngOnInit() {
    this.sidechainEnabled = this.globalService.getSidechainEnabled();
  }

  public onLogout() {
    if (!this.sidechainEnabled) {
      this.apiService.stopStaking()
        .subscribe();
    }
    this.activeModal.close();
    this.router.navigate(['/login']);
  }
}
