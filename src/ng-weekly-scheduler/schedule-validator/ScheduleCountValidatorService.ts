import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { ValidatorService } from '../schedule-validator/ValidatorService'
import { ValidationError } from '../weekly-scheduler-config/ValidationErrors';

/** @internal */
export class ScheduleCountValidatorService implements ValidatorService {
    static $name = 'rrWeeklySchedulerScheduleCountValidatorService';

    get error() {
        return ValidationError.ScheduleCount;
    }

    public validate(schedules: IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean {
        if (!config.scheduleCountOptions.count) {
            return true;    
        }

        if (config.scheduleCountOptions.exact) {
            return this.validateExactCount(schedules, config);
        } else {
            return this.validateMaxCount(schedules, config);
        }
    }

    private validateExactCount(schedules: IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean {
        return schedules.length === config.scheduleCountOptions.count;
    }

    private validateMaxCount(schedules: IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean {
        return schedules.length <= config.scheduleCountOptions.count;
    }
}
