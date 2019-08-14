import { CursorTrackerService } from '../cursor-tracker/CursorTrackerService';
import { TouchService } from '../touch/TouchService';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { HorizontalHandleProvider } from './HorizontalHandleProvider';
import { VerticalHandleProvider } from './VerticalHandleProvider';

export class HandleProviderFactory {
    static $name = 'rrWeeklySchedulerHandleProviderFactory';

    static $inject = [
        CursorTrackerService.$name,
        TouchService.$name
    ];

    constructor(
        private cursorTrackerService: CursorTrackerService,
        private touchService: TouchService
    ) {
    }

    public getHandleProvider(config: IWeeklySchedulerConfig<any>) {
        if (config.orientation === 'horizontal') {
            return new HorizontalHandleProvider(this.cursorTrackerService, this.touchService);
        } else {
            return new VerticalHandleProvider(this.cursorTrackerService, this.touchService);
        }
    };
}
