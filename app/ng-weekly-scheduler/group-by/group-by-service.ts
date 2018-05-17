/**
 * We should be able to convert the schedules beforehand, pass just the schedules in and have this package build the items
 * This helps reduce code duplication in clients.
 * This is used as a substitute for lodash.groupBy to keep the footprint small 
 */

/** @internal */
class GroupService {
    static $name = 'brWeeklySchedulerGroupService';

    groupSchedules(schedules: br.weeklyScheduler.IWeeklySchedulerRange<any>[]): { [key: number]: br.weeklyScheduler.IWeeklySchedulerRange<any>[] } {
        let seed: { [key: number]: br.weeklyScheduler.IWeeklySchedulerRange<any>[] } = {};

        let result = schedules.reduce((reducer, currentSchedule, index, array) => {
            let key = currentSchedule.day;

            if (!reducer[key]) {
                reducer[key] = [];
            }

            reducer[key].push(currentSchedule);

            return reducer;
        }, seed);

        return result;
    }
}

angular
    .module('br.weeklyScheduler')
    .service(GroupService.$name, GroupService);
