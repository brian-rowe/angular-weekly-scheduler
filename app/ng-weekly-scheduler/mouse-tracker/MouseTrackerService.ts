/** @internal */
class MouseTrackerService {
    static $name = 'brWeeklySchedulerMouseTrackerService';

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
        console.log(this.mousePosition.x);
        return this.mousePosition;
    }

    private setMousePosition(event) {
        this.mousePosition = { x: event.pageX, y: event.pageY };
        console.log(this.mousePosition.x);
    }
}

angular
    .module('br.weeklyScheduler')
    .service(MouseTrackerService.$name, MouseTrackerService)
    .run([MouseTrackerService.$name, (mouseTrackerService: MouseTrackerService) => {
        mouseTrackerService.initialize();
    }]);

