import {Injectable} from "@angular/core";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericModalComponent } from '../components/generic-modal/generic-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  constructor(private modalService: NgbModal) {}

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
