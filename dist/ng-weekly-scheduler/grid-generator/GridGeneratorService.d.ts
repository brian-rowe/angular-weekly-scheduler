import { IGridGeneratorElementStrategy } from '../grid-generator-element-strategy/IGridGeneratorElementStrategy';
export declare class GridGeneratorService {
    static $name: string;
    private GRID_TEMPLATE;
    getGridTemplate(): JQLite;
    generateStripedGrid(element: JQLite, tickCount: number, itemStrategy: (child: JQLite, iteration: number) => JQLite): JQLite;
    generateGrid(element: JQLite, tickCount: number, itemStrategy: (child: JQLite, iteration: number) => JQLite, elementStrategy?: IGridGeneratorElementStrategy): JQLite;
    private generateGridItem(iteration, strategy);
}
