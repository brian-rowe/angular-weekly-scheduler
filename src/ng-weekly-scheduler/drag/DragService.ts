import { EndAdjusterService } from '../end-adjuster/EndAdjusterService';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { WeeklySchedulerRange } from '../weekly-scheduler-range/WeeklySchedulerRange';
import { WeeklySchedulerRangeFactory } from '../weekly-scheduler-range/WeeklySchedulerRangeFactory';
import { NullEndWidth } from '../weekly-scheduler-config/NullEndWidth';

/** @internal */
export class DragService {
    static $name = 'rrWeeklySchedulerDragService';

    static $inject = [
        EndAdjusterService.$name,
        NullEndWidth.$name,
        WeeklySchedulerRangeFactory.$name
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
