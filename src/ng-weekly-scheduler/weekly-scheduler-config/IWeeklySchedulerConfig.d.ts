import { IWeeklySchedulerOptions } from '../weekly-scheduler-config/IWeeklySchedulerOptions';

interface IWeeklySchedulerConfig<T> extends IWeeklySchedulerOptions<T> {
    maxValue: number;
    hourCount: number;
    intervalCount: number;
}