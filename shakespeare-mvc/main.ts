import { ShakespeareController } from "./ShakespeareController";
import { storyRounds, prologueCards, farewellCard } from "./story";
import { TriviaController } from "../trivia/TriviaController";
import { individualTrivia, TriviaEndings } from "../trivia/questions";
import { mountMenuReturn } from "../menu/mountMenuReturn";
import { menuUrl } from "../menu/destinations";

mountMenuReturn();

// Shakespeare's stage: the prologue and three story rounds first, then the shared trivia
const shakespeare = new ShakespeareController(
    storyRounds,                   // 1588, 1599, and 1603
    prologueCards,                 // Worksheet, exploding clock, meeting Shakespeare, and title
    farewellCard,
    {
        onComplete: () => startTrivia(),
    },
    "container"
);

function startTrivia(): void {
    const trivia = new TriviaController(
        individualTrivia.shakespeare,  // Full 20-question array
        TriviaEndings.shakespeare,     // Uses the real passingScore: 150
        {
            onReturn: () => {
                window.location.href = menuUrl + "#play";
            },
        },
        "container",
        10,
        true                           // Shuffle the questions and answers each playthrough
    );
    trivia.start();
}

shakespeare.start();
