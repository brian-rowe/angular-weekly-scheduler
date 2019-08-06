import { Days } from '../weekly-scheduler-config/Days';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
export interface IWeeklySchedulerItem<T> {
    day: Days;
    editable?: boolean;
    schedules: IWeeklySchedulerRange<T>[];
}
