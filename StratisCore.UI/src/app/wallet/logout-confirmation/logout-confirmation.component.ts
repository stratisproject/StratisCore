import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from '@shared/services/global.service';
import { ModalService } from '@shared/services/modal.service';
<<<<<<< HEAD
import { StakingService } from '@shared/services/staking-service';
=======
>>>>>>> origin/master

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
<<<<<<< HEAD
      this.stakingService.stopStaking();

=======
      this.apiService.stopStaking()
        .subscribe();
>>>>>>> origin/master
    }
    this.activeModal.close();
    this.router.navigate(['/login']);
  }
}
