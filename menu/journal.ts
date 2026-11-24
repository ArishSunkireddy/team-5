import type { Author } from "./progress";

// Everything the player can unlock about an author: a short worksheet entry for the
// story picker and a full notesheet for the journal. Edit freely; the menu lays out
// whatever text is here. (For now the facts mirror the trivia answers.)
export interface AuthorNotes {
  name: string;
  era: string;
  summary: string; // Small paragraph for the worksheet on the story picker
  facts: string[]; // One bullet each on the journal page
}

// Page order in the journal and row order on the worksheet (same order as the story picker)
export const journalOrder: readonly Author[] = ["basho", "poe", "shakespeare"];

export const authorNotes: Record<Author, AuthorNotes> = {
  basho: {
    name: "Matsuo Basho",
    era: "17th Century · Edo Japan",
    summary:
      "Master of the haiku. Born Matsuo Kinsaku in 1644, he traveled Japan and wrote The Narrow Road to the Deep North, turning fleeting moments of nature into profound poetry.",
    facts: [
      "Basho lived during the Edo period of Japanese history.",
      "He is the poet most closely associated with the haiku.",
      "His birth name was Matsuo Kinsaku.",
      "He was born in 1644.",
      "The name “Basho” refers to the banana plant.",
      "He wrote the famous travel diary The Narrow Road to the Deep North.",
      "In his best-known poem, a frog jumps into an old pond...",
      "...and the jump is followed by the sound of water.",
      "English-language haiku are traditionally taught with 17 syllables.",
      "Those syllables follow a 5-7-5 pattern.",
      "His imagery draws on nature and the seasons.",
      "Before becoming a renowned poet, he served in a samurai household.",
      "A kigo is a seasonal word in a haiku.",
      "He combined everyday scenes with spiritual depth, seeking simplicity and insight.",
      "He traveled mainly to observe, reflect, and write.",
      "In The Narrow Road to the Deep North, he traveled north from Edo into rural Japan.",
      "Edo was later renamed Tokyo.",
      "Basho died in 1694.",
      "His mature poetry pays close attention to fleeting moments.",
      "His legacy: he elevated the haiku into a profound literary art.",
    ],
  },
  poe: {
    name: "Edgar Allan Poe",
    era: "19th Century · United States",
    summary:
      "American master of Gothic fiction. Born in Boston, he wrote “The Raven” and introduced the detective C. Auguste Dupin before dying mysteriously in Baltimore in 1849.",
    facts: [
      "His first collection, Tamerlane and Other Poems, was credited only to “a Bostonian.”",
      "Poe was born in Boston.",
      "“The Murders in the Rue Morgue” introduced the detective C. Auguste Dupin.",
      "His wife and literary muse was Virginia Clemm.",
      "He died in 1849 at the age of 40.",
      "The raven in his most famous poem repeats a single word: “Nevermore.”",
      "After his mother died, John Allan became his foster father.",
      "He briefly attended the University of Virginia in 1826.",
      "He enlisted in the United States Army under the name Edgar A. Perry.",
      "He is most closely associated with Gothic fiction.",
      "“The Raven” was first published under his name in The New York Evening Mirror.",
      "In “The Fall of the House of Usher,” Roderick's sister is Madeline.",
      "The narrator of “The Pit and the Pendulum” is a prisoner of the Spanish Inquisition.",
      "In “The Cask of Amontillado,” Fortunato is sealed behind a brick wall.",
      "Poe was his birth surname; “Allan” came from his foster family.",
      "He died under mysterious circumstances in Baltimore.",
      "“The Bells” imitates sounds ranging from cheerful chimes to funeral tolls.",
      "His essay “The Philosophy of Composition” explains how he wrote “The Raven.”",
      "He worked as an editor and critic for the Southern Literary Messenger in Richmond.",
      "Prince Prospero hosts the doomed party in “The Masque of the Red Death.”",
    ],
  },
  shakespeare: {
    name: "William Shakespeare",
    era: "16th Century · England",
    summary:
      "Playwright and actor from Stratford-upon-Avon. His company performed at the Globe, and his plays and 154 sonnets, from Hamlet to Macbeth, are still performed today.",
    facts: [
      "Shakespeare was born in Stratford-upon-Avon.",
      "He was born in 1564.",
      "He worked as a playwright and an actor.",
      "He married Anne Hathaway.",
      "The Globe is the theatre most closely associated with him.",
      "Hamlet is the prince of Denmark.",
      "The Montagues and the Capulets feud in Romeo and Juliet.",
      "Macbeth is mainly set in Scotland.",
      "Iago is the villain in Othello.",
      "King Lear has three daughters.",
      "Julius Caesar is warned to beware the Ides of March.",
      "Oberon is the fairy king in A Midsummer Night's Dream.",
      "Prospero is the magician in The Tempest.",
      "In Twelfth Night, Viola disguises herself as Cesario.",
      "Shylock is the moneylender in The Merchant of Venice.",
      "154 sonnets are traditionally attributed to him.",
      "He often wrote in blank verse.",
      "“To be, or not to be” comes from Hamlet.",
      "Beatrice and Benedick are the witty couple in Much Ado About Nothing.",
      "Shakespeare died in 1616.",
    ],
  },
};
