/** @internal */
class OverlapService {
    static $name = 'brWeeklySchedulerOverlapService';

    static $inject = [
        'brWeeklySchedulerEndAdjusterService'
    ];

    private constructor(
        private endAdjusterService: EndAdjusterService
    ) {
    }

    getOverlapState(config: IWeeklySchedulerConfig<any>, current: br.weeklyScheduler.IWeeklySchedulerRange<any>, other: br.weeklyScheduler.IWeeklySchedulerRange<any>): OverlapState {
        let currentStart = current.start;
        let currentEnd = this.endAdjusterService.adjustEndForView(config, current.end);

        let otherStart = other.start;
        let otherEnd = this.endAdjusterService.adjustEndForView(config, other.end);

        if (otherEnd >= currentEnd && otherStart <= currentStart) {
            return OverlapState.CurrentIsInsideOther;
        }

        if (currentEnd >= otherEnd && currentStart <= otherStart) {
            return OverlapState.CurrentCoversOther;
        }

        if (otherEnd > currentStart && otherEnd <= currentEnd) {
            return OverlapState.OtherEndIsInsideCurrent;
        }

        if (otherStart >= currentStart && otherStart < currentEnd) {
            return OverlapState.OtherStartIsInsideCurrent;
        }

        if (otherEnd === currentStart && otherEnd <= currentEnd) {
            return OverlapState.OtherEndIsCurrentStart;
        }

        if (otherStart === currentEnd && otherStart <= currentEnd) {
            return OverlapState.OtherStartIsCurrentEnd;
        }

        return OverlapState.NoOverlap;
    }
}

angular
    .module('br.weeklyScheduler')
    .service(OverlapService.$name, OverlapService);
