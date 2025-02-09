import { SidebarElement } from './sidebarelement';

export class TextElement extends SidebarElement {

    constructor(container: HTMLElement, title: string, content: string) {
        super(container);
        this.title.innerHTML = title;
        this.contentContainer.innerHTML = content;
    }

}