import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
/**
 * We should be able to convert the schedules beforehand, pass just the schedules in and have this package build the items
 * This helps reduce code duplication in clients.
 * This is used as a substitute for lodash.groupBy to keep the footprint small
 */
/** @internal */
export declare class GroupService {
    static $name: string;
    groupSchedules(schedules: IWeeklySchedulerRange<any>[]): {
        [key: number]: IWeeklySchedulerRange<any>[];
    };
}
