/** Ahhahhahh! Fighter of the NightMap! */
/** @internal */
class DayMap {
    static $name = 'brWeeklySchedulerDayMap';
    
    static value = {
        [br.weeklyScheduler.Days.Monday]: 'Mon',
        [br.weeklyScheduler.Days.Tuesday]: 'Tue',
        [br.weeklyScheduler.Days.Wednesday]: 'Wed',
        [br.weeklyScheduler.Days.Thursday]: 'Thur',
        [br.weeklyScheduler.Days.Friday]: 'Fri',
        [br.weeklyScheduler.Days.Saturday]: 'Sat',
        [br.weeklyScheduler.Days.Sunday]: 'Sun' 
    }
}

angular
    .module('br.weeklyScheduler')
    .constant(DayMap.$name, DayMap.value);
