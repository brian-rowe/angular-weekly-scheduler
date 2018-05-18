namespace br.weeklyScheduler {
    export interface IWeeklySchedulerOptions<T> {
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

        /** If this is true, ALL slots in the calendar must be filled in order for it to be valid */
        fullCalendar?: boolean;

        /** If this is defined, a time slot will not be able to be more than this many minutes long */
        maxTimeSlot?: number;

        /** If this is true, the calendar will enforce that only one schedule per item is allowed */
        monoSchedule?: boolean;
        
        /**
         * This function allows access back to the client scope when the scheduler changes. Use it to hook into angular forms
         * for setting $dirty or updating validation in cases where it is not desirable to save schedules individually.
         */
        onChange: (isValid: boolean) => void;

        /** The number of minutes each division of the calendar should be -- values will snap to this */
        interval?: number;

        /** A function to call wen the save button is clicked. If this is not passed, no save button will be present. */
        saveScheduler?: () => angular.IPromise<any>;
    }
}
