import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { ValidationError } from '../weekly-scheduler-config/ValidationErrors';

/** @internal */
export interface ValidatorService {
    error: ValidationError;
    validate(schedules: IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean;
}
