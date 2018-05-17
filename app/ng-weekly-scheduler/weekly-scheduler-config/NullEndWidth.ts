/** @internal */
class NullEndWidth {
    static $name = 'brWeeklySchedulerNullEndWidth';

    static value = 120;
}

angular
    .module('br.weeklyScheduler')
    .constant(NullEndWidth.$name, NullEndWidth.value);
