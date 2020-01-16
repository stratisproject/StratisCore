import { Component, OnInit, OnDestroy } from '@angular/core';
import { Animations } from '@shared/animations/animations';
import { TaskBarService } from '@shared/services/task-bar-service';
import { AboutComponent } from './components/about/about.component';
import { SendConfirmationComponent } from '../send/send-confirmation/send-confirmation.component';
import { ResyncComponent } from './components/resync/resync.component';
import { AddNodeComponent } from './components/add-node/add-node.component';


@Component({
  selector: 'app-advanced',
  templateUrl: './advanced.component.html',
  styleUrls: ['./advanced.component.scss'],
  animations: Animations.fadeIn
})

export class AdvancedComponent implements OnInit, OnDestroy {
  constructor(private taskBarService: TaskBarService) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  openRescan() {
    const taskBarRef = this.taskBarService
      .open(ResyncComponent, {}, {
        showCloseButton: true,
        taskBarWidth: '550px'
      });

    //taskBarRef.close(taskBarRef.instance);

  }

  addNode() {
    const taskBarRef = this.taskBarService
      .open(AddNodeComponent, {}, {
        showCloseButton: true,
        taskBarWidth: '550px'
      });

  }
}
