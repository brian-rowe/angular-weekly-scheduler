class ScrollService {
    static $name = 'scrollService';

    public hijackScroll(element, delta) {
        element.addEventListener('mousewheel', (event: WheelEvent) => {
            event.preventDefault();
            event.stopPropagation();

            if (event.ctrlKey) {
                let style = element.querySelector('.schedule-area').style;
                let currentWidth = parseInt(style.width, 10);

                if ((event.wheelDelta || event.detail) > 0) {
                    style.width = (currentWidth + 2 * delta) + '%';
                } else {
                    let width = currentWidth - 2 * delta;
                    style.width = (width > 100 ? width : 100) + '%';
                }
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
