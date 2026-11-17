// Gives each stage's stylesheet its own root class, so the three games can share one page
// without their CSS colliding. @keyframes are left alone automatically.
import prefixSelector from "postcss-prefix-selector";

const scope = (folder, prefix) =>
  prefixSelector({
    prefix,
    // Only touch this stage's own index.css
    includeFiles: [new RegExp(`[\\\\/]${folder}[\\\\/]src[\\\\/]index\\.css$`)],
    transform(prefix, selector, prefixedSelector) {
      // :root / html / body rules become rules on the stage's root class
      if (/^(:root|html|body)(?![\w-])/.test(selector)) {
        return selector.replace(/^(:root|html|body)/, prefix);
      }
      // Already scoped (like .poe-shell itself), so leave it alone
      if (selector.startsWith(prefix)) return selector;
      return prefixedSelector;
    },
  });

export default {
  plugins: [
    scope("edgar-allan-poe", ".poe-shell"),
    scope("matsuo-basho", ".basho-shell"),
    scope("shakespeare", ".shakespeare-shell"),
  ],
};
