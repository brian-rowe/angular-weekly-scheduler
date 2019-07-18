import { IWeeklySchedulerAdapter as WeeklySchedulerAdapter } from './adapter/IWeeklySchedulerAdapter';
import { IWeeklySchedulerOptions as WeeklySchedulerOptions } from './weekly-scheduler-config/IWeeklySchedulerOptions';

export namespace weeklyScheduler {
    export type IWeeklySchedulerAdapter<TCustom, TValue> = WeeklySchedulerAdapter<TCustom, TValue>;
    export type IWeeklySchedulerOptions<T> = WeeklySchedulerOptions<T>;
}