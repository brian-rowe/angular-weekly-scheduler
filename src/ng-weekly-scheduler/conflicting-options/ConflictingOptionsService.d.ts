import { IWeeklySchedulerOptions } from '../weekly-scheduler-config/IWeeklySchedulerOptions';
/** @internal */
export declare class ConflictingOptionsService {
    static $name: string;
    getConflictingOptions(options: IWeeklySchedulerOptions<any>): "" | "A nullEnds calendar has a maximum scheduleCount of 1" | "Options 'fullCalendar' & 'fillEmptyWithDefault' are mutually exclusive." | "If using option 'fillEmptyWithDefault', you must also provide 'defaultValue.'";
}
