import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { EndAdjusterService } from '../end-adjuster/EndAdjusterService';
import { ValueNormalizationService } from '../value-normalization/ValueNormalizationService';
import { NullEndWidth } from '../weekly-scheduler-config/NullEndWidth';
import { HorizontalSlotStyle } from './HorizontalSlotStyle';

export class SlotStyleFactory {
    static $name = 'rrWeeklySchedulerSlotStyleFactory';

    static $inject = [
        NullEndWidth.$name,
        EndAdjusterService.$name,
        ValueNormalizationService.$name
    ];

    constructor(
        private nullEndWidth: number,
        private endAdjusterService: EndAdjusterService,
        private valueNormalizationService: ValueNormalizationService
    ) {
    }

    public getSlotStyle(config: IWeeklySchedulerConfig<any>, $element: angular.IAugmentedJQuery) {
        return new HorizontalSlotStyle(config, $element, this.nullEndWidth, this.endAdjusterService, this.valueNormalizationService);
    }
}
