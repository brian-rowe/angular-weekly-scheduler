import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';

/** @internal */
export interface ValidatorService {
    error: ValidationError;
    validate(schedules: IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean;
}
