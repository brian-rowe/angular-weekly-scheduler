/** Defaults will be provided, but you can override these on a per-calendar basis if necessary */
export interface ScheduleCountOptions {
    /** The number of schedules allowed on each item. Null for no max */
    count: number;
    /** Whether you must have exactly that many schedules, or if "up to" is allowed */
    exact: boolean;
}
