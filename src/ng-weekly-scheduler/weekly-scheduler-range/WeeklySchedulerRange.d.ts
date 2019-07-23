import { Days } from '../weekly-scheduler-config/Days';
import { EndAdjusterService } from '../end-adjuster/EndAdjusterService';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IWeeklySchedulerRange } from './IWeeklySchedulerRange';
/** Provides common functionality for a schedule -- pass it in and the resulting object will allow you to operate on it */
/** @internal */
export declare class WeeklySchedulerRange<T> implements IWeeklySchedulerRange<T> {
    private config;
    private endAdjusterService;
    $class: string;
    $isActive: boolean;
    $isDeleting: boolean;
    $isEditing: boolean;
    day: Days;
    start: number;
    end: number;
    value: T;
    editable: boolean;
    constructor(config: IWeeklySchedulerConfig<T>, schedule: IWeeklySchedulerRange<T>, endAdjusterService: EndAdjusterService);
    readonly duration: number;
    equals(other: WeeklySchedulerRange<T>): boolean;
    hasSameValueAs(other: WeeklySchedulerRange<T>): boolean;
    update(updatedSchedule: IWeeklySchedulerRange<T>): void;
    updateEnd(updatedEnd: number): boolean;
    updateStart(updatedStart: number): boolean;
    private canUpdateEnd(updatedEnd);
    private canUpdateStart(updatedStart);
}
