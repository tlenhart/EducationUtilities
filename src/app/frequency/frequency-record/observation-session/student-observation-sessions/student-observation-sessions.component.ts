import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { KeyValuePipe, TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignalWithTransform,
  OnDestroy,
  OnInit,
  Signal,
  signal,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAnchor, MatButton, MatIconAnchor, MatIconButton } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { getState, patchState, SignalState, signalState } from '@ngrx/signals';
import { liveQuery } from 'dexie';
import { from, Subscription, take } from 'rxjs';
import { Temporal } from 'temporal-polyfill';
import { AppDialogService } from '../../../../core/app-dialog/app-dialog.service';
import { eduUtilsDb } from '../../../../core/db/edu-utils.db';
import { GlobalQueryParams } from '../../../../models/global-route-params.model';
import {
  CreateObservationSessionResult,
  fromDbObservationSession,
  ObservationEntryId,
  ObservationSession,
  ObservationSessionId,
  ObservationSessionWithEntries,
  toObservationEntry,
} from '../../../../models/observation.model';
import { IdImportType } from '../../../../models/route-parameter.model';
import { PersonId } from '../../../../scheduler-base/models/person-type.model';
import { SettingsStore } from '../../../../settings/settings.store';
import {
  ObservationSessionMetricsPipe,
} from '../../../../shared/pipes/observation-session-metrics/observation-session-metrics.pipe';
import { RouterLinkBuilderPipe } from '../../../../shared/pipes/router-link-builder/router-link-builder.pipe';
import { ZonedDateTimePipe } from '../../../../shared/pipes/zoned-date-time/zoned-date-time.pipe';
import { ObservationBehaviorStore } from '../../../../shared/stores/observation-behavior.store';
import { ObservationEntriesStore } from '../../../../shared/stores/observation-entries.store';
import { StudentStore } from '../../../../shared/stores/student.store';
import { frequencyRouteKeys } from '../../../frequency-base.routes';
import {
  ObservationSessionEntriesComponent,
} from '../observation-session-entries/observation-session-entries.component';

@Component({
  selector: 'eu-student-observation-sessions',
  imports: [
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderCellDef,
    MatHeaderRowDef,
    MatIcon,
    MatIconButton,
    MatRow,
    MatRowDef,
    MatTable,
    TitleCasePipe,
    ZonedDateTimePipe,
    MatIconAnchor,
    MatSort,
    MatSortHeader,
    MatButton,
    RouterLink,
    MatAnchor,
    ObservationSessionEntriesComponent,
    RouterLinkBuilderPipe,
    ObservationSessionMetricsPipe,
    KeyValuePipe,
    FormsModule,
    MatFormField,
    MatInput,
    CdkTextareaAutosize,
  ],
  templateUrl: './student-observation-sessions.component.html',
  styleUrl: './student-observation-sessions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentObservationSessionsComponent implements OnInit, OnDestroy {
  /*
   * DI
   */

  public readonly settingsStore = inject(SettingsStore);
  public readonly studentStore = inject(StudentStore);
  public readonly behaviorStore = inject(ObservationBehaviorStore);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly observationEntriesStore = inject(ObservationEntriesStore);
  private readonly dialogService: AppDialogService = inject(AppDialogService);
  private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
  private readonly liveAnnouncer: LiveAnnouncer = inject(LiveAnnouncer);

  /*
   * Inputs
   */

  public readonly primaryStudentId: InputSignalWithTransform<PersonId, IdImportType> = input.required<PersonId, IdImportType>({
    transform: (value: IdImportType) => {
      if (typeof value !== 'number') {
        value = parseInt(value, 10);
      }

      if (isNaN(value)) {
        value = -1;
      }

      return value;
    },
  });

  public readonly userSessionDataSource: MatTableDataSource<ObservationSessionWithEntries>;

  public readonly observationSessionColumns: Signal<Array<keyof ObservationSession>> = signal<Array<keyof ObservationSession>>([
    'startTime',
    'createdDate',
  ]);

  public readonly columnsToDisplayWithExpand = computed(() => {
    const observationColumns = this.observationSessionColumns();
    return [
      'id',
      ...observationColumns,
      'edit',
      'expand',
    ];
  });

  public readonly baseRouteToSession: ReadonlyArray<string> = ['/', 'frequency-data', frequencyRouteKeys.base.record, 'observation-session-form'];

  public readonly sort = viewChild.required(MatSort);

  private readonly routerLinkBuilderPipe: RouterLinkBuilderPipe = new RouterLinkBuilderPipe();
  private readonly sortHeaderFormattedCache: Map<Temporal.ZonedDateTime, string> = new Map<Temporal.ZonedDateTime, string>;

  // TODO: Do by id instead.
  private readonly expandedElements: Set<ObservationSessionWithEntries> = new Set<ObservationSessionWithEntries>();
  private readonly expandedElementIds: Set<ObservationSessionId> = new Set<ObservationSessionId>();
  public readonly markedForClosure: SignalState<Record<ObservationSessionId, boolean>> = signalState({});
  public readonly showChartsFor: SignalState<Record<ObservationSessionId, boolean>> = signalState({});
  public readonly showComparisonStudentFor: SignalState<Record<ObservationSessionId, boolean>> = signalState({});

  private userSessionSub$?: Subscription;
  private newObservationSessionDialog$?: Subscription;

  constructor() {
    this.userSessionDataSource = new MatTableDataSource<ObservationSessionWithEntries>([]);

    effect(() => {
      const studentId = this.studentStore.primaryEntityId();

      this.userSessionSub$?.unsubscribe();
      this.sortHeaderFormattedCache.clear();

      this.userSessionSub$ = from(liveQuery(async () => {
        const sessions = await eduUtilsDb.observationSessions.where({ personId: studentId ?? 0 }).reverse().toArray();
        const convertedSessions = sessions.map(fromDbObservationSession);
        const finalSessions: Array<ObservationSessionWithEntries> = [];
        for (const session of convertedSessions) {
          const entries = (await eduUtilsDb.observationEntries.where({ observationSessionId: session.id }).reverse().toArray()).map(toObservationEntry);
          finalSessions.push({
            session: session,
            entries: entries.filter((entry) => !entry.isComparisonStudent),
            comparisonStudentEntries: entries.filter((entry) => entry.isComparisonStudent),
          });
        }

        return finalSessions;
      })).subscribe({
        next: (data: Array<ObservationSessionWithEntries>) => {
          this.userSessionDataSource.data = data;

          for (const item of this.userSessionDataSource.data) {
            if (this.expandedElementIds.has(item.session.id)) {
              this.toggle(item);
            }
          }

          this.expandedElementIds.clear();
        },
      });
    });
  }

  public ngOnInit(): void {
    this.userSessionDataSource.sortingDataAccessor = (data: ObservationSessionWithEntries, headerId: keyof ObservationSession | string) => {

      const sessionHeaderId: keyof ObservationSession = headerId as keyof ObservationSession;

      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check -- Only some columns are sorted.
      switch (sessionHeaderId) {
        case 'startTime':
        case 'endTime':
        case 'createdDate': {
          const dateTime = data.session[sessionHeaderId];

          if (!dateTime) {
            return '';
          }

          if (!this.sortHeaderFormattedCache.has(dateTime)) {
            this.sortHeaderFormattedCache.set(dateTime, dateTime.toInstant().toString());
          }

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- In previous statements, the item is added to the cache if it does not exist.
          return this.sortHeaderFormattedCache.get(dateTime)!;
        }
        case 'id': {
          return data.session.id;
        }
        default: {
          // return data.session[headerId];
          return ''; // TODO: This may need to be something like -1.
        }
      }
    };

    this.userSessionDataSource.sort = this.sort();

    // Get the initial query parameters and set the appropriate sections for expansion.
    // The actual expansion will occur after the data is loaded.
    this.configureExpandedSessionsOnRouteLoad();
  }

  public ngOnDestroy(): void {
    this.userSessionSub$?.unsubscribe();
    this.newObservationSessionDialog$?.unsubscribe();
  }

  public newObservationSession(): void {
    const id = this.studentStore.primaryEntity()?.id;

    if (!id) {
      return;
    }

    const dialogRef = this.dialogService.buildNewObservationSessionDialog(
      this.viewContainerRef,
      { studentId: id },
    );

    // TODO: Try de-duplicating this code here and in the frequency-dashboard
    this.newObservationSessionDialog$ = dialogRef.afterClosed().subscribe({
      next: (createdObservation: CreateObservationSessionResult | undefined) => {
        if (createdObservation?.success) {
          void (async () => {
            try {
              await this.router.navigate(
                this.routerLinkBuilderPipe.transform(`${createdObservation.sessionId}`, this.baseRouteToSession),
                { relativeTo: this.route },
              );
            } catch (error: unknown) {
              console.error('routing failure for observation session', error);
            }
          })();
        }
      },
    });
  }

  public isExpanded(session: ObservationSessionWithEntries): boolean {
    return this.expandedElements.has(session);
  }

  public toggle(session: ObservationSessionWithEntries): void {
    if (this.expandedElements.has(session)) {
      this.expandedElements.delete(session);

      patchState(this.markedForClosure, { [session.session.id]: true });

      // Delay deletion from the expanded list to make a better looking closing animation.
      setTimeout(() => {
        //  TODO: This isn't cleared when the user changes, but it might not matter much.
        patchState(this.markedForClosure, { [session.session.id]: false });
      }, 400);
    } else {
      this.expandedElements.add(session);
    }

    this.updateQueryParams();
  }

  public toggleCharts(session: ObservationSessionWithEntries): void {
    this.toggleForSession(this.showChartsFor, session);
  }

  public toggleComparisonStudent(session: ObservationSessionWithEntries): void {
    this.toggleForSession(this.showComparisonStudentFor, session);
  }

  public async deleteObservationEntry(entryId: ObservationEntryId): Promise<void> {
    const result = await this.observationEntriesStore.removeBehaviorEntry(entryId);

    if (!result.result || result.error) {
      console.error(`Error deleting ${entryId} from database.`, result.error);
    }
  }

  public announceSortChange(sortState: Sort): void {
    if (sortState.direction) {
      void this.liveAnnouncer.announce(`Sorted by ${sortState.direction}ending.`);
    } else {
      void this.liveAnnouncer.announce('Sorting cleared.');
    }
  }

  public collapseAll(): void {
    this.expandedElements.forEach((session) => {
      this.toggle(session);

      // Enable this if you want to ensure charts aren't shown when collapsing all.
      // patchState(this.showChartsFor, { [session.session.id]: false });
      // patchState(this.showComparisonStudentFor, { [session.session.id]: false });
    });
  }

  private toggleForSession(state: SignalState<Record<ObservationSessionId, boolean>>, session: ObservationSessionWithEntries): void {
    const currentStateForSession = state()[session.session.id];

    if (currentStateForSession) {
      patchState(state, { [session.session.id]: false });
    } else {
      patchState(state, { [session.session.id]: true });
    }

    this.updateQueryParams();
  }

  private updateQueryParams(): void {
    const openedSessions = Array.from(this.expandedElements).map((element) => element.session.id);
    const shownCharts = new Set(Object.entries(getState(this.showChartsFor)).filter((keyValue) => keyValue[1]).map((keyValue) => parseInt(keyValue[0])));
    const shownComparisonStudents = new Set(Object.entries(getState(this.showComparisonStudentFor)).filter((keyValue) => keyValue[1]).map((keyValue) => parseInt(keyValue[0])));

    const chartsToShow = new Set(openedSessions).intersection(shownCharts);
    const comparisonStudentsToShow = new Set(openedSessions).intersection(shownComparisonStudents);

    // Update query params for opened elements so they can be restored when navigating back to this route.
    void this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: {
          [GlobalQueryParams.openedSessions.name]: openedSessions,
          [GlobalQueryParams.showCharts.name]: Array.from(chartsToShow),
          [GlobalQueryParams.showComparisonStudent.name]: Array.from(comparisonStudentsToShow),
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
        skipLocationChange: false,
      },
    );
  }

  private configureExpandedSessionsOnRouteLoad(): void {
    // Get the initial query parameters and set the appropriate sections for expansion.
    // The actual expansion will occur after the data is loaded.
    this.route.queryParams.pipe(take(1)).subscribe((routeParams) => {
      let openedSessions: Array<string> | string | undefined = routeParams[GlobalQueryParams.openedSessions.name] as Array<string> | string | undefined;
      let sessionsShowingCharts: Array<string> | string | undefined = routeParams[GlobalQueryParams.showCharts.name] as Array<string> | string | undefined;
      let sessionsShowingComparisonStudent: Array<string> | string | undefined = routeParams[GlobalQueryParams.showComparisonStudent.name] as Array<string> | string | undefined;

      if (!openedSessions) {
        return;
      }

      if (typeof openedSessions === 'string') {
        openedSessions = [openedSessions];
      }

      if (typeof sessionsShowingCharts === 'string') {
        sessionsShowingCharts = [sessionsShowingCharts];
      }

      if (typeof sessionsShowingComparisonStudent === 'string') {
        sessionsShowingComparisonStudent = [sessionsShowingComparisonStudent];
      }

      const showChartsFor = new Set<string>(sessionsShowingCharts ?? []);
      const showComparisonStudentFor = new Set<string>(sessionsShowingComparisonStudent ?? []);

      for (const sessionId of openedSessions) {
        const parsedId: number = parseInt(sessionId, 10);

        if (!isNaN(parsedId)) {
          this.expandedElementIds.add(parsedId);

          if (showChartsFor.has(sessionId)) {
            patchState(this.showChartsFor, { [parsedId]: true });
          }

          if (showComparisonStudentFor.has(sessionId)) {
            patchState(this.showComparisonStudentFor, { [parsedId]: true });
          }
        }
      }
    });
  }

}
