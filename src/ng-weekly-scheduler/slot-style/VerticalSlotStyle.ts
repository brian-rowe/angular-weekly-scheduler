import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { ISlotStyle } from './ISlotStyle';

export class VerticalSlotStyle implements ISlotStyle {
    getCss(schedule: IWeeklySchedulerRange<any>) {
        return {
            backgroundColor: '#F00'
        };
    }
};
