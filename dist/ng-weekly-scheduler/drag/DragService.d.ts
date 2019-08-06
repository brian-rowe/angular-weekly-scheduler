import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { WeeklySchedulerRange } from '../weekly-scheduler-range/WeeklySchedulerRange';
/** @internal */
export declare class DragService {
    private endAdjusterService;
    private nullEndWidth;
    private rangeFactory;
    static $name: string;
    static $inject: string[];
    private constructor();
    getDragRangeFromSchedule(config: IWeeklySchedulerConfig<any>, schedule: WeeklySchedulerRange<any>): WeeklySchedulerRange<any>;
}
