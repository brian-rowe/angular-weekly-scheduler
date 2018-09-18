/** @internal */
class DragService {
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

angular
    .module('br.weeklyScheduler')
    .service(DragService.$name, DragService);
