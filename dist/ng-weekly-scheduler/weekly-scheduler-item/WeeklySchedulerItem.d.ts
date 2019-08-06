import { Days } from '../weekly-scheduler-config/Days';
import { FillEmptyWithDefaultService } from '../fill-empty-with-default/FillEmptyWithDefaultService';
import { IInternalWeeklySchedulerItem } from '../weekly-scheduler-item/IInternalWeeklySchedulerItem';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { OverlapService } from '../overlap/OverlapService';
import { PurgeDefaultService } from '../purge-default/PurgeDefaultService';
import { WeeklySchedulerRange } from '../weekly-scheduler-range/WeeklySchedulerRange';
import { WeeklySchedulerRangeFactory } from '../weekly-scheduler-range/WeeklySchedulerRangeFactory';
/** Provides common functionality for an item -- pass it in and the resulting object will allow you to operate on it */
/** @internal */
export declare class WeeklySchedulerItem<T> implements IInternalWeeklySchedulerItem<T> {
    config: IWeeklySchedulerConfig<T>;
    private fillEmptyWithDefaultService;
    private overlapService;
    private purgeDefaultService;
    private rangeFactory;
    $isGhostOrigin: boolean;
    $renderGhost: boolean;
    day: Days;
    editable: boolean;
    label: string;
    schedules: WeeklySchedulerRange<T>[];
    constructor(config: IWeeklySchedulerConfig<T>, item: IInternalWeeklySchedulerItem<T>, fillEmptyWithDefaultService: FillEmptyWithDefaultService, overlapService: OverlapService, purgeDefaultService: PurgeDefaultService, rangeFactory: WeeklySchedulerRangeFactory);
    addSchedule(schedule: IWeeklySchedulerRange<T>): WeeklySchedulerRange<any>;
    addScheduleAndMerge(schedule: IWeeklySchedulerRange<T>): WeeklySchedulerRange<any>;
    canAddSchedule(): boolean;
    /** Determine if the conditions allow for a pop-up editor */
    canEdit(): boolean;
    /** Determine if a schedule is able to be modified */
    canEditSchedule(schedule: WeeklySchedulerRange<T>): boolean;
    /**
     * Rather than having to deal with modifying mergeOverlaps to handle nullEnds calendars,
     * just prevent the user from creating additional slots in nullEnds calendars unless there are no slots there already.
     */
    canRenderGhost(): boolean;
    hasSchedule(schedule: WeeklySchedulerRange<T>): boolean;
    hasNoSchedules(): boolean;
    fillEmptySlotsWithDefaultSchedules(): void;
    forceNullEnds(): void;
    mergeOverlaps(): void;
    mergeSchedule(schedule: WeeklySchedulerRange<any>): void;
    purgeDefaultSchedules(): void;
    removeSchedule(schedule: WeeklySchedulerRange<T>): void;
    private getOverlapHandler(overlapState);
    private handleCurrentCoversOther(current, other);
    private handleCurrentIsInsideOther(current, other);
    private handleNoOverlap(current, other);
    private handleOtherEndIsInsideCurrent(current, other);
    private handleOtherStartIsInsideCurrent(current, other);
    private handleOtherEndIsCurrentStart(current, other);
    private handleOtherStartIsCurrentEnd(current, other);
    private mergeOverlapsForSchedule(schedule);
    private needsOverlapsMerged();
}
