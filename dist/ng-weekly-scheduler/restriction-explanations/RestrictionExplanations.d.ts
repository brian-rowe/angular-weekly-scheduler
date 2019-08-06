import { ScheduleCountOptions } from '../schedule-count/ScheduleCountOptions';
/** Defaults will be provided, but you can override these on a per-calendar basis if necessary */
export interface RestrictionExplanations {
    fullCalendar: string;
    maxTimeSlot: (value: string) => string;
    minimumSeparation: (value: string) => string;
    monoSchedule: string;
    nullEnds: string;
    scheduleCount: (options: ScheduleCountOptions) => string;
}
