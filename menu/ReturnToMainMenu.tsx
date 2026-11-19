import { returnToMenu } from "./returnToMenu";
import "./menuReturn.css";

export default function ReturnToMainMenu() {
  return (
    <nav className="game-menu-return" aria-label="Game navigation">
      <button type="button" onClick={returnToMenu}>Return to Main Menu</button>
    </nav>
  );
}
