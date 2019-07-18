import { IWeeklySchedulerAdapter as WeeklySchedulerAdapter } from './adapter/IWeeklySchedulerAdapter';

export namespace weeklyScheduler {
    export type IWeeklySchedulerAdapter<TCustom, TValue> = WeeklySchedulerAdapter<TCustom, TValue>;
}