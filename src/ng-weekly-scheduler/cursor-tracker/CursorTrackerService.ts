import { IPoint } from '../point/IPoint';

/** @internal */
export class CursorTrackerService {
    static $name = 'rrWeeklySchedulerCursorTrackerService';

    static $inject = ['$document'];

    private constructor(
        private $document: angular.IDocumentService
    ) {
    }

    private cursorPosition: IPoint;

    public initialize() {
        const eventName = 'mousemove touchmove';

        let event = this.setCursorPosition.bind(this);

        this.$document.unbind(eventName, event);
        this.$document.on(eventName, event);
    }

    public getCursorPosition() {
        return this.cursorPosition;
    }

    private setCursorPosition(event) {
        this.cursorPosition = { x: event.pageX, y: event.pageY };
    }
}
