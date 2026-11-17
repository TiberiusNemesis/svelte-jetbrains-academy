import { readFileSync } from 'node:fs';
import { parse } from 'svelte/compiler';

/**
 * Parses a component file into Svelte's AST, so a test can check how the
 * learner wrote something, not only what it renders.
 *
 * @param {URL} url Usually new URL('../src/App.svelte', import.meta.url).
 */
export function parseComponent(url) {
  return parse(readFileSync(url, 'utf8'), { modern: true });
}

/**
 * Returns every AST node under `root` for which `predicate` is true.
 *
 * @param {object} root A node, such as the result of parseComponent().
 * @param {(node: any) => boolean} predicate
 */
export function findNodes(root, predicate) {
  const found = [];
  const seen = new WeakSet();
  const visit = (value) => {
    if (value === null || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);
    if (typeof value.type === 'string' && predicate(value)) found.push(value);
    for (const child of Object.values(value)) visit(child);
  };
  visit(root);
  return found;
}
