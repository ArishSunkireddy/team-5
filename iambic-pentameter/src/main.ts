import { menuUrl } from "../../menu/destinations";
import { mountMenuReturn } from "../../menu/mountMenuReturn";
import { PoetryController } from "./PoetryController";
import "./index.css";

const fromWorksheet = new URLSearchParams(window.location.search).get("from") === "worksheet";
const unmountMenuReturn = mountMenuReturn();
const poetry = new PoetryController({
  onComplete: () =>
    fromWorksheet ? () => window.location.assign(menuUrl + "#worksheet") : undefined,
});
poetry.start();

if (import.meta.hot)
  import.meta.hot.dispose(() => {
    poetry.destroy();
    unmountMenuReturn();
  });
