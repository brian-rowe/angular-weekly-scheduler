/// <reference types="angular" />
declare const enum Days {
    Monday = 0,
    Tuesday = 1,
    Wednesday = 2,
    Thursday = 3,
    Friday = 4,
    Saturday = 5,
    Sunday = 6,
}
interface IResizeServiceProvider extends angular.IServiceProvider {
    setCustomResizeEvents(events: string[]): any;
}
/**
 * Implement this on a client and then pass it in to the component.
 */
interface IWeeklySchedulerAdapter<TCustom, TValue> {
    /** Transform the data held within the component to the format you need it outside of the component. */
    getSnapshot(): TCustom[];
    /** This just needs to be defined in the class, we'll set it internally */
    items: IWeeklySchedulerItem<TValue>[];
    initialData: TCustom[];
}
interface IWeeklySchedulerItem<T> {
    day: Days;
    editable?: boolean;
    schedules: IWeeklySchedulerRange<T>[];
}
interface IWeeklySchedulerOptions<T> {
    nullEnds?: boolean;
    /** These classes will be applied directly to the buttons */
    buttonClasses?: string[];
    /** A function to return an item -- this is REQUIRED so that adapters will always be used for new items, even if they weren't passed in */
    createItem: (day: Days, schedules: IWeeklySchedulerRange<T>[]) => IWeeklySchedulerItem<T>;
    /** defaultValue should be assigned per set of options, not per item. Do not assign for no default */
    defaultValue?: T;
    /** A function to call when an item is clicked in order to bring up an editor for it */
    editSlot?: (schedule: IWeeklySchedulerRange<T>) => angular.IPromise<IWeeklySchedulerRange<T>>;
    /** If this is true, ALL slots in the calendar must be filled in order for it to be valid */
    fullCalendar?: boolean;
    /** If this is defined, a time slot will not be able to be more than this many minutes long */
    maxTimeSlot?: number;
    /** If this is true, the calendar will enforce that only one schedule per item is allowed */
    monoSchedule?: boolean;
    /** The number of minutes each division of the calendar should be -- values will snap to this */
    interval?: number;
    /** A function to call wen the save button is clicked */
    saveScheduler: () => angular.IPromise<any>;
}
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
    day: Days;
    start: number;
    end: number;
    value: T;
}
/** Converts custom model to WeeklySchedulerRange */
interface IWeeklySchedulerRangeAdapter<TCustom, TRange> {
    adapt(custom: TCustom[]): IWeeklySchedulerRange<TRange>[];
}
