import * as angular from 'angular';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { ValidatorService } from '../schedule-validator/ValidatorService'
import { ValidationError } from '../weekly-scheduler-config/ValidationErrors';

/** @internal */
export class MonoScheduleValidatorService implements ValidatorService {
    static $name = 'brWeeklySchedulerMonoScheduleValidatorService';

    get error() {
        return ValidationError.MonoSchedule;
    }

    /** Important note -- this does not validate that only one schedule exists per item, but rather that only one NON-DEFAULT schedule exists per item. */
    public validate(schedules: IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean {
        if (!config.monoSchedule) {
            return true;
        }

        // If a default value is defined, schedules with default values don't count -- one non-default schedule per item.
        let schedulesToValidate;

        if (angular.isDefined(config.defaultValue)) {
            schedulesToValidate = schedules.filter(schedule => schedule.value !== config.defaultValue);
        } else {
            schedulesToValidate = schedules;
        }

        // only allowed empty or 1 schedule per item
        return !schedulesToValidate.length || schedulesToValidate.length === 1;
    }
}
