/** @internal */
class ScrollService {
    static $name = 'scrollService';

    static $inject = [
        'zoomService'
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
    .module('weeklyScheduler')
    .service(ScrollService.$name, ScrollService);
