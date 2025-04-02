import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Aid } from '../../../models/aid.model';
import { InsertDbType } from '../../../models/db.types';
import { AidStore } from '../../../stores/aid.store';

type AddAidFormType = Partial<{ [K in keyof InsertDbType<Aid>]: FormControl }>;

@Component({
  selector: 'eu-add-aid',
  imports: [],
  templateUrl: './add-aid.component.html',
  styleUrl: './add-aid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddAidComponent {

  private readonly aidStore = inject(AidStore);

  public readonly addAidForm: FormGroup<AddAidFormType>;

  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  constructor() {
    this.addAidForm = this.fb.group<AddAidFormType>({
      // eslint-disable-next-line @typescript-eslint/unbound-method
      name: this.fb.control('', { validators: [Validators.required] }),
    });
  }

  public async addAid(): Promise<void> {
    const aid: InsertDbType<Aid> = {
      scheduleId: 1,
      name: 'New Aid Name',
      schedule: [],
    };

    const success: boolean = await this.aidStore.addAid(aid);
  }
}
