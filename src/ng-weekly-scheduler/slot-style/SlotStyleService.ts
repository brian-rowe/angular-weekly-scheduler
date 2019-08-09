import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { ValueNormalizationService } from '../value-normalization/ValueNormalizationService';

export class SlotStyleService {
    static $name = 'rrWeeklySchedulerSlotStyleService'

    static $inject = [ValueNormalizationService.$name];

    constructor(
        private valueNormalizationService: ValueNormalizationService
    ) {
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
