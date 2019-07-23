import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { WeeklySchedulerRange } from '../weekly-scheduler-range/WeeklySchedulerRange';
/** When using the 'fillEmptyWithDefault' option, this service will be used to delete the default schedules for correct display on the calendar */
/** @internal */
export declare class PurgeDefaultService {
    static $name: string;
    purge(schedules: WeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): WeeklySchedulerRange<any>[];
}
