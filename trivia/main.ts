import { TriviaController } from "./TriviaController";
import { loadFonts } from "../menu/fonts";
import { individualTrivia, TriviaEndings } from "./questions";

// Wait for the custom fonts before anything is drawn
export const ready = loadFonts().then(() => {
    const controller = new TriviaController(
        individualTrivia.shakespeare, // Full 20-question array
        TriviaEndings.shakespeare,    // Uses the real passingScore: 150
        {
            onReturn: (finalScore) => {
                console.log(`Returned to storyline with score: ${finalScore}`);
                const container = document.getElementById("container");
                if (container) {
                    container.innerHTML = `<p style="padding: 20px;">Storyline resumed! Final score: ${finalScore}</p>`;
                }
            },
        },
        "container",
        10
    );
    controller.start();
});
