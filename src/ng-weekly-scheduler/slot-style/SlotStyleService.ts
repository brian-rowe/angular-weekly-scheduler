import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { ValueNormalizationService } from '../value-normalization/ValueNormalizationService';
import { NullEndWidth } from '../weekly-scheduler-config/NullEndWidth';
import { EndAdjusterService } from '../end-adjuster/EndAdjusterService';

export class SlotStyleService {
    static $name = 'rrWeeklySchedulerSlotStyleService'

    static $inject = [
        EndAdjusterService.$name,
        NullEndWidth.$name,
        ValueNormalizationService.$name
    ];

    constructor(
        private endAdjusterService: EndAdjusterService,
        private nullEndWidth: number,
        private valueNormalizationService: ValueNormalizationService
    ) {
    }


    public getSlotStart(config: IWeeklySchedulerConfig<any>, element: Element, start: number, offsetStrategy: (interval: HTMLElement) => number) {
        let underlyingInterval = this.getUnderlyingInterval(config, element, start);
        let offset = offsetStrategy(underlyingInterval);

        return offset + 'px';
    }

    public getSlotEnd(config: IWeeklySchedulerConfig<any>, element: Element, start: number, end: number, strategy: (interval: HTMLElement) => number) {
        // If there is a null end, place the end of the slot two hours away from the beginning.
        if (config.nullEnds && end === null) {
            end = start + this.nullEndWidth;
        }
    
        // An end of 0 should display allll the way to the right, up to the edge
        end = this.endAdjusterService.adjustEndForView(config, end);
    
        // We want the right side to go /up to/ the interval it represents, not cover it, so we must substract 1 interval
        let underlyingInterval = this.getUnderlyingInterval(config, element, end - config.interval);
    
        return strategy(underlyingInterval) + 'px';
    }

    /**
     * This relies on the html structure having the grid and the multislider
     * under the same div.
     */
    public getUnderlyingInterval(config: IWeeklySchedulerConfig<any>, element: Element, val: number): HTMLElement {
        val = this.normalizeIntervalValue(config, val);

        return element.parentElement.querySelector(`[rel='${val}']`);
    }

    private normalizeIntervalValue(config: IWeeklySchedulerConfig<any>, value: number) {
        // There is no interval beyond the last rendered interval -- the last actual interval will not render with a "rel" value
        let lastRendered = config.maxValue - config.interval;

        return this.valueNormalizationService.normalizeValue(value, 0, lastRendered);
    }
}
