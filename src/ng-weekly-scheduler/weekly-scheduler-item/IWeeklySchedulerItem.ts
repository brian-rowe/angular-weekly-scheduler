import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';

export interface IWeeklySchedulerItem<T> {
    day: br.weeklyScheduler.Days;
    editable?: boolean;
    schedules: IWeeklySchedulerRange<T>[];
}
