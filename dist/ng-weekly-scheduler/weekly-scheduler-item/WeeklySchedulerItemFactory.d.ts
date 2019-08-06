import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { WeeklySchedulerItem } from '../weekly-scheduler-item/WeeklySchedulerItem';
/** @internal */
export declare class WeeklySchedulerItemFactory {
    private dayMap;
    private fillEmptyWithDefaultService;
    private overlapService;
    private purgeDefaultService;
    private rangeFactory;
    static $name: string;
    static $inject: string[];
    private constructor();
    createItem(config: IWeeklySchedulerConfig<any>, day: number, schedules: IWeeklySchedulerRange<any>[]): WeeklySchedulerItem<any>;
}
