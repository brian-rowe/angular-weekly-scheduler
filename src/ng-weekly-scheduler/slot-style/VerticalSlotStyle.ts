import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { ISlotStyle } from './ISlotStyle';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { ValueNormalizationService } from '../value-normalization/ValueNormalizationService';
import { EndAdjusterService } from '../end-adjuster/EndAdjusterService';
import { SlotStyleService } from './SlotStyleService';

export class VerticalSlotStyle implements ISlotStyle {
    private element: Element;

    constructor(
        private config: IWeeklySchedulerConfig<any>,
        private $element: angular.IAugmentedJQuery,
        private nullEndWidth: number,
        private endAdjusterService: EndAdjusterService,
        private slotStyleService: SlotStyleService,
        private valueNormalizationService: ValueNormalizationService
    ) {
        this.element = this.$element[0];
    }

    getCss(schedule: IWeeklySchedulerRange<any>) {
        return {
            top: this.getSlotTop(schedule.start),
            bottom: this.getSlotBottom(schedule.start, schedule.end)
        };
    }

    private getSlotTop(start: number) {
        return this.getUnderlyingInterval(start).offsetTop + 'px';
    }

    private getSlotBottom(start: number, end: number) {
        // If there is a null end, place the end of the slot two hours away from the beginning.
        if (this.config.nullEnds && end === null) {
            end = start + this.nullEndWidth;
        }

        // An end of 0 should display allll the way to the right, up to the edge
        end = this.endAdjusterService.adjustEndForView(this.config, end);

        // We want the right side to go /up to/ the interval it represents, not cover it, so we must substract 1 interval
        let underlyingInterval = this.getUnderlyingInterval(end - this.config.interval);

        let offsetBottom = underlyingInterval.offsetTop + underlyingInterval.offsetHeight;

        let result = this.element.clientHeight - offsetBottom;

        return result + 'px';
    }

    private getUnderlyingInterval(val: number): HTMLElement {
        return this.slotStyleService.getUnderlyingInterval(this.config, this.element, val);
    }
};
