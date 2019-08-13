import { IPoint } from '../point/IPoint';

/** @internal */
export class MouseTrackerService {
    static $name = 'rrWeeklySchedulerMouseTrackerService';

    static $inject = ['$document'];

    private constructor(
        private $document: angular.IDocumentService
    ) {
    }

    private mousePosition: IPoint;

    public initialize() {
        const eventName = 'mousemove touchmove';

        let event = this.setMousePosition.bind(this);

        this.$document.unbind(eventName, event);
        this.$document.on(eventName, event);
    }

    public getMousePosition() {
        return this.mousePosition;
    }

    private setMousePosition(event) {
        this.mousePosition = { x: event.pageX, y: event.pageY };
    }
}
