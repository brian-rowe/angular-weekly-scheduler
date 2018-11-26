/** @internal */
class NullEndWidth {
    static $name = 'brWeeklySchedulerNullEndWidth';

    static value = 7200; 
}

angular
    .module('br.weeklyScheduler')
    .constant(NullEndWidth.$name, NullEndWidth.value);
