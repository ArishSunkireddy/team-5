import { PoeController } from "./PoeController";
import { poeRounds } from "./rounds";
import { TriviaController } from "../trivia/TriviaController";
import { individualTrivia, TriviaEndings } from "../trivia/questions";
import { mountMenuReturn } from "../menu/mountMenuReturn";
import { loadFonts } from "../menu/fonts";
import { finishAuthor } from '../menu/progress';

mountMenuReturn();

function startTrivia(): void {
    const trivia = new TriviaController(
        individualTrivia.poe,      // Full 20-question array
        TriviaEndings.poe,         // Uses the real passingScore: 150
        {
            onReturn: (finalScore) => {
                console.log(`Returned to storyline with score: ${finalScore}`);
                finishAuthor("poe"); 
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
    // Poe's stage: the anagram rounds first, then the shared trivia
    const poe = new PoeController(
        poeRounds,                     // Five anagram rounds
        {
            onComplete: (solved) => {
                console.log(`Solved ${solved} of ${poeRounds.length} mysteries`);
                startTrivia();
            },
        },
        "container",
        3                              // Guesses per round
    );
    poe.start();
});
