export interface TriviaQuestion {
    question: string;
    options: string[];
    answer: string;
}

export type AuthorID = "poe" | "basho" | "shakespeare";

export const individualTrivia: Record<AuthorID, TriviaQuestion[]> = {
    poe: [
        {
            question: "Under what name was Poe's first published collection, Tamerlane and Other Poems, credited?",
            options: ["By a Bostonian", "The Midnight Poet", "Edgar Perry", "The Raven"],
            answer: "By a Bostonian",
        },
        {
            question: "In which American city was Edgar Allan Poe born?",
            options: ["Baltimore", "Richmond", "Boston", "Philadelphia"],
            answer: "Boston",
        },
        {
            question: "Which Poe story introduced the brilliant detective C. Auguste Dupin?",
            options: ["The Gold-Bug", "The Murders in the Rue Morgue", "The Black Cat", "The Purloined Letter"],
            answer: "The Murders in the Rue Morgue",
        },
        {
            question: "What was the name of Poe's wife and literary muse?",
            options: ["Lenore Poe", "Virginia Clemm", "Sarah Whitman", "Annabel Allan"],
            answer: "Virginia Clemm",
        },
        {
            question: "How old was Edgar Allan Poe when he died in 1849?",
            options: ["32", "40", "47", "55"],
            answer: "40",
        },
        {
            question: "What single word does the raven repeat in Poe's famous poem?",
            options: ["Forever", "Nevermore", "Lenore", "Remember"],
            answer: "Nevermore",
        },
        {
            question: "Who served as Poe's foster father after his mother died?",
            options: ["John Allan", "Rufus Griswold", "Thomas Clemm", "Henry Herring"],
            answer: "John Allan",
        },
        {
            question: "Which university did Poe attend briefly in 1826?",
            options: ["Harvard University", "Yale University", "University of Virginia", "West Point"],
            answer: "University of Virginia",
        },
        {
            question: "What name did Poe use when he enlisted in the United States Army?",
            options: ["Edgar A. Perry", "Arthur Gordon Pym", "William Wilson", "C. Auguste Dupin"],
            answer: "Edgar A. Perry",
        },
        {
            question: "Which literary tradition is Poe most closely associated with?",
            options: ["Pastoral comedy", "Gothic fiction", "Epic poetry", "Realism"],
            answer: "Gothic fiction",
        },
        {
            question: "Which newspaper first published 'The Raven' under Poe's name?",
            options: ["The New York Evening Mirror", "The Baltimore Sun", "The Boston Gazette", "The Richmond Times"],
            answer: "The New York Evening Mirror",
        },
        {
            question: "In 'The Fall of the House of Usher', what is the name of Roderick's sister?",   
            options: ["Lenore", "Ligeia", "Madeline", "Morella"],
            answer: "Madeline",
        },
        {
            question: "What historical institution imprisons the narrator of 'The Pit and the Pendulum'?",
            options: ["The Spanish Inquisition", "The Roman Senate", "The French Court", "The British Navy"],
            answer: "The Spanish Inquisition",
        },
        {
            question: "Who is sealed behind a brick wall in 'The Cask of Amontillado'?",
            options: ["Montresor", "Fortunato", "Dupin", "Prospero"],
            answer: "Fortunato",
        },
        {
            question: "What is Edgar Allan Poe's birth surname?",
            options: ["Allan", "Poe", "Clemm", "Arnold"],
            answer: "Poe",
        },
        {
            question: "In which city did Poe die under mysterious circumstances?",
            options: ["Boston", "New York", "Richmond", "Baltimore"],
            answer: "Baltimore",
        },
        {
            question: "Which Poe poem imitates sounds ranging from cheerful chimes to funeral tolls?",
            options: ["The Bells", "Ulalume", "To Helen", "A Dream Within a Dream"],
            answer: "The Bells",
        },
        {
            question: "Which essay explains Poe's method for composing 'The Raven'?",
            options: ["The Poetic Principle", "The Philosophy of Composition", "Eureka", "The Imp of the Perverse"],
            answer: "The Philosophy of Composition",
        },
        {
            question: "Which Richmond magazine employed Poe as an editor and critic?",
            options: ["Graham's Magazine", "The Broadway Journal", "Southern Literary Messenger", "Burton's Gentleman's Magazine"],
            answer: "Southern Literary Messenger",
        },
        {
            question: "What is the name of the prince in 'The Masque of the Red Death'?",
            options: ["Prince Prospero", "Prince Fortunato", "Prince Usher", "Prince Pluto"],
            answer: "Prince Prospero",
        },
    ],

    basho: [
        {
            question: "During which period of Japanese history did Matsuo Bashō live?",
            options: ["Edo period", "Heian period", "Meiji period", "Kamakura period"],
            answer: "Edo period",
        },
        {
            question: "What poetic form is Bashō most closely associated with?",
            options: ["Haiku", "Sonnet", "Epic", "Ode"],
            answer: "Haiku",
        },
        {
            question: "What was Bashō's birth name?",
            options: ["Matsuo Kinsaku", "Tokugawa Ieyasu", "Yosa Buson", "Kobayashi Issa"],
            answer: "Matsuo Kinsaku",
        },
        {
            question: "In which year was Bashō born?",
            options: ["1644", "1544", "1744", "1844"],
            answer: "1644",
        },
        {
            question: "The name 'Bashō' refers to which plant?",
            options: ["Banana plant", "Cherry tree", "Bamboo", "Plum tree"],
            answer: "Banana plant",
        },
        {
            question: "Which famous travel diary was written by Bashō?",
            options: ["The Narrow Road to the Deep North", "The Tale of Genji", "The Pillow Book", "Essays in Idleness"],
            answer: "The Narrow Road to the Deep North",
        },
        {
            question: "What creature jumps into the old pond in Bashō's best-known poem?",
            options: ["A frog", "A crane", "A carp", "A cicada"],
            answer: "A frog",
        },
        {
            question: "What sound follows the frog's jump in the old pond poem?",
            options: ["The sound of water", "A temple bell", "Rustling reeds", "Thunder"],
            answer: "The sound of water",
        },
        {
            question: "How many syllables are traditionally taught in an English-language haiku?",
            options: ["17", "14", "21", "12"],
            answer: "17",
        },
        {
            question: "What is the traditional English-language haiku syllable pattern?",
            options: ["5-7-5", "7-5-7", "4-4-4", "8-6-8"],
            answer: "5-7-5",
        },
        {
            question: "Bashō's poetry often draws its imagery from what source?",
            options: ["Nature and the seasons", "Courtroom debates", "Military strategy", "Trade accounts"],
            answer: "Nature and the seasons",
        },
        {
            question: "Before becoming a renowned poet, Bashō served in what role?",
            options: ["A samurai household servant", "A Buddhist abbot", "An imperial painter", "A shipbuilder"],
            answer: "A samurai household servant",
        },
        {
            question: "What Japanese term describes a seasonal word in haiku?",
            options: ["Kigo", "Kabuki", "Kana", "Koto"],
            answer: "Kigo",
        },
        {
            question: "What idea did Bashō seek by combining everyday scenes with spiritual depth?",
            options: ["Simplicity and insight", "Luxury and spectacle", "Political authority", "Strict realism alone"],
            answer: "Simplicity and insight",
        },
        {
            question: "Bashō traveled mainly to do what?",
            options: ["Observe, reflect, and write", "Command an army", "Collect taxes", "Study foreign law"],
            answer: "Observe, reflect, and write",
        },
        {
            question: "Which direction did Bashō's most famous journey take him from Edo?",
            options: ["North into rural Japan", "West across the sea", "South to Okinawa", "East to America"],
            answer: "North into rural Japan",
        },
        {
            question: "What was Edo later renamed?",
            options: ["Tokyo", "Kyoto", "Osaka", "Nara"],
            answer: "Tokyo",
        },
        {
            question: "In which year did Bashō die?",
            options: ["1694", "1594", "1794", "1894"],
            answer: "1694",
        },
        {
            question: "Which quality is central to Bashō's mature poetry?",
            options: ["Attention to fleeting moments", "Elaborate rhyme schemes", "Long heroic narratives", "Comic stage dialogue"],
            answer: "Attention to fleeting moments",
        },
        {
            question: "Which statement best describes Bashō's legacy?",
            options: ["He elevated haiku into a profound literary art", "He invented Japanese writing", "He founded the shogunate", "He translated the first Japanese novel"],
            answer: "He elevated haiku into a profound literary art",
        },
    ],

    shakespeare: [
        {
            question: "Where was Shakespeare born?",
            options: ["London", "Stratford-upon-Avon", "Oxford", "Canterbury"],
            answer: "Stratford-upon-Avon",
        },
        {
            question: "In what year was Shakespeare born?",
            options: ["1564", "1588", "1616", "1558"],
            answer: "1564",
        },
        {
            question: "What was Shakespeare's main profession?",
            options: ["Explorer", "Playwright and actor", "Royal painter", "Court musician"],
            answer: "Playwright and actor",
        },
        {
            question: "Who did Shakespeare marry?",
            options: ["Anne Hathaway", "Elizabeth Tudor", "Mary Sidney", "Margaret Hughes"],
            answer: "Anne Hathaway",
        },
        {
            question: "Which theatre is closely associated with Shakespeare?",
            options: ["The Globe", "The Apollo", "The Royal Albert Hall", "The Lyceum"],
            answer: "The Globe",
        },
        {
            question: "Hamlet is the prince of which country?",
            options: ["England", "Denmark", "Scotland", "Norway"],
            answer: "Denmark",
        },
        {
            question: "Which families feud in Romeo and Juliet?",
            options: ["York and Lancaster", "Montague and Capulet", "Tudor and Stuart", "Guelph and Ghibelline"],
            answer: "Montague and Capulet",
        },
        {
            question: "Where is Macbeth mainly set?",
            options: ["Scotland", "Italy", "France", "Ireland"],
            answer: "Scotland",
        },
        {
            question: "Who is the villain in Othello?",
            options: ["Prospero", "Iago", "Mercutio", "Cassio"],
            answer: "Iago",
        },
        {
            question: "How many daughters does King Lear have?",
            options: ["Two", "Three", "Five", "Four"],
            answer: "Three",
        },
        {
            question: "What date is Caesar warned about?",
            options: ["The Ides of March", "May Day", "Twelfth Night", "Michaelmas"],
            answer: "The Ides of March",
        },
        {
            question: "Who is the fairy king in A Midsummer Night's Dream?",
            options: ["Oberon", "Puck", "Theseus", "Bottom"],
            answer: "Oberon",
        },
        {
            question: "Who is the magician in The Tempest?",
            options: ["Caliban", "Prospero", "Antonio", "Ferdinand"],
            answer: "Prospero",
        },
        {
            question: "Who disguises herself as Cesario in Twelfth Night?",
            options: ["Olivia", "Viola", "Portia", "Rosalind"],
            answer: "Viola",
        },
        {
            question: "Who is the moneylender in The Merchant of Venice?",
            options: ["Shylock", "Bassanio", "Lorenzo", "Gratiano"],
            answer: "Shylock",
        },
        {
            question: "How many sonnets are traditionally attributed to Shakespeare?",
            options: ["54", "100", "154", "126"],
            answer: "154",
        },
        {
            question: "What verse form did Shakespeare often use?",
            options: ["Blank verse", "Haiku", "Limerick", "Free verse"],
            answer: "Blank verse",
        },
        {
            question: "Which play contains \"To be, or not to be\"?",
            options: ["Hamlet", "Macbeth", "The Tempest", "Othello"],
            answer: "Hamlet",
        },
        {
            question: "Who are the witty couple in Much Ado About Nothing?",
            options: ["Beatrice and Benedick", "Romeo and Juliet", "Viola and Orsino", "Katherina and Petruchio"],
            answer: "Beatrice and Benedick",
        },
        {
            question: "In what year did Shakespeare die?",
            options: ["1599", "1616", "1642", "1603"],
            answer: "1616",
        },
    ]
};