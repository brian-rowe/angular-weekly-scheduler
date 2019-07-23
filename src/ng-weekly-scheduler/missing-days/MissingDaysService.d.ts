import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { WeeklySchedulerItem } from '../weekly-scheduler-item/WeeklySchedulerItem';
/** @internal */
export declare class MissingDaysService {
    private dayMap;
    private itemFactory;
    static $name: string;
    static $inject: string[];
    private constructor();
    /**
     * The scheduler should always show all days, even if it was not passed any schedules for that day
     */
    fillItems(config: IWeeklySchedulerConfig<any>, items: WeeklySchedulerItem<any>[]): WeeklySchedulerItem<any>[];
}
