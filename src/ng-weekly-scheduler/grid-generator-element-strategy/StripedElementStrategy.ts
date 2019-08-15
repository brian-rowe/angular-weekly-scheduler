import { IGridGeneratorElementStrategy } from './IGridGeneratorElementStrategy';

export class StripedElementStrategy implements IGridGeneratorElementStrategy {
    setup(element: JQLite) {
        element.addClass('striped');
    }
}
