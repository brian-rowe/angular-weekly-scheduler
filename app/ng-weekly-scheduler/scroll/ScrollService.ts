/** @internal */
class ScrollService {
    static $name = 'brWeeklySchedulerScrollService';

    static $inject = [
        'brWeeklySchedulerZoomService'
    ];

    private constructor(
        private zoomService: ZoomService
    ) {
    }

    public hijackScroll(element, delta) {
        element.addEventListener('mousewheel', (event: WheelEvent) => {
            event.preventDefault();
            event.stopPropagation();

            if (event.ctrlKey) {
                this.zoomService.zoomByScroll(element, event, delta);
            } else {
                if ((event.wheelDelta || event.detail) > 0) {
                    element.scrollLeft -= delta;
                } else {
                    element.scrollLeft += delta;
                }
            }

            return false;
        });
    }
}

angular
    .module('br.weeklyScheduler')
    .service(ScrollService.$name, ScrollService);