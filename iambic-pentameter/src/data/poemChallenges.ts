// Challenge content and factory reused from the Figma Make export.
export type PhraseTile = {
  id: string;
  text: string;
};

export type IambicFoot = {
  unstressed: string;
  stressed: string;
};

export type PoemChallenge = {
  id: number;
  trailName: string;
  tiles: PhraseTile[];
  correctAnswer: string[];
  acceptedAnswers: string[][];
  feet: IambicFoot[];
  hint: string;
};

// Reviewed alternatives use zero-based phrase positions. Keep prepositional phrases
// and subject/verb/object groups intact; these are not arbitrary permutations.
const alternativeOrders: Record<number, number[][]> = {
  1: [[4, 0, 1, 2, 3], [0, 1, 4, 2, 3], [2, 3, 0, 1, 4], [4, 2, 3, 0, 1]],
  2: [[3, 4, 0, 1, 2]],
  3: [[3, 4, 0, 1, 2]],
  4: [[4, 1, 2, 3, 0], [1, 2, 3, 0, 4], [1, 2, 3, 4, 0], [0, 4, 1, 2, 3], [4, 0, 1, 2, 3]],
  5: [[3, 4, 0, 1, 2], [1, 2, 0, 3, 4], [0, 3, 4, 1, 2]],
  // The coordinated verbs require their existing order and complements.
  6: [],
  7: [[1, 2, 3, 4, 0], [3, 4, 1, 2, 0], [0, 3, 4, 1, 2], [3, 4, 0, 1, 2], [1, 2, 0, 3, 4]],
  8: [[3, 4, 0, 1, 2], [0, 3, 4, 1, 2]],
  9: [[4, 0, 1, 2, 3], [2, 3, 0, 1, 4], [0, 1, 4, 2, 3]],
  10: [],
};

const makeChallenge = (
  id: number,
  trailName: string,
  correctPhrases: string[],
  shuffledOrder: number[],
  feet: IambicFoot[],
  hint: string,
): PoemChallenge => {
  const orderedTiles = correctPhrases.map((text, index) => ({
    id: `round-${id}-phrase-${index + 1}`,
    text,
  }));

  return {
    id,
    trailName,
    tiles: shuffledOrder.map((index) => orderedTiles[index]),
    correctAnswer: orderedTiles.map((tile) => tile.id),
    acceptedAnswers: [[0, 1, 2, 3, 4], ...alternativeOrders[id]].map(order => order.map(index => orderedTiles[index].id)),
    feet,
    hint,
  };
};

export const poemChallenges: PoemChallenge[] = [
  makeChallenge(
    1,
    'Moonlit Road',
    ['the moon', 'will rise', 'above', 'the hills', 'tonight'],
    [2, 4, 0, 3, 1],
    [
      { unstressed: 'the', stressed: 'MOON' },
      { unstressed: 'will', stressed: 'RISE' },
      { unstressed: 'a', stressed: 'BOVE' },
      { unstressed: 'the', stressed: 'HILLS' },
      { unstressed: 'to', stressed: 'NIGHT' },
    ],
    'Begin with what you can see in the night sky, and end with a word that tells when.',
  ),
  makeChallenge(
    2,
    'Starlit Plain',
    ['the stars', 'will guide', 'our steps', 'across', 'the plain'],
    [3, 1, 4, 0, 2],
    [
      { unstressed: 'the', stressed: 'STARS' },
      { unstressed: 'will', stressed: 'GUIDE' },
      { unstressed: 'our', stressed: 'STEPS' },
      { unstressed: 'a', stressed: 'CROSS' },
      { unstressed: 'the', stressed: 'PLAIN' },
    ],
    'Let the stars lead the action; the destination belongs at the end.',
  ),
  makeChallenge(
    3,
    'Golden Morning',
    ['the dawn', 'will paint', 'the clouds', 'with streaks', 'of gold'],
    [4, 2, 0, 3, 1],
    [
      { unstressed: 'the', stressed: 'DAWN' },
      { unstressed: 'will', stressed: 'PAINT' },
      { unstressed: 'the', stressed: 'CLOUDS' },
      { unstressed: 'with', stressed: 'STREAKS' },
      { unstressed: 'of', stressed: 'GOLD' },
    ],
    'Start with the morning subject, then choose what it does to the clouds.',
  ),
  makeChallenge(
    4,
    'Spring Meadow',
    ['in spring', 'the birds', 'will sing', 'their songs', 'at dawn'],
    [2, 0, 4, 1, 3],
    [
      { unstressed: 'in', stressed: 'SPRING' },
      { unstressed: 'the', stressed: 'BIRDS' },
      { unstressed: 'will', stressed: 'SING' },
      { unstressed: 'their', stressed: 'SONGS' },
      { unstressed: 'at', stressed: 'DAWN' },
    ],
    'Place the season first, followed by the singers, their action, and the time.',
  ),
  makeChallenge(
    5,
    'River Path',
    ['we walk', 'beside', 'the stream', 'at close', 'of day'],
    [1, 4, 2, 0, 3],
    [
      { unstressed: 'we', stressed: 'WALK' },
      { unstressed: 'be', stressed: 'SIDE' },
      { unstressed: 'the', stressed: 'STREAM' },
      { unstressed: 'at', stressed: 'CLOSE' },
      { unstressed: 'of', stressed: 'DAY' },
    ],
    'Begin with the travelers and their action; finish with the time of day.',
  ),
  makeChallenge(
    6,
    'Ancient Grove',
    ['the oak', 'will bend', 'but keep', 'its roots', 'below'],
    [3, 1, 4, 0, 2],
    [
      { unstressed: 'the', stressed: 'OAK' },
      { unstressed: 'will', stressed: 'BEND' },
      { unstressed: 'but', stressed: 'KEEP' },
      { unstressed: 'its', stressed: 'ROOTS' },
      { unstressed: 'be', stressed: 'LOW' },
    ],
    'The oak may move in the wind, but what does it keep beneath the ground?',
  ),
  makeChallenge(
    7,
    'Owl Wood',
    ['at night', 'the owl', 'will call', 'across', 'the woods'],
    [4, 2, 0, 3, 1],
    [
      { unstressed: 'at', stressed: 'NIGHT' },
      { unstressed: 'the', stressed: 'OWL' },
      { unstressed: 'will', stressed: 'CALL' },
      { unstressed: 'a', stressed: 'CROSS' },
      { unstressed: 'the', stressed: 'WOODS' },
    ],
    'Set the time first, then name the bird, its action, and where the sound travels.',
  ),
  makeChallenge(
    8,
    'Distant Village',
    ['we hear', 'the bells', 'resound', 'throughout', 'the night'],
    [2, 4, 1, 0, 3],
    [
      { unstressed: 'we', stressed: 'HEAR' },
      { unstressed: 'the', stressed: 'BELLS' },
      { unstressed: 're', stressed: 'SOUND' },
      { unstressed: 'through', stressed: 'OUT' },
      { unstressed: 'the', stressed: 'NIGHT' },
    ],
    'Start with the listeners, then the sound and how long it continues.',
  ),
  makeChallenge(
    9,
    'Rocky Shore',
    ['the waves', 'will break', 'against', 'the rocks', 'ashore'],
    [3, 0, 4, 1, 2],
    [
      { unstressed: 'the', stressed: 'WAVES' },
      { unstressed: 'will', stressed: 'BREAK' },
      { unstressed: 'a', stressed: 'GAINST' },
      { unstressed: 'the', stressed: 'ROCKS' },
      { unstressed: 'a', stressed: 'SHORE' },
    ],
    'Name the moving water first, then describe what it strikes and where.',
  ),
  makeChallenge(
    10,
    'Clearing Mist',
    ['the mist', 'will lift', 'and show', 'the road', 'ahead'],
    [2, 4, 0, 3, 1],
    [
      { unstressed: 'the', stressed: 'MIST' },
      { unstressed: 'will', stressed: 'LIFT' },
      { unstressed: 'and', stressed: 'SHOW' },
      { unstressed: 'the', stressed: 'ROAD' },
      { unstressed: 'a', stressed: 'HEAD' },
    ],
    'Begin with what blocks the view; once it lifts, what becomes visible?',
  ),
];
