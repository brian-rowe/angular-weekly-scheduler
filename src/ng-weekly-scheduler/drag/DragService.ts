import { EndAdjusterService } from '../end-adjuster/EndAdjusterService';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { WeeklySchedulerRange } from '../weekly-scheduler-range/WeeklySchedulerRange';
import { WeeklySchedulerRangeFactory } from '../weekly-scheduler-range/WeeklySchedulerRangeFactory';

/** @internal */
export class DragService {
    static $name = 'brWeeklySchedulerDragService';

    static $inject = [
        'brWeeklySchedulerEndAdjusterService',
        'brWeeklySchedulerNullEndWidth',
        'brWeeklySchedulerRangeFactory'
    ];

    private constructor(
        private endAdjusterService: EndAdjusterService,
        private nullEndWidth: number,
        private rangeFactory: WeeklySchedulerRangeFactory
    ) {
    }

    public getDragRangeFromSchedule(config: IWeeklySchedulerConfig<any>, schedule: WeeklySchedulerRange<any>) {
        return this.rangeFactory.createRange(config, {
            day: schedule.day,
            start: schedule.start,
            end: config.nullEnds ?
                this.endAdjusterService.adjustEndForView(config, schedule.start + this.nullEndWidth) :
                this.endAdjusterService.adjustEndForView(config, schedule.end),
            value: schedule.value
        });
    }
}
