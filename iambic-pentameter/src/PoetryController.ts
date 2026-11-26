import { PoetryModel } from "./PoetryModel";
import { PoetryView } from "./PoetryView";
import type { GameAction } from "./game/state";

export interface PoetryControl {
  // A worksheet launch supplies a return action. A standalone game can replay.
  onComplete(score: number): (() => void) | void;
}

export class PoetryController {
  private model = new PoetryModel();
  private view: PoetryView;
  private worksheetReturn: (() => void) | void = undefined;
  private destroyed = false;

  constructor(
    private control: PoetryControl,
    containerID = "container",
  ) {
    this.view = new PoetryView((action) => this.handle(action), containerID);
  }

  start(): void {
    if (!this.destroyed) this.render();
  }

  private handle(action: GameAction | { type: "finish" }): void {
    if (this.destroyed) return;
    if (action.type === "finish") {
      if (this.model.getRoundInfo().screen !== "final") return;
      if (this.worksheetReturn) {
        this.worksheetReturn();
        return;
      }
      action = { type: "restart" };
    }
    if (!this.model.apply(action)) return;
    const info = this.model.getRoundInfo();
    if (info.screen === "final") this.worksheetReturn = this.control.onComplete(info.score);
    else this.worksheetReturn = undefined;
    this.render();
  }

  private render(): void {
    this.view.render(
      this.model.getRoundInfo(),
      this.worksheetReturn ? "Return to Worksheet" : "Play Again",
    );
  }

  destroy(): void {
    this.destroyed = true;
    this.view.destroy();
  }
}
