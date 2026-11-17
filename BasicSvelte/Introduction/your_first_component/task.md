A Svelte component lives in a `.svelte` file. It holds markup, plus an optional `<script>` block for JavaScript and an optional `<style>` block for CSS.

Variables you declare in `<script>` are available in the markup. Wrap any JavaScript expression in curly braces, and Svelte puts its value on the page:

```svelte
<script>
  let tool = 'Svelte';
</script>

<p>Built with {tool}.</p>
<p>That's {tool.length} letters.</p>
```

This task is a small Vite project. To see your component in a browser, open `package.json`, press ▶ next to the `dev` script, and open the address it prints. The page updates as you edit.

### Task

`src/App.svelte` declares a `name` variable. Make the heading greet `name` instead of the world.
