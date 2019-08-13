/** @internal */
export class ValueNormalizationService {
    static $name = 'rrWeeklySchedulerValueNormalizationService';

    public normalizeValue(value: number, min: number, max: number) {
        if (value < min) {
            return min;
        }

        if (value > max) {
            return max;
        }

        return value;
    }
}
