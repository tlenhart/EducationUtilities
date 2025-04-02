import { ChangeDetectionStrategy, Component, inject, OnDestroy, ViewContainerRef } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { PersonId } from '../../scheduler-base/models/person-type.model';
import { Student } from '../../scheduler-base/models/student.model';
import { EntitySelectorComponent } from '../../shared/entity-selector/entity-selector.component';
import { StudentStore } from '../../shared/stores/student.store';
import { AddStudentDialogComponent } from './add-student-dialog/add-student-dialog.component';

@Component({
  selector: 'eu-student-configuration',
  imports: [
    ReactiveFormsModule,
    RouterOutlet,
    EntitySelectorComponent,
  ],
  templateUrl: './student-configuration.component.html',
  styleUrl: './student-configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentConfigurationComponent implements OnDestroy {
  public readonly studentStore = inject(StudentStore);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private addStudentDialogSubscription?: Subscription;

  public ngOnDestroy(): void {
    this.addStudentDialogSubscription?.unsubscribe();
  }

  public addStudent(): void {
    // TODO: Handle errors.

    this.addStudentDialogSubscription?.unsubscribe();

    const dialogRef = this.dialog.open<AddStudentDialogComponent, unknown, PersonId>(AddStudentDialogComponent, {
      ariaLabel: 'Add student dialog',
      viewContainerRef: this.viewContainerRef, // This is passed so the studentStore is available in the opened dialog.
    });

    this.addStudentDialogSubscription = dialogRef.afterClosed().subscribe({
      next: (createdPersonId: PersonId | undefined) => {
        if (createdPersonId) {
          void (async () => {
            await this.selectStudent(this.studentStore.entityMap()[createdPersonId]);
          })();
        }
      },
    });
  }

  public async selectStudent(student: Student | null): Promise<void> {
    if (student) {
      try {
        await this.router.navigate([student.id], {
          relativeTo: this.route,
          queryParamsHandling: 'merge',
          queryParams: { showBehaviorConfiguration: true },
        });
      } catch (error: unknown) {
        console.error('routing failure for student', error);
      }
    }
  }
}
