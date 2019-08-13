import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { WeeklySchedulerRange } from '../weekly-scheduler-range/WeeklySchedulerRange';

/** When using the 'fillEmptyWithDefault' option, this service will be used to delete the default schedules for correct display on the calendar */
/** @internal */
export class PurgeDefaultService {
    static $name = 'rrWeeklySchedulerPurgeDefaultService';

    purge(schedules: WeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): WeeklySchedulerRange<any>[] {
        let lastIndex = schedules.length - 1;

        // loop in reverse to avoid messing up indices as we go
        for (let i = lastIndex; i >= 0; i--) {
            if (schedules[i].value === config.defaultValue) {
                schedules.splice(i, 1);
            }
        }

        return schedules;
    }
}
