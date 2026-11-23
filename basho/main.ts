import { BashoController } from "./BashoController";
import { bashoPoems, BashoScreens } from "./poems";
import { TriviaController } from "../trivia/TriviaController";
import { individualTrivia, TriviaEndings } from "../trivia/questions";
import { mountMenuReturn } from "../menu/mountMenuReturn";
import { finishAuthor } from "../menu/progress";

mountMenuReturn();

// Bashō's stage: the haiku rounds first, then the shared trivia
const basho = new BashoController(
    bashoPoems,                    // Three haiku, nine lines in total
    BashoScreens,                  // Briefing, win, lose, and farewell cards
    {
        onComplete: () => startTrivia(),
    },
    "container",
    3                              // Starting lives
);

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

basho.start();
