// tests/shakespeare-thorough.test.ts
import { describe, it, expect, beforeEach } from 'vitest';

// ---------------------------------------------------------
// 1. DATA INTEGRITY & CONFIGURATION TESTS
// (Proves that your story content, choices, and text nodes are complete)
// ---------------------------------------------------------
import shakespeareStory from '../shakespeare/storyData.json'; // Adjust path to match your actual data file

describe('Shakespeare Stage - Data Integrity', () => {
  it('should contain valid story nodes and non-empty dialogue text', () => {
    expect(shakespeareStory).toBeDefined();
    expect(shakespeareStory.nodes).toBeInstanceOf(Array);
    expect(shakespeareStory.nodes.length).toBeGreaterThan(0);

    // Verify every story node has required properties
    shakespeareStory.nodes.forEach((node: any) => {
      expect(node.id).toBeDefined();
      expect(node.text).toBeTruthy(); // Text cannot be empty
      expect(node.choices).toBeInstanceOf(Array);
    });
  });

  it('should ensure all choice links point to valid existing node IDs', () => {
    const nodeIds = new Set(shakespeareStory.nodes.map((n: any) => n.id));

    shakespeareStory.nodes.forEach((node: any) => {
      node.choices.forEach((choice: any) => {
        expect(nodeIds.has(choice.nextNodeId)).toBe(true); // Prevents broken story paths
      });
    });
  });
});

// ---------------------------------------------------------
// 2. GAME STATE & CHOICE LOGIC TESTS
// (Proves that player decisions alter game state, inventory, or scores properly)
// ---------------------------------------------------------
import { gameReducer, initialGameState } from '../shakespeare/gameLogic'; // Adjust path to your logic file

describe('Shakespeare Stage - State & Choice Engine', () => {
  let state: any;

  beforeEach(() => {
    state = { ...initialGameState };
  });

  it('should initialize with correct default stats', () => {
    expect(state.currentLocation).toBe('elsinore_castle');
    expect(state.playerHealth).toBe(100);
    expect(state.inventory).toEqual([]);
  });

  it('should update player inventory and location upon picking an item choice', () => {
    const action = { type: 'MAKE_CHOICE', choiceId: 'take_dagger' };
    const nextState = gameReducer(state, action);

    expect(nextState.inventory).toContain('dagger');
    expect(nextState.currentLocation).toBe('courtyard');
  });

  it('should deduct health or score on negative narrative choices', () => {
    const action = { type: 'MAKE_CHOICE', choiceId: 'insult_king' };
    const nextState = gameReducer(state, action);

    expect(nextState.playerHealth).toBeLessThan(100);
  });

  it('should handle invalid or malformed actions gracefully without crashing', () => {
    const action = { type: 'MAKE_CHOICE', choiceId: 'non_existent_choice_999' };
    const nextState = gameReducer(state, action);

    // State should remain stable / unchanged on invalid inputs
    expect(nextState).toEqual(state);
  });
});
