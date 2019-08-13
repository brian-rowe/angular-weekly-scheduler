import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { ValidatorService } from '../schedule-validator/ValidatorService'
import { ValidationError } from '../weekly-scheduler-config/ValidationErrors';

/** @internal */
export class MinimumSeparationValidatorService implements ValidatorService {
    static $name = 'rrWeeklySchedulerMinimumSeparationValidatorService';

    get error() {
        return ValidationError.MinimumSeparation;
    }

    public validate(schedules: IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean {
        if (!config.minimumSeparation) {
            return true;
        }

        const len = schedules.length;

        if (len <= 1) {
            return true;
        }

        const loopLen = len - 1;

        schedules.sort((a, b) => a.start - b.start);

        for (let i = 0; i < loopLen; i++) {
            let currentSchedule = schedules[i];
            let nextSchedule = schedules[i + 1];

            if (nextSchedule.start - currentSchedule.end < config.minimumSeparation) {
                return false;
            }
        }

        return true;
    }
}
