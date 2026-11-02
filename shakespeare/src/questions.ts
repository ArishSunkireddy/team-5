export type QuizQuestion = {
  question: string;
  answers: string[];
  /** Index into `answers` of the right answer. */
  correct: number;
};

export const questions: QuizQuestion[] = [
  { question: "Where was Shakespeare born?", answers: ["London", "Stratford-upon-Avon", "Oxford"], correct: 1 },
  { question: "In what year was Shakespeare born?", answers: ["1564", "1588", "1616"], correct: 0 },
  { question: "What was Shakespeare's main profession?", answers: ["Explorer", "Playwright and actor", "Royal painter"], correct: 1 },
  { question: "Who did Shakespeare marry?", answers: ["Anne Hathaway", "Elizabeth Tudor", "Mary Sidney"], correct: 0 },
  { question: "Which theatre is closely associated with Shakespeare?", answers: ["The Globe", "The Apollo", "The Royal Albert Hall"], correct: 0 },
  { question: "Hamlet is the prince of which country?", answers: ["England", "Denmark", "Scotland"], correct: 1 },
  { question: "Which families feud in Romeo and Juliet?", answers: ["York and Lancaster", "Montague and Capulet", "Tudor and Stuart"], correct: 1 },
  { question: "Where is Macbeth mainly set?", answers: ["Scotland", "Italy", "France"], correct: 0 },
  { question: "Who is the villain in Othello?", answers: ["Prospero", "Iago", "Mercutio"], correct: 1 },
  { question: "How many daughters does King Lear have?", answers: ["Two", "Three", "Five"], correct: 1 },
  { question: "What date is Caesar warned about?", answers: ["The Ides of March", "May Day", "Twelfth Night"], correct: 0 },
  { question: "Who is the fairy king in A Midsummer Night's Dream?", answers: ["Oberon", "Puck", "Theseus"], correct: 0 },
  { question: "Who is the magician in The Tempest?", answers: ["Caliban", "Prospero", "Antonio"], correct: 1 },
  { question: "Who disguises herself as Cesario in Twelfth Night?", answers: ["Olivia", "Viola", "Portia"], correct: 1 },
  { question: "Who is the moneylender in The Merchant of Venice?", answers: ["Shylock", "Bassanio", "Lorenzo"], correct: 0 },
  { question: "How many sonnets are traditionally attributed to Shakespeare?", answers: ["54", "100", "154"], correct: 2 },
  { question: "What verse form did Shakespeare often use?", answers: ["Blank verse", "Haiku", "Limerick"], correct: 0 },
  { question: "Which play contains “To be, or not to be”?", answers: ["Hamlet", "Macbeth", "The Tempest"], correct: 0 },
  { question: "Who are the witty couple in Much Ado About Nothing?", answers: ["Beatrice and Benedick", "Romeo and Juliet", "Viola and Orsino"], correct: 0 },
  { question: "In what year did Shakespeare die?", answers: ["1599", "1616", "1642"], correct: 1 },
];
