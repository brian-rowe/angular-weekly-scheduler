import * as angular from 'angular';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { ValidatorService } from '../schedule-validator/ValidatorService'

/** @internal */
export class NullEndScheduleValidatorService implements ValidatorService {
    static $name = 'brWeeklySchedulerNullEndValidatorService';

    get error() {
        return ValidationError.NullEnd;
    }

    validate(schedules: IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean {
        if (config.nullEnds) {
            return schedules.length <= 1 && schedules.every(schedule => schedule.end === null);
        } else {
            return schedules.every(schedule => schedule.end !== null);
        }
    }
}


angular
    .module('br.weeklyScheduler')
    .service(NullEndScheduleValidatorService.$name, NullEndScheduleValidatorService);
