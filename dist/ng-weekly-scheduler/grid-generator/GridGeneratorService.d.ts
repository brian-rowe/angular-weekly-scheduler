export declare class GridGeneratorService {
    static $name: string;
    private GRID_TEMPLATE;
    getGridTemplate(): JQLite;
    generateGrid(element: JQLite, tickCount: number, itemStrategy: (child: JQLite, iteration: number) => JQLite): JQLite;
    private generateGridItem(iteration, strategy);
}
