import { MenuModel, type MenuItem } from "./MenuModel";
import type { MenuView } from "./MenuView";
import { absorbFinished, allMet, getMet, resetProgress, introSeen, markIntroSeen } from "./progress";
import { destinations } from "./destinations";
import { timeTravelIntroCards } from "../intro/introCards";

export class MenuController {
    // Only these three destinations trigger the intro (not destinations.iambic)
    private readonly authorHrefs: string[] = [
        destinations.basho,
        destinations.poe,
        destinations.shakespeare,
    ];

    constructor(private model: MenuModel, private view: MenuView) {}

    start(): void {
        const finished = absorbFinished();

        // The last author unlocks the worksheet. Poetry can return here without recording another finish.
        if ((finished || location.hash === "#worksheet") && allMet()) {
            history.replaceState(null, "", "#worksheet");
            this.view.renderEnd(() => {
                resetProgress();
                this.model.screen = "main";
                history.replaceState(null, "", location.pathname);
                this.render();
            }, () => {
                window.location.href = destinations.iambic + "?from=worksheet";
            });
            return;
        }

        // Games send players back to "<menu>#play" so they land on the story picker.
        this.model.screen = location.hash === "#play" ? "play" : "main";
        this.render();
    }

    private render(): void {
        const { screen, items, titles } = this.model;
        const met = getMet();

        if (screen === "journal") {
            const back = items.journal.find((item) => item.label === "Back")!;
            this.view.renderJournal(titles.journal, this.model.journalPage(met), {
                onPrev: () => this.turnPage(-1),
                onNext: () => this.turnPage(1),
                onBack: () => this.select(back),
            });
            return;
        }

        // The worksheet only appears on the story picker, next to the author buttons
        const worksheet = screen === "play" ? this.model.worksheet(met) : undefined;
        this.view.render(titles[screen], items[screen], (item) => this.select(item), worksheet);
    }

    private turnPage(step: -1 | 1): void {
        if (this.model.turnJournalPage(step)) {
            this.render();
        }
    }

    private select(item: MenuItem): void {
        if (item.href) {
            // On the first author click, play the intro cards, then navigate
            if (this.authorHrefs.includes(item.href) && !introSeen()) {
                const href = item.href;
                this.view.renderCards(timeTravelIntroCards, () => {
                    markIntroSeen();
                    window.location.href = href;
                });
                return;
            }
            window.location.href = item.href;
            return;
        }
        if (item.screen) {
            if (item.screen === "journal") {
                this.model.openJournal(getMet());
            }
            this.model.screen = item.screen;
            history.replaceState(null, "", item.screen === "play" ? "#play" : location.pathname);
            this.render();
        }
    }
}
