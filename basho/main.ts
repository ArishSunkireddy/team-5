import { BashoController } from "./BashoController";
import { bashoPoems, BashoScreens } from "./poems";
import { TriviaController } from "../trivia/TriviaController";
import { individualTrivia, TriviaEndings } from "../trivia/questions";
import { mountMenuReturn } from "../menu/mountMenuReturn";
import { loadFonts } from "../menu/fonts";
import { finishAuthor } from "../menu/progress";

mountMenuReturn();

function startTrivia(): void {
    const trivia = new TriviaController(
        individualTrivia.basho,    // Full 20-question array
        TriviaEndings.basho,       // Uses the real passingScore: 150
        {
            onReturn: (finalScore) => {
                console.log(`Returned to storyline with score: ${finalScore}`);
                   finishAuthor("basho");
            },
        },
        "container",
        10
    );
    trivia.start();
}

// Wait for the custom fonts before anything is drawn (Konva won't redraw when they arrive).
// Exported so tests can wait for the game to start.
export const ready = loadFonts().then(() => {
    // Basho's stage: the haiku rounds first, then the shared trivia
    const basho = new BashoController(
        bashoPoems,                    // Three haiku, nine lines in total
        BashoScreens,                  // Briefing, win, lose, and farewell cards
        {
            onComplete: () => startTrivia(),
        },
        "container",
        3                              // Starting lives
    );
    basho.start();
});
