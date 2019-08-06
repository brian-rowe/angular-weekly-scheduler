/// <reference types="angular" />
import * as angular from 'angular';
import { Days } from '../weekly-scheduler-config/Days';
import { IWeeklySchedulerItem } from '../weekly-scheduler-item/IWeeklySchedulerItem';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { RestrictionExplanations } from '../restriction-explanations/RestrictionExplanations';
import { ScheduleCountOptions } from '../schedule-count/ScheduleCountOptions';
import { OrientationOptions } from "../orientation/OrientationOptions";
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
    orientationOptions?: OrientationOptions;
    /** A function to call when the save button is clicked. If this is not passed, no save button will be present. */
    saveScheduler?: () => angular.IPromise<any>;
    /** Overrides for schedule count options, if necessary */
    scheduleCountOptions?: ScheduleCountOptions;
}
