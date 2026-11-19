import { returnToMenu } from "./returnToMenu";
import "./menuReturn.css";

// Keep native keyboard-accessible navigation outside Konva's replaceable container.
export function mountMenuReturn(): () => void {
  const navigation = document.createElement("nav");
  navigation.className = "game-menu-return";
  navigation.setAttribute("aria-label", "Game navigation");
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Return to Main Menu";
  button.addEventListener("click", returnToMenu);
  navigation.append(button);
  document.body.append(navigation);
  return () => {
    button.removeEventListener("click", returnToMenu);
    navigation.remove();
  };
}
