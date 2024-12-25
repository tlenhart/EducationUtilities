import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Aid } from '../../models/aid.model';
import { Person } from '../../models/person-type.model';
import { PersonSelectorComponent } from '../../shared/person-selector/person-selector.component';
import { AidStore } from '../../stores/aid.store';

@Component({
  selector: 'eu-aid-configuration',
  imports: [
    PersonSelectorComponent,
    RouterOutlet,
  ],
  templateUrl: './aid-configuration.component.html',
  styleUrl: './aid-configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AidConfigurationComponent implements OnInit {
  public readonly aidStore = inject(AidStore);

  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  public ngOnInit(): void {
    // this.aidStore.loadAids();
  }

  public async selectPerson(aid: Person | Aid | null): Promise<void> {
    if (aid) {
      try {
        await this.router.navigate([aid.id], { relativeTo: this.route });
      } catch (e: unknown) {
        console.error(e, `Unable to load aid with id: ${aid.id}.`);
      }
    }
  }
}
