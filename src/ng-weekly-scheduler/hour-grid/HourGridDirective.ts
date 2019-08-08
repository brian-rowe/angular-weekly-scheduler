/**
 * Generates a grid row that shows the hours as labels
 */
import * as angular from 'angular';
import { WeeklySchedulerController } from '../weekly-scheduler/weekly-scheduler';
import { WeeklySchedulerEvents } from '../weekly-scheduler-config/WeeklySchedulerEvents';
import { GridGeneratorService } from '../grid-generator/GridGeneratorService';
import { HourTextService } from '../hour-text/HourTextService';

/** @internal */
export class HourGridDirective implements angular.IDirective {
    static $name = 'brHourGrid';

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

    private doGrid(scope, element) {
        this.gridGeneratorService.generateGrid(element, this.tickCount, this.createHourGenerationStrategy(scope));
    }

    private createHourGenerationStrategy(scope) {
        return (child, i) => {
            this.handleClickEvent(child, this.tickCount, i, scope);
            let hourText = this.hourTextService.generateHourText(i);
            child.text(hourText);
            return child;
        };
    }

    link = (scope, element, attrs, schedulerCtrl: WeeklySchedulerController) => {
        if (schedulerCtrl.config) {
            this.tickCount = schedulerCtrl.config.hourCount;
            this.doGrid(scope, element);
        }
    }

    constructor(
        private gridGeneratorService: GridGeneratorService,
        private hourTextService: HourTextService,
    ) {
    }

    static Factory() {
        let directive = (gridGeneratorService, hourTextService) =>{
            return new HourGridDirective(gridGeneratorService, hourTextService);
        }

        directive.$inject = [
            GridGeneratorService.$name,
            HourTextService.$name
        ];

        return directive;
    }
}
