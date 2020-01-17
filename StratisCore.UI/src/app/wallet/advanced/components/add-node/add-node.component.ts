import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SnackbarService } from 'ngx-snackbar';
import { NodeService } from '@shared/services/node-service';

@Component({
  selector: 'app-add-node',
  templateUrl: './add-node.component.html',
  styleUrls: ['./add-node.component.scss']
})
export class AddNodeComponent implements OnInit {
  @Output() nodeAdded = new EventEmitter<boolean>();
  constructor(
    private nodeService: NodeService,
    private snackbarService: SnackbarService,
    private fb: FormBuilder
  ) { }

  public addNodeForm: FormGroup;

  ngOnInit(): void {
    this.buildAddNodeForm();
  }

  formErrors = {
    nodeIP: ''
  };

  validationMessages = {
    nodeIP: {
      required: 'Add a valid IP address.',
      pattern: 'This is not a valid IP address.'
    }
  };

  private buildAddNodeForm(): void {
    this.addNodeForm = this.fb.group({
      nodeIP: ['', Validators.compose([
        Validators.required,
        Validators.pattern(/^([0-9]{1,3})[.]([0-9]{1,3})[.]([0-9]{1,3})[.]([0-9]{1,3})$/)
      ])
    ]});

    this.addNodeForm.valueChanges
      .subscribe(() => this.onValueChanged());

    this.onValueChanged();
  }

  onValueChanged(): void {
    if (!this.addNodeForm) {
      return;
    }
    const form = this.addNodeForm;
    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  public onAddNodeClicked(): void {
    this.nodeService
      .addNode(this.addNodeForm.get('nodeIP').value)
      .toPromise().then(
        () => {
          this.nodeAdded.emit(true);
          this.snackbarService.add({
            msg: 'Node succesfully added.',
            customClass: 'notify-snack-bar',
            action: {
              text: null
            }
          });

          this.addNodeForm.patchValue({nodeIP: ''});
          this.formErrors.nodeIP = '';
        }
      );
  }
}
