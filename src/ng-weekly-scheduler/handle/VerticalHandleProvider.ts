import { IHandleProvider } from './IHandleProvider';
import { MouseTrackerService } from '../mouse-tracker/MouseTrackerService';
import { TouchService } from '../touch/TouchService';

export class VerticalHandleProvider implements IHandleProvider {
    constructor(
        private mouseTrackerService: MouseTrackerService,
        private touchService: TouchService
    ) {
    }

    getCursorPosition() {
        return this.mouseTrackerService.getMousePosition().y;
    }

    getPositionFromEvent(event) {
        return event.pageY || this.touchService.getPageY(event);
    }

    getStartHandleClass() {
        return 'top';
    }

    getEndHandleClass() {
        return 'bottom';
    }
}
