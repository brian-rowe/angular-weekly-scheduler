import { Days } from '../weekly-scheduler-config/Days';

/** Ahhahhahh! Fighter of the NightMap! */
/** @internal */
export class DayMap {
    static $name = 'brWeeklySchedulerDayMap';
    
    static value = {
        [Days.Monday]: 'Mon',
        [Days.Tuesday]: 'Tue',
        [Days.Wednesday]: 'Wed',
        [Days.Thursday]: 'Thur',
        [Days.Friday]: 'Fri',
        [Days.Saturday]: 'Sat',
        [Days.Sunday]: 'Sun' 
    }
}
