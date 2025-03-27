import { Pipe, PipeTransform } from '@angular/core';
import {
  BehaviorId,
  ObservationEntry,
  ObservationSessionMetrics,
  ObservationSessionWithEntries,
} from '../../../models/observation.model';

@Pipe({
  name: 'observationSessionMetrics'
})
export class ObservationSessionMetricsPipe implements PipeTransform {

  public transform(value: ObservationSessionWithEntries): ObservationSessionMetrics {
    const behaviorMetrics: Record<BehaviorId, number> = getBehaviorMetrics(value.entries);
    const comparisonBehaviorMetrics: Record<BehaviorId, number> = getBehaviorMetrics(value.comparisonStudentEntries);

    return {
      primaryStudent: {
        count: value.entries.length,
        data: value.session.createdDate.toLocaleString(),
        behaviorMetrics: behaviorMetrics,
      },
      comparisonStudent: {
        count: value.comparisonStudentEntries.length,
        data: value.session.createdDate.toLocaleString(),
        behaviorMetrics: comparisonBehaviorMetrics,
      },
    };
  }

}

function getBehaviorMetrics(entries: Array<ObservationEntry>): Record<BehaviorId, number> {
  const behaviorMetrics: Record<BehaviorId, number> = {};

  for (const behavior of entries) {
    if (!behaviorMetrics[behavior.behaviorId]) {
      behaviorMetrics[behavior.behaviorId] = 0;
    }

    behaviorMetrics[behavior.behaviorId]++;
  }

  return behaviorMetrics;
}
