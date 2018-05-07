interface IWeeklySchedulerItem<T> {
    defaultValue: T;
    label: string;
    editable?: boolean;
    schedules: IWeeklySchedulerRange<T>[];
}
interface IWeeklySchedulerOptions {
    /** A function to call when an item is clicked in order to bring up an editor for it */
    editSlot?: (schedule: IWeeklySchedulerRange<any>) => void;
    /** If this is true, ALL slots in the calendar must be filled in order for it to be valid */
    fullCalendar?: boolean;
    /** If this is defined, a time slot will not be able to be more than this many minutes long */
    maxTimeSlot?: number;
    /** If this is true, the calendar will enforce that only one schedule per item is allowed */
    monoSchedule?: boolean;
    /** The number of minutes each division of the calendar should be -- values will snap to this */
    interval?: number;
}
interface IWeeklySchedulerRange<T> {
    /** A css class to apply */
    $class?: string;
    /** This will indicate whether the item is currently considered active to the UI */
    $isActive?: boolean;
    /** This will indicate whether the item is currently being edited by the user */
    $isEditing?: boolean;
    start: number;
    end: number;
    value: T;
}
