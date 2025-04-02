import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { Student } from '../../../scheduler-base/models/student.model';
import { EntitySelectorComponent } from '../../../shared/entity-selector/entity-selector.component';
import { ObservationBehaviorStore } from '../../../shared/stores/observation-behavior.store';
import { StudentStore } from '../../../shared/stores/student.store';

@Component({
  selector: 'eu-observation-session',
  imports: [
    RouterOutlet,
    EntitySelectorComponent,
  ],
  templateUrl: './observation-session.component.html',
  styleUrl: './observation-session.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObservationSessionComponent implements OnDestroy {
  public readonly studentStore = inject(StudentStore);
  public readonly behaviorStore = inject(ObservationBehaviorStore);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  // public readonly selectedStudent: ModelSignal<Student | null> = model<Student | null>(null);

  private readonly dataLoaded$?: Subscription;

  constructor() {
    // this.dataLoaded$ = toObservable(this.studentStore.isLoaded).subscribe((dataLoaded: boolean | null) => {
    //   // if (dataLoaded && this.dialogData?.studentId) {
    //   console.log('routeChildren', this.route.children);
    //   // TODO: If you enable this, you need to make sure it changes when the route changes when going back/forward.
    //   if (dataLoaded && this.route.children.length > 0) {
    //     // const student = this.studentStore.entityMap()[this.dialogData.studentId];
    //     const student = this.studentStore.primaryEntity();
    //
    //     if (student) {
    //       this.selectedStudent.set(student);
    //     }
    //
    //     // Only listen for this once.
    //     this.dataLoaded$.unsubscribe();
    //   }
    // });
  }

  public ngOnDestroy(): void {
    this.dataLoaded$?.unsubscribe();
  }

  public async setStudent(student: Student | null): Promise<void> {
    if (student) {
      // this.selectedStudent.set(student);
      try {
        await this.router.navigate([student.id], { relativeTo: this.route, queryParamsHandling: 'merge' });
      } catch (error: unknown) {
        console.error('routing failure for student observation sessions', error);
      }
    }
  }
}
