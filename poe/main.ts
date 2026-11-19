import { PoeController } from "./PoeController";
import { poeRounds } from "./rounds";
import { TriviaController } from "../trivia/TriviaController";
import { individualTrivia, TriviaEndings } from "../trivia/questions";
import { menuUrl } from "../menu/destinations";

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

function startTrivia(): void {
    const trivia = new TriviaController(
        individualTrivia.poe,      // Full 20-question array
        TriviaEndings.poe,         // Uses the real passingScore: 150
        {
            onReturn: (finalScore) => {
                console.log(`Returned to storyline with score: ${finalScore}`);
                const container = document.getElementById("container");
                if (container) {
                    window.location.href = menuUrl + "#play";
                }
            },
        },
        "container",
        10
    );
    trivia.start();
}

poe.start();
