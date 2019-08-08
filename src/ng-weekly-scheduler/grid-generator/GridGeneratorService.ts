import * as angular from 'angular';

export class GridGeneratorService {
    public static $name = 'rrWeeklySchedulerGridGeneratorService';
    private GRID_TEMPLATE = angular.element('<div class="grid-item"></div>');

    public getGridTemplate() {
        return this.GRID_TEMPLATE.clone();
    }

    public generateGrid(element: JQLite, tickCount: number, itemStrategy: (child: JQLite, iteration: number) => JQLite) {
        element.addClass('striped');

        for (let i = 0; i < tickCount; i++) {
            var child = this.GRID_TEMPLATE.clone();
  
            child = this.generateGridItem(i, itemStrategy);
  
            element.append(child);
        }

        return element;
    }

    private generateGridItem(iteration: number, strategy: (child: JQLite, iteration: number) => JQLite): JQLite {
        var child = this.GRID_TEMPLATE.clone();

        return strategy(child, iteration);
    }
}
