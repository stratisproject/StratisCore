import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

import { ApiService } from '../../shared/services/api.service';
import { ModalService } from '../../shared/services/modal.service';

@Component({
  selector: 'app-logout-confirmation',
  templateUrl: './logout-confirmation.component.html',
  styleUrls: ['./logout-confirmation.component.css']
})
export class LogoutConfirmationComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private router: Router, private apiService: ApiService, private genericModalService: ModalService) { }

  ngOnInit() {
  }

  public onLogout() {
    this.apiService.stopStaking()
      .subscribe(
        response =>  {
          if (response.status >= 200 && response.status < 400) {
          }
        },
        error => {
          if (error.status === 0) {
            this.genericModalService.openModal(null, null);
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              console.log(error);
            }
            else {
              this.genericModalService.openModal(null, error.json().errors[0].message);
            }
          }
        }
      )
    ;
    this.activeModal.close();
    this.router.navigate(['/login']);
  }
}
