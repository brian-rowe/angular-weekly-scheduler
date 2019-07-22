import * as angular from 'angular';
import { MouseTrackerService } from './MouseTrackerService';

export default angular
    .module('rr.weeklyScheduler.mouseTracker', [])
    .service(MouseTrackerService.$name, MouseTrackerService)
    .run([MouseTrackerService.$name, (mouseTrackerService: MouseTrackerService) => {
        mouseTrackerService.initialize();
    }])
    .name;
