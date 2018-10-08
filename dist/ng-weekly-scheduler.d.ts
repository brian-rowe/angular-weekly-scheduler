/// <reference types="angular" />
declare class DemoItem implements br.weeklyScheduler.IWeeklySchedulerItem<boolean> {
    day: br.weeklyScheduler.Days;
    schedules: br.weeklyScheduler.IWeeklySchedulerRange<boolean>[];
    constructor(day: br.weeklyScheduler.Days, schedules: br.weeklyScheduler.IWeeklySchedulerRange<boolean>[]);
    readonly editable: boolean;
}
declare namespace br.weeklyScheduler {
    /**
     * Implement this on a client and then pass it in to the component.
     */
    interface IWeeklySchedulerAdapter<TCustom, TValue> {
        customModelToWeeklySchedulerRange(custom: TCustom): br.weeklyScheduler.IWeeklySchedulerRange<TValue>;
        /** Transform the data held within the component to the format you need it outside of the component. */
        getSnapshot(): TCustom[];
        /** This just needs to be defined in the class, we'll set it internally */
        items: IWeeklySchedulerItem<TValue>[];
        initialData: TCustom[];
    }
}
declare const enum DragMode {
    MOVE = 0,
    COPY = 1,
}
declare namespace br.weeklyScheduler {
    interface InvalidMessages {
        fullCalendarFillEmptyWithDefault: string;
        fillEmptyWithdefaultDefaultValue: string;
        generic: string;
    }
}
declare namespace br.weeklyScheduler {
    interface IResizeServiceProvider extends angular.IServiceProvider {
        setCustomResizeEvents(events: string[]): any;
    }
}
declare namespace br.weeklyScheduler {
    /** Defaults will be provided, but you can override these on a per-calendar basis if necessary */
    interface RestrictionExplanations {
        fullCalendar: string;
        maxTimeSlot: (value: string) => string;
        minimumSeparation: (value: string) => string;
        monoSchedule: string;
        nullEnds: string;
        scheduleCount: (options: ScheduleCountOptions) => string;
    }
}
declare namespace br.weeklyScheduler {
    /** Defaults will be provided, but you can override these on a per-calendar basis if necessary */
    interface ScheduleCountOptions {
        /** The number of schedules allowed on each item. Null for no max */
        count: number;
        /** Whether you must have exactly that many schedules, or if "up to" is allowed */
        exact: boolean;
    }
}
declare class MinimumSeparationValidatorService implements ValidatorService {
    static $name: string;
    readonly error: ValidationError;
    validate(schedules: br.weeklyScheduler.IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean;
}
declare class TouchService {
    static $name: string;
    getTouches(event: any): any;
    getPageX(event: any): number;
}
declare class ValueNormalizationService {
    static $name: string;
    normalizeValue(value: number, min: number, max: number): number;
}
declare namespace br.weeklyScheduler {
    const enum Days {
        Monday = 0,
        Tuesday = 1,
        Wednesday = 2,
        Thursday = 3,
        Friday = 4,
        Saturday = 5,
        Sunday = 6,
    }
}
declare namespace br.weeklyScheduler {
    interface IWeeklySchedulerOptions<T> {
        /** If this is true schedules will be allowed & required to have no set end time */
        nullEnds?: boolean;
        /** These classes will be applied directly to the buttons */
        buttonClasses?: string[];
        /** A function to return an item -- this is REQUIRED so that adapters will always be used for new items, even if they weren't passed in */
        createItem: (day: br.weeklyScheduler.Days, schedules: IWeeklySchedulerRange<T>[]) => br.weeklyScheduler.IWeeklySchedulerItem<T>;
        /** defaultValue should be assigned per set of options, not per item. Do not assign for no default */
        defaultValue?: T;
        /** A function to call when an item is clicked in order to bring up an editor for it */
        editSlot?: (schedule: IWeeklySchedulerRange<T>) => angular.IPromise<IWeeklySchedulerRange<T>>;
        /** Whether to fill empty spaces with the default value */
        fillEmptyWithDefault?: boolean;
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
        /** The number of minutes each division of the calendar should be -- values will snap to this */
        interval?: number;
        /** Overrides for restriction explanations, if necessary */
        restrictionExplanations?: RestrictionExplanations;
        /** A function to call when the save button is clicked. If this is not passed, no save button will be present. */
        saveScheduler?: () => angular.IPromise<any>;
        /** Overrides for schedule count options, if necessary */
        scheduleCountOptions?: ScheduleCountOptions;
    }
}
declare namespace br.weeklyScheduler {
    interface IWeeklySchedulerItem<T> {
        day: br.weeklyScheduler.Days;
        editable?: boolean;
        schedules: IWeeklySchedulerRange<T>[];
    }
}
declare namespace br.weeklyScheduler {
    interface IWeeklySchedulerRange<T> {
        /** A css class to apply */
        $class?: string;
        /** This will indicate whether the item is currently considered active to the UI */
        $isActive?: boolean;
        /** If this is set to true while the user is editing an existing item, it will be removed when the edit promise is resolved */
        $isDeleting?: boolean;
        /** This will indicate whether the item is currently being edited by the user */
        $isEditing?: boolean;
        /** Not strictly necessary but makes things a whooole lot easier */
        day: br.weeklyScheduler.Days;
        start: number;
        end: number;
        value: T;
        editable?: boolean;
    }
}
