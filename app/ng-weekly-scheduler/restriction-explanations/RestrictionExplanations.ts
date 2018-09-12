namespace br.weeklyScheduler {
    /** Defaults will be provided, but you can override these on a per-calendar basis if necessary */
    export interface RestrictionExplanations {
        fullCalendar: string;
        maxTimeSlot: (value: string) => string;
        monoSchedule: string;
        nullEnds: string;
    }
}
