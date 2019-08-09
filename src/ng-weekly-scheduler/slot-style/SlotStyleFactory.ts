import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { HorizontalSlotStyle } from './HorizontalSlotStyle';
import { ISlotStyle } from './ISlotStyle';
import { VerticalSlotStyle } from './VerticalSlotStyle';
import { SlotStyleService } from './SlotStyleService';

export class SlotStyleFactory {
    static $name = 'rrWeeklySchedulerSlotStyleFactory';

    static $inject = [
        SlotStyleService.$name
    ];

    constructor(
        private slotStyleService: SlotStyleService
    ) {
    }

    public getSlotStyle(config: IWeeklySchedulerConfig<any>, $element: angular.IAugmentedJQuery): ISlotStyle {
        var hmm = true;

        if (hmm) {
            return new VerticalSlotStyle(config, $element, this.slotStyleService);
        } else {
            return new HorizontalSlotStyle(config, $element, this.slotStyleService);
        }
    }
}
