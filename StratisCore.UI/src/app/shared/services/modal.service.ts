import {Injectable} from "@angular/core";

import { NgbModal, NgbActiveModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

import { GenericModalComponent } from '../components/generic-modal/generic-modal.component';

@Injectable()
export class ModalService {
  constructor(private modalService: NgbModal) {}
  private modalOptions: NgbModalOptions;

  public openModal(title, body) {
    const modalRef = this.modalService.open(GenericModalComponent, { backdrop: "static", keyboard: false });
    if (title) {
      modalRef.componentInstance.title = title;
    }

    if (body) {
      modalRef.componentInstance.body = body;
    }
  }
}
