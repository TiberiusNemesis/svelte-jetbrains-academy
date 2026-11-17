import { render, screen } from '@testing-library/svelte';
import { expect, test } from '@jest/globals';
import { hint } from '#utils/hint.js';
import { findNodes, parseComponent } from '#utils/svelte-source.js';
import App from '../src/App.svelte';

test('the heading greets Ada', () => {
  render(App);
  hint('The heading should read "Hello, Ada!".', () =>
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hello, Ada!')
  );
});

test('the heading uses the name variable', () => {
  const ast = parseComponent(new URL('../src/App.svelte', import.meta.url));
  const headings = findNodes(ast.fragment, (node) => node.type === 'RegularElement' && node.name === 'h1');
  const uses = findNodes(headings, (node) => node.type === 'ExpressionTag' && node.expression.name === 'name');
  hint('Put {name} in the heading instead of typing the name out.', () =>
    expect(uses).not.toHaveLength(0)
  );
});
