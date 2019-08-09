import { IHandleProvider } from './IHandleProvider';
import { TouchService } from '../touch/TouchService';
import { MouseTrackerService } from '../mouse-tracker/MouseTrackerService';

export class HorizontalHandleProvider implements IHandleProvider {
    constructor(
        private mouseTrackerService: MouseTrackerService,
        private touchService: TouchService
    ) {
    }

    getCursorPosition() {
        return this.mouseTrackerService.getMousePosition().x;
    }

    getPositionFromEvent(event) {
        return event.pageX || this.touchService.getPageX(event);
    }
}
