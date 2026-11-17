import { MenuController } from "./MenuController";
import { MenuModel } from "./MenuModel";
import { MenuView } from "./MenuView";

new MenuController(new MenuModel(), new MenuView("container")).start();
