import * as angular from 'angular';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { OverlapService } from '../overlap/OverlapService';
import { ValidatorService } from '../schedule-validator/ValidatorService'

/** @internal */
export class OverlapValidatorService implements ValidatorService {
    static $name = 'brWeeklySchedulerOverlapValidatorService';

    static $inject = [
        'brWeeklySchedulerOverlapService'
    ];
    
    private constructor(
        private overlapService: OverlapService
    ) {
    }

    get error() {
        return ValidationError.Overlap;
    }

    public validate(schedules: IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean {
        // Compare two at a time until the end
        let len = schedules.length;
        let result = true;

        for (let i = 0; i < len - 1; i++) {
            let current = schedules[i];
            let next = schedules[i + 1];

            let valuesMatch = current.value === next.value;

            if (!valuesMatch) {
                let overlapState = this.overlapService.getOverlapState(config, current, next);
                result = result && [OverlapState.NoOverlap, OverlapState.OtherStartIsCurrentEnd, OverlapState.OtherEndIsCurrentStart].indexOf(overlapState) > -1;
            }
        }

        return result;
    }
}
