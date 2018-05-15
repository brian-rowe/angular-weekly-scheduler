/** Ahhahhahh! Fighter of the NightMap! */
/** @internal */
class DayMap {
    static $name = 'brWeeklySchedulerDayMap';
    
    static value = {
        0: 'Mon',
        1: 'Tue',
        2: 'Wed',
        3: 'Thur',
        4: 'Fri',
        5: 'Sat',
        6: 'Sun' 
    }
}

angular
    .module('br.weeklyScheduler')
    .constant(DayMap.$name, DayMap.value);
