import * as angular from 'angular';
import { CursorTrackerService } from './CursorTrackerService';

export default angular
    .module('rr.weeklyScheduler.cursorTracker', [])
    .service(CursorTrackerService.$name, CursorTrackerService)
    .run([CursorTrackerService.$name, (cursorTrackerService: CursorTrackerService) => {
        cursorTrackerService.initialize();
    }])
    .name;
