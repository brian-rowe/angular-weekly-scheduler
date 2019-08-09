/**
 * Generates a grid with the names of each day in the cell
 */

import * as angular from 'angular';
import { WeeklySchedulerController } from '../weekly-scheduler/weekly-scheduler';
import { WeeklySchedulerEvents } from '../weekly-scheduler-config/WeeklySchedulerEvents';
import { GridGeneratorService } from '../grid-generator/GridGeneratorService';
import { DayMap } from '../weekly-scheduler-config/DayMap';
import { IntervalGenerationService } from '../interval-generation/IntervalGenerationService';
import { TimeConstantsService } from '../time/TimeConstantsService';

/** @internal */
export class DayGridDirective implements angular.IDirective {
    static $name = 'brDayGrid';

    restrict = 'E';
    require = '^brWeeklyScheduler';

    private tickCount: number;

    private handleClickEvent(child, hourCount, idx, scope) {
        child.bind('click', function () {
            scope.$apply(() => {
                scope.$emit(WeeklySchedulerEvents.CLICK_ON_A_CELL, {
                    nbElements: hourCount,
                    idx: idx
                });
            });
        });
    }

    private generateDayText(day: number) {
        return this.dayMap[day];
    }

    private doGrid(scope, element, attrs) {
        this.gridGeneratorService.generateStripedGrid(element, this.tickCount, this.createDayGenerationStrategy(scope));
    }

    private createDayGenerationStrategy(scope) {
        return (child, i) => {
            this.handleClickEvent(child, this.tickCount, i, scope);
            let dayText = this.generateDayText(i);
            child.text(dayText);
            return child;
        };
    }

    link = (scope, element, attrs, schedulerCtrl: WeeklySchedulerController) => {
        if (schedulerCtrl.config) {
            this.tickCount = this.timeConstants.DAYS_IN_WEEK;
            this.doGrid(scope, element, attrs);
        }
    }

    constructor(
        private dayMap: DayMap,
        private gridGeneratorService: GridGeneratorService,
        private timeConstants: TimeConstantsService
    ) {
    }

    static Factory() {
        let directive = (dayMap, gridGeneratorService, timeConstants) => new DayGridDirective(dayMap, gridGeneratorService, timeConstants);

        directive.$inject = [DayMap.$name, GridGeneratorService.$name, TimeConstantsService.$name];

        return directive;
    }
}
