/** @internal */
export class ValueNormalizationService {
    static $name = 'brWeeklySchedulerValueNormalizationService';

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
