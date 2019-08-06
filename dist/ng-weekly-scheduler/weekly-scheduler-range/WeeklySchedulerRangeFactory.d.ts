import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { WeeklySchedulerRange } from '../weekly-scheduler-range/WeeklySchedulerRange';
/** @internal */
export declare class WeeklySchedulerRangeFactory {
    private endAdjusterService;
    static $name: string;
    static $inject: string[];
    private constructor();
    createRange(config: IWeeklySchedulerConfig<any>, schedule: IWeeklySchedulerRange<any>): WeeklySchedulerRange<any>;
}
