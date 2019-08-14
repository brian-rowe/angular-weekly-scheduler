import { ISlotStyle } from './ISlotStyle';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { SlotStyleService } from './SlotStyleService';
import { IRange } from '../range/IRange';

export class VerticalSlotStyle implements ISlotStyle {
    private element: Element;

    constructor(
        private config: IWeeklySchedulerConfig<any>,
        private $element: angular.IAugmentedJQuery,
        private slotStyleService: SlotStyleService
    ) {
        this.element = this.$element[0];
    }

    getCss(schedule: IRange) {
        return {
            top: this.getSlotTop(schedule.start),
            bottom: this.getSlotBottom(schedule.start, schedule.end)
        };
    }

    private getSlotTop(start: number) {
        return this.slotStyleService.getSlotStart(this.config, this.element, start, interval => interval.offsetTop);
    }

    private getSlotBottom(start: number, end: number) {
        return this.slotStyleService.getSlotEnd(this.config, this.element, start, end, interval => {
            return this.element.clientHeight - (interval.offsetTop + interval.offsetHeight);
        });
    }
};
