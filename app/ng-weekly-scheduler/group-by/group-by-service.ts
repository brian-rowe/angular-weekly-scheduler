/**
 * We should be able to convert the schedules beforehand, pass just the schedules in and have this package build the items
 * This helps reduce code duplication in clients.
 * This is used as a substitute for lodash.groupBy to keep the footprint small 
 */

/** @internal */
class GroupService {
    static $name = 'groupService';

    groupSchedules(schedules: IWeeklySchedulerRange<any>[]): { [key: number]: IWeeklySchedulerRange<any>[] } {
        let seed: { [key: number]: IWeeklySchedulerRange<any>[] } = {};

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
    .module('weeklyScheduler')
    .service(GroupService.$name, GroupService);
