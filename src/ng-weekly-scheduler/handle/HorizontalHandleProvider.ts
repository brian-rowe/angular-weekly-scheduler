import { IHandleProvider } from './IHandleProvider';
import { TouchService } from '../touch/TouchService';
import { CursorTrackerService } from '../cursor-tracker/CursorTrackerService';

export class HorizontalHandleProvider implements IHandleProvider {
    constructor(
        private cursorTrackerService: CursorTrackerService,
        private touchService: TouchService
    ) {
    }

    getCursorPosition() {
        return this.cursorTrackerService.getCursorPosition().x;
    }

    getPositionFromEvent(event) {
        return event.pageX || this.touchService.getPageX(event);
    }

    getStartHandleClass() {
        return 'left';
    }

    getEndHandleClass() {
        return 'right';
    }

    getSlotWrapperClass() {
        return 'flex-row';
    }
}
