import { MenuController } from "./MenuController";
import { MenuModel } from "./MenuModel";
import { MenuView } from "./MenuView";
import { loadFonts } from "./fonts";

// Wait for the custom font so the first screen isn't drawn in the fallback font
void loadFonts().then(() => {
  new MenuController(new MenuModel(), new MenuView("container")).start();
});
