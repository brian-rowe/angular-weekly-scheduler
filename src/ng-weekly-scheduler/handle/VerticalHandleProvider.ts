import { IHandleProvider } from './IHandleProvider';
import { CursorTrackerService } from '../cursor-tracker/CursorTrackerService';
import { TouchService } from '../touch/TouchService';

export class VerticalHandleProvider implements IHandleProvider {
    constructor(
        private cursorTrackerService: CursorTrackerService,
        private touchService: TouchService
    ) {
    }

    getCursorPosition() {
        return this.cursorTrackerService.getCursorPosition().y;
    }

    getPositionFromEvent(event) {
        return this.touchService.getPageY(event);
    }

    getStartHandleClass() {
        return 'top';
    }

    getEndHandleClass() {
        return 'bottom';
    }

    getSlotWrapperClass() {
        return 'flex-column';
    }
}
