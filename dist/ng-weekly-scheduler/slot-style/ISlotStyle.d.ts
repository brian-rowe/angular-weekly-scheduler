import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
export interface ISlotStyle {
    getCss(schedule: IWeeklySchedulerRange<any>): any;
}
