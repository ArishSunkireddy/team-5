import { expect, test } from '@playwright/test';
import { poemChallenges } from '../iambic-pentameter/src/data/poemChallenges';
import { targets } from './targets';

test('keyboard play preserves hints, submitted scansion, and the five-slot check gate', async ({ page }) => {
  const poetry = targets.find(target => target.workspace === 'iambic-pentameter')!;
  await page.goto('http://localhost:' + poetry.port);
  const button = (name: string) => page.getByRole('button', { name, exact: true });
  const activate = async (name: string) => {
    await button(name).focus();
    await page.keyboard.press('Enter');
  };
  await expect(button('‹ Return to Introduction')).toHaveCount(0);
  await activate('Start Side Quest');
  const check = button('Check Answer');
  for (const challenge of poemChallenges) {
    const phrase = (id: string) => challenge.tiles.find(tile => tile.id === id)!.text;
    for (const id of [...challenge.correctAnswer].reverse()) {
      await expect(check).toBeDisabled();
      await activate(phrase(id));
    }
    await expect(check).toBeEnabled();
    await activate('Check Answer');
    await expect(page.getByText('Hint: ' + challenge.hint, { exact: true })).toBeAttached();
    await activate('Try Again');
    const answer = challenge.acceptedAnswers[1] ?? challenge.correctAnswer;
    for (const id of answer) await activate(phrase(id));
    await activate('Check Answer');
    const scansion = answer.map(id => {
      const foot = challenge.feet[challenge.correctAnswer.indexOf(id)];
      return foot.unstressed + ' ' + foot.stressed;
    }).join(' · ');
    await expect(page.getByText(scansion, { exact: true })).toBeAttached();
    await activate(challenge.id === 10 ? 'View Final Results' : 'Next Round');
  }
  await expect(page.getByText('10 / 10', { exact: true })).toBeAttached();
});
