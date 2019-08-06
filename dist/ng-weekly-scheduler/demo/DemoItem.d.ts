import { IWeeklySchedulerItem } from '../weekly-scheduler-item/IWeeklySchedulerItem';
import { Days } from '../weekly-scheduler-config/Days';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
/** @internal */
export declare class DemoItem implements IWeeklySchedulerItem<boolean> {
    day: Days;
    schedules: IWeeklySchedulerRange<boolean>[];
    constructor(day: Days, schedules: IWeeklySchedulerRange<boolean>[]);
    readonly editable: boolean;
}
