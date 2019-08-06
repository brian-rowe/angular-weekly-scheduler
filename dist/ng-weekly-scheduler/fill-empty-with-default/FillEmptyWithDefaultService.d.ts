import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { WeeklySchedulerItem } from '../weekly-scheduler-item/WeeklySchedulerItem';
import { WeeklySchedulerRange } from '../weekly-scheduler-range/WeeklySchedulerRange';
/** When using the 'fillEmptyWithDefault' option, this service will be used to construct the correct calendar for server submission */
/** @internal */
export declare class FillEmptyWithDefaultService {
    private endAdjusterService;
    private rangeFactory;
    static $name: string;
    static $inject: string[];
    private constructor();
    fill(item: WeeklySchedulerItem<any>, config: IWeeklySchedulerConfig<any>): WeeklySchedulerRange<any>[];
    private getEmptySchedule(item, config);
    private getEndSchedule(lastSchedule, config);
    private getStartSchedule(firstSchedule, config);
    private getFilledSchedulesForSingleSchedule(schedule, config);
    private getFilledSchedules(schedules, config);
    private getNewSchedule(currentSchedule, nextSchedule, config);
    private getNullEndValue(schedule, config);
    private getSortedSchedules(schedules);
    private schedulesTouch(earlierSchedule, laterSchedule);
    private scheduleTouchesStart(schedule, config);
    private scheduleTouchesEnd(schedule, config);
    private shouldFillNullEnd(schedule, config);
}
