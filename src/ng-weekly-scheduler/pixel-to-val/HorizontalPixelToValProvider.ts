import { IPixelToValProvider } from './IPixelToValProvider';

export class HorizontalPixelToValProvider implements IPixelToValProvider {
    getSize(element: Element) {
        return element.clientWidth;
    }
}
