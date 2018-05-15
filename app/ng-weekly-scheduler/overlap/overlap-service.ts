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
