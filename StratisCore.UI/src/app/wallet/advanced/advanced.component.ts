import { Component, OnInit, OnDestroy } from '@angular/core';
import { Animations } from '@shared/animations/animations';
import { TaskBarService } from '@shared/services/task-bar-service';
import { AboutComponent } from './components/about/about.component';


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
}
