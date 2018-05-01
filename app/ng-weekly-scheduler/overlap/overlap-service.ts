/** @internal */
class OverlapService {
    static $name = 'overlapService';

    getOverlapState(currentStart, currentEnd, otherStart, otherEnd): OverlapState {
        if (otherEnd >= currentEnd && otherStart <= currentStart) {
            return OverlapState.CurrentIsInsideOther;
        }

        if (currentEnd >= otherEnd && currentStart <= otherStart) {
            return OverlapState.CurrentCoversOther;
        }

        if (otherEnd >= currentStart && otherEnd <= currentEnd) {
            return OverlapState.OtherEndIsInsideCurrent;
        }

        if (otherStart >= currentStart && otherStart <= currentEnd) {
            return OverlapState.OtherStartIsInsideCurrent;
        }

        return OverlapState.NoOverlap;
    }
}

angular
    .module('weeklyScheduler')
    .service(OverlapService.$name, OverlapService);
