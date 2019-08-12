import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { PixelToValProviderFactory } from './PixelToValProviderFactory';

export class PixelToValService {
    static $name = 'rrWeeklySchedulerPixelToValService';

    static $inject = [
        PixelToValProviderFactory.$name
    ];

    constructor(
        private pixelToValProviderFactory: PixelToValProviderFactory
    ) {
    }

    pixelToVal(config: IWeeklySchedulerConfig<any>, element: Element, pixel: number) {
        let provider = this.pixelToValProviderFactory.getPixelToValProvider(config);

        let percent = pixel / provider.getSize(element);

        let result = Math.floor(percent * (config.intervalCount) + 0.5) * config.interval;

        return result;
    }
}
