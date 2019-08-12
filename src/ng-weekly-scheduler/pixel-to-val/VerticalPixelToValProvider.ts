import { IPixelToValProvider } from './IPixelToValProvider';

export class VerticalPixelToValProvider implements IPixelToValProvider {
    getSize(element: Element) {
        return element.clientHeight;
    }
}
