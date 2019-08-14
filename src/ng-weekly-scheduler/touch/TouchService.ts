import { IPoint } from '../point/IPoint';

/** @internal */
export class TouchService {
    static $name = 'rrWeeklySchedulerTouchService';

    private getTouches(event: any): any { // todo
        if (event.originalEvent) {
            if (event.originalEvent.touches && event.originalEvent.touches.length) {
                return event.originalEvent.touches;
            } else if (event.originalEvent.changedTouches && event.originalEvent.changedTouches.length) {
                return event.originalEvent.changedTouches;
            }
        }

        if (!event.touches) {
            event.touches = [event.originalEvent];
        }

        return event.touches;
    }

    public getPoint(event: any): IPoint {
       return {
            x: this.getPageX(event),
            y: this.getPageY(event)
        };
    }

    public getPageX(event: any): number {
        let touches = this.getTouches(event);

        if (touches && touches.length && touches[0]) {
            return touches[0].pageX;
        }

        return null;
    }
    
    public getPageY(event: any): number {
        let touches = this.getTouches(event);

        if (touches && touches.length && touches[0]) {
            return touches[0].pageY;
        }

        return null;
    }
}
