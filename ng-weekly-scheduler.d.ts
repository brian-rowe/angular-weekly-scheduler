/// <reference types="angular" />
declare module "ng-weekly-scheduler/weekly-scheduler-config/Days" {
    export const enum Days {
        Monday = 0,
        Tuesday = 1,
        Wednesday = 2,
        Thursday = 3,
        Friday = 4,
        Saturday = 5,
        Sunday = 6,
    }
}
declare module "ng-weekly-scheduler/weekly-scheduler-range/IWeeklySchedulerRange" {
    import { Days } from "ng-weekly-scheduler/weekly-scheduler-config/Days";
    export interface IWeeklySchedulerRange<T> {
        /** A css class to apply */
        $class?: string;
        /** This will indicate whether the item is currently considered active to the UI */
        $isActive?: boolean;
        /** If this is set to true while the user is editing an existing item, it will be removed when the edit promise is resolved */
        $isDeleting?: boolean;
        /** This will indicate whether the item is currently being edited by the user */
        $isEditing?: boolean;
        /** Not strictly necessary but makes things a whooole lot easier */
        day: Days;
        start: number;
        end: number;
        value: T;
        editable?: boolean;
    }
}
declare module "ng-weekly-scheduler/group-by/GroupService" {
}
declare module "ng-weekly-scheduler/weekly-scheduler-item/IWeeklySchedulerItem" {
    import { Days } from "ng-weekly-scheduler/weekly-scheduler-config/Days";
    import { IWeeklySchedulerRange } from "ng-weekly-scheduler/weekly-scheduler-range/IWeeklySchedulerRange";
    export interface IWeeklySchedulerItem<T> {
        day: Days;
        editable?: boolean;
        schedules: IWeeklySchedulerRange<T>[];
    }
}
declare module "ng-weekly-scheduler/adapter/IWeeklySchedulerAdapter" {
    import { IWeeklySchedulerItem } from "ng-weekly-scheduler/weekly-scheduler-item/IWeeklySchedulerItem";
    import { IWeeklySchedulerRange } from "ng-weekly-scheduler/weekly-scheduler-range/IWeeklySchedulerRange";
    /**
     * Implement this on a client and then pass it in to the component.
     */
    export interface IWeeklySchedulerAdapter<TCustom, TValue> {
        customModelToWeeklySchedulerRange(custom: TCustom): IWeeklySchedulerRange<TValue>;
        /** Transform the data held within the component to the format you need it outside of the component. */
        getSnapshot(): TCustom[];
        /** This just needs to be defined in the class, we'll set it internally */
        items: IWeeklySchedulerItem<TValue>[];
        initialData: TCustom[];
    }
}
declare module "ng-weekly-scheduler/schedule-count/ScheduleCountOptions" {
    /** Defaults will be provided, but you can override these on a per-calendar basis if necessary */
    export interface ScheduleCountOptions {
        /** The number of schedules allowed on each item. Null for no max */
        count: number;
        /** Whether you must have exactly that many schedules, or if "up to" is allowed */
        exact: boolean;
    }
}
declare module "ng-weekly-scheduler/restriction-explanations/RestrictionExplanations" {
    import { ScheduleCountOptions } from "ng-weekly-scheduler/schedule-count/ScheduleCountOptions";
    /** Defaults will be provided, but you can override these on a per-calendar basis if necessary */
    export interface RestrictionExplanations {
        fullCalendar: string;
        maxTimeSlot: (value: string) => string;
        minimumSeparation: (value: string) => string;
        monoSchedule: string;
        nullEnds: string;
        scheduleCount: (options: ScheduleCountOptions) => string;
    }
}
declare module "ng-weekly-scheduler/weekly-scheduler-config/IWeeklySchedulerOptions" {
    import { Days } from "ng-weekly-scheduler/weekly-scheduler-config/Days";
    import { IWeeklySchedulerItem } from "ng-weekly-scheduler/weekly-scheduler-item/IWeeklySchedulerItem";
    import { IWeeklySchedulerRange } from "ng-weekly-scheduler/weekly-scheduler-range/IWeeklySchedulerRange";
    import { RestrictionExplanations } from "ng-weekly-scheduler/restriction-explanations/RestrictionExplanations";
    import { ScheduleCountOptions } from "ng-weekly-scheduler/schedule-count/ScheduleCountOptions";
    export interface IWeeklySchedulerOptions<T> {
        /** If this is true schedules will be allowed & required to have no set end time */
        nullEnds?: boolean;
        /** These classes will be applied directly to the buttons */
        buttonClasses?: string[];
        /** A function to return an item -- this is REQUIRED so that adapters will always be used for new items, even if they weren't passed in */
        createItem: (day: Days, schedules: IWeeklySchedulerRange<T>[]) => IWeeklySchedulerItem<T>;
        /** defaultValue should be assigned per set of options, not per item. Do not assign for no default */
        defaultValue?: T;
        /** A function to call when an item is clicked in order to bring up an editor for it */
        editSlot?: (schedule: IWeeklySchedulerRange<T>) => angular.IPromise<IWeeklySchedulerRange<T>>;
        /** Whether to fill empty spaces with the default value */
        fillEmptyWithDefault?: boolean;
        /** If this is defined, a null-ended time slot will be assigned its start + this value when it is saved */
        fillNullEnds?: number;
        /** If this is true, ALL slots in the calendar must be filled in order for it to be valid */
        fullCalendar?: boolean;
        /** If this is defined, a time slot will not be able to be more than this many minutes long */
        maxTimeSlot?: number;
        /** If this is defined, slots must be at least this many minutes apart */
        minimumSeparation?: number;
        /** If this is true, the calendar will enforce that only one schedule per item is allowed */
        monoSchedule?: boolean;
        /** This function allows access back to the client scope when the scheduler changes. */
        onChange?: () => void;
        /**
         * This function allows access back to the client scope when a scheduler is removed.
         */
        onRemove?: () => void;
        /** The number of seconds each division of the calendar should be -- values will snap to this */
        interval?: number;
        /** Overrides for restriction explanations, if necessary */
        restrictionExplanations?: RestrictionExplanations;
        /** A function to call when the save button is clicked. If this is not passed, no save button will be present. */
        saveScheduler?: () => angular.IPromise<any>;
        /** Overrides for schedule count options, if necessary */
        scheduleCountOptions?: ScheduleCountOptions;
    }
}
declare module "ng-weekly-scheduler/weekly-scheduler-config/DayMap" {
}
declare module "ng-weekly-scheduler/end-adjuster/EndAdjusterService" {
}
declare module "ng-weekly-scheduler/weekly-scheduler-item/IInternalWeeklySchedulerItem" {
}
declare module "ng-weekly-scheduler/overlap/OverlapService" {
}
declare module "ng-weekly-scheduler/weekly-scheduler-range/WeeklySchedulerRange" {
}
declare module "ng-weekly-scheduler/purge-default/PurgeDefaultService" {
}
declare module "ng-weekly-scheduler/weekly-scheduler-range/WeeklySchedulerRangeFactory" {
}
declare module "ng-weekly-scheduler/weekly-scheduler-item/WeeklySchedulerItem" {
}
declare module "ng-weekly-scheduler/fill-empty-with-default/FillEmptyWithDefaultService" {
}
declare module "ng-weekly-scheduler/weekly-scheduler-item/WeeklySchedulerItemFactory" {
}
declare module "ng-weekly-scheduler/adapter/AdapterService" {
}
declare module "ng-weekly-scheduler/adapter/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/time/TimeConstantsService" {
}
declare module "ng-weekly-scheduler/configuration/ConfigurationService" {
}
declare module "ng-weekly-scheduler/configuration/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/conflicting-options/ConflictingOptionsService" {
}
declare module "ng-weekly-scheduler/conflicting-options/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/drag/DragService" {
}
declare module "ng-weekly-scheduler/drag/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/element-offset/ElementOffsetService" {
}
declare module "ng-weekly-scheduler/element-offset/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/end-adjuster/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/fill-empty-with-default/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/schedule-validator/FullCalendarValidatorService" {
}
declare module "ng-weekly-scheduler/full-calendar/FullCalendarDirective" {
}
declare module "ng-weekly-scheduler/full-calendar/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/mouse-tracker/MouseTrackerService" {
}
declare module "ng-weekly-scheduler/value-normalization/ValueNormalizationService" {
}
declare module "ng-weekly-scheduler/multislider/multislider" {
}
declare module "ng-weekly-scheduler/ghost-slot/ghost-slot" {
}
declare module "ng-weekly-scheduler/ghost-slot/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/group-by/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/touch/TouchService" {
}
declare module "ng-weekly-scheduler/handle/HandleDirective" {
}
declare module "ng-weekly-scheduler/handle/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/last-ghost-day/LastGhostDayService" {
}
declare module "ng-weekly-scheduler/missing-days/MissingDaysService" {
}
declare module "ng-weekly-scheduler/weekly-scheduler/weekly-scheduler" {
}
declare module "ng-weekly-scheduler/hourly-grid/HourlyGridDirective" {
}
declare module "ng-weekly-scheduler/hourly-grid/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/last-ghost-day/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/schedule-validator/MaxTimeSlotValidatorService" {
}
declare module "ng-weekly-scheduler/max-time-slot/MaxTimeSlotDirective" {
}
declare module "ng-weekly-scheduler/max-time-slot/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/schedule-validator/MinimumSeparationValidatorService" {
}
declare module "ng-weekly-scheduler/minimum-separation/MinimumSeparationDirective" {
}
declare module "ng-weekly-scheduler/minimum-separation/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/missing-days/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/schedule-validator/MonoScheduleValidatorService" {
}
declare module "ng-weekly-scheduler/mono-schedule/MonoScheduleDirective" {
}
declare module "ng-weekly-scheduler/mono-schedule/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/mouse-tracker/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/multislider/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/schedule-validator/NullEndValidatorService" {
}
declare module "ng-weekly-scheduler/null-end/NullEndDirective" {
}
declare module "ng-weekly-scheduler/null-end/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/schedule-validator/OverlapValidatorService" {
}
declare module "ng-weekly-scheduler/overlap/OverlapDirective" {
}
declare module "ng-weekly-scheduler/overlap/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/purge-default/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/resize/IResizeServiceProvider" {
    export interface IResizeServiceProvider extends angular.IServiceProvider {
        setCustomResizeEvents(events: string[]): any;
    }
}
declare module "ng-weekly-scheduler/resize/ResizeService" {
}
declare module "ng-weekly-scheduler/resize/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/restriction-explanations/RestrictionExplanationsComponent" {
}
declare module "ng-weekly-scheduler/restriction-explanations/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/revalidate/RevalidateDirective" {
}
declare module "ng-weekly-scheduler/revalidate/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/zoom/ZoomService" {
}
declare module "ng-weekly-scheduler/scroll/ScrollService" {
}
declare module "ng-weekly-scheduler/schedule-area-container/schedule-area-container" {
}
declare module "ng-weekly-scheduler/schedule-area-container/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/schedule-validator/ScheduleCountValidatorService" {
}
declare module "ng-weekly-scheduler/schedule-count/ScheduleCountDirective" {
}
declare module "ng-weekly-scheduler/schedule-count/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/schedule-validator/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/scroll/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/time/SecondsAsTextFilter" {
}
declare module "ng-weekly-scheduler/time/TimeOfDayFilter" {
}
declare module "ng-weekly-scheduler/time/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/time-range/TimeRangeComponent" {
}
declare module "ng-weekly-scheduler/time-range/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/touch/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/weekly-scheduler-config/NullEndWidth" {
}
declare module "ng-weekly-scheduler/weekly-scheduler-config/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/weekly-scheduler/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/weekly-scheduler-item/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/weekly-scheduler-range/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/weekly-slot/weekly-slot" {
}
declare module "ng-weekly-scheduler/weekly-slot/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/value-normalization/module" {
    const _default: string;
    export default _default;
}
declare module "ng-weekly-scheduler/zoom/module" {
    const _default: string;
    export default _default;
}
declare module "index" {
    import './ng-weekly-scheduler.less';
    import { IWeeklySchedulerAdapter as WeeklySchedulerAdapter } from "ng-weekly-scheduler/adapter/IWeeklySchedulerAdapter";
    import { IWeeklySchedulerOptions as WeeklySchedulerOptions } from "ng-weekly-scheduler/weekly-scheduler-config/IWeeklySchedulerOptions";
    export namespace weeklyScheduler {
        type IWeeklySchedulerAdapter<TCustom, TValue> = WeeklySchedulerAdapter<TCustom, TValue>;
        type IWeeklySchedulerOptions<T> = WeeklySchedulerOptions<T>;
    }
}
