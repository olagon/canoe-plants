// Test yourself: the quiz view.
import { loadAll } from '../data.js';
import { progress } from '../progress.js';
import { quizEngine } from '../components/quiz-engine.js';

export default async function quizView() {
  const [questions, plants] = await loadAll('quiz', 'plants');
  const best = progress.best('quiz');
  return {
    title: 'Test yourself',
    ground: 'ground-kapa',
    html: `
    <div class="wrap wrap--narrow view-head">
      <h1>Test yourself</h1>
      <p class="lede">Ten questions from a pool of ${questions.length}. They start easy and get harder. ${best != null ? `Your best so far is ${best} out of 10.` : 'Get all ten for a surprise.'}</p>
    </div>
    <div class="wrap wrap--narrow quiz" id="quiz"></div>
    <p class="wrap wrap--narrow small muted photo-note">Every photo is credited on its plant page and on the <a href="#/credits">credits page</a>.</p>`,
    mount: main => quizEngine(main.querySelector('#quiz'), questions, plants),
  };
}
