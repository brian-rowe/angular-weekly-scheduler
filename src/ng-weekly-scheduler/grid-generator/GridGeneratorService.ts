import * as angular from 'angular';
import { IGridGeneratorElementStrategy } from '../grid-generator-element-strategy/IGridGeneratorElementStrategy';
import { VoidElementStrategy } from '../grid-generator-element-strategy/VoidElementStrategy';
import { StripedElementStrategy } from '../grid-generator-element-strategy/StripedElementStrategy';

export class GridGeneratorService {
    public static $name = 'rrWeeklySchedulerGridGeneratorService';
    private GRID_TEMPLATE = angular.element('<div class="grid-item"></div>');

    public getGridTemplate() {
        return this.GRID_TEMPLATE.clone();
    }

    public generateStripedGrid(element: JQLite, tickCount: number, itemStrategy: (child: JQLite, iteration: number) => JQLite) {
        return this.generateGrid(element, tickCount, itemStrategy, new StripedElementStrategy());
    }

    public generateGrid(element: JQLite, tickCount: number, itemStrategy: (child: JQLite, iteration: number) => JQLite, elementStrategy: IGridGeneratorElementStrategy = new VoidElementStrategy()) {
        elementStrategy.setup(element);

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
