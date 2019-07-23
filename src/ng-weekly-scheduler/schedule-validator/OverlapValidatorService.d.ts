import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { ValidatorService } from '../schedule-validator/ValidatorService';
import { ValidationError } from '../weekly-scheduler-config/ValidationErrors';
/** @internal */
export declare class OverlapValidatorService implements ValidatorService {
    private overlapService;
    static $name: string;
    static $inject: string[];
    private constructor();
    readonly error: ValidationError;
    validate(schedules: IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean;
}
