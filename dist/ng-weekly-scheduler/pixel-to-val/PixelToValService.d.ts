import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { PixelToValProviderFactory } from './PixelToValProviderFactory';
export declare class PixelToValService {
    private pixelToValProviderFactory;
    static $name: string;
    static $inject: string[];
    constructor(pixelToValProviderFactory: PixelToValProviderFactory);
    pixelToVal(config: IWeeklySchedulerConfig<any>, element: Element, pixel: number): number;
}
