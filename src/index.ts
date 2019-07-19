import { IWeeklySchedulerAdapter as WeeklySchedulerAdapter } from './ng-weekly-scheduler/adapter/IWeeklySchedulerAdapter';
import { IWeeklySchedulerOptions as WeeklySchedulerOptions } from './ng-weekly-scheduler/weekly-scheduler-config/IWeeklySchedulerOptions';

export namespace weeklyScheduler {
    export type IWeeklySchedulerAdapter<TCustom, TValue> = WeeklySchedulerAdapter<TCustom, TValue>;
    export type IWeeklySchedulerOptions<T> = WeeklySchedulerOptions<T>;
}