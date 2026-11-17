import { MenuModel, type MenuItem } from "./MenuModel";
import { MenuView } from "./MenuView";

export class MenuController {
    constructor(private model: MenuModel, private view: MenuView) {}

    start(): void {
        // Games send players back to "<menu>#play" so they land on the story picker.
        this.model.screen = location.hash === "#play" ? "play" : "main";
        this.render();
    }

    private render(): void {
        const { screen, items, titles } = this.model;
        const placeholder = screen === "journal" ? "Coming soon" : undefined;
        this.view.render(titles[screen], items[screen], (item) => this.select(item), placeholder);
    }

    private select(item: MenuItem): void {
        if (item.href) {
        window.location.href = item.href;
        return;
        }
        if (item.screen) {
        this.model.screen = item.screen;
        history.replaceState(null, "", item.screen === "play" ? "#play" : location.pathname);
        this.render();
        }
    }
}