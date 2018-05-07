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
