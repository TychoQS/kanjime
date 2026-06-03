import tseslint from "typescript-eslint";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when a trimmed string should be considered a non-user-facing
 * technical token that does not need i18n coverage.
 */
const isTechnical = (text) => {
  const s = text.trim();

  // Empty / single characters (icons, separators …)
  if (s.length === 0) return true;
  if (s.length === 1) return true;

  // Pure numbers
  if (!Number.isNaN(Number(s))) return true;

  // CSS variable references  e.g. "var(--ion-color-primary)"
  if (/^var\(--[^)]+\)$/.test(s)) return true;

  // Raw CSS custom-property names  e.g. "--ion-color-primary"
  if (/^--[a-zA-Z0-9-]+$/.test(s)) return true;

  // Kebab-case / snake_case identifiers  e.g. "ion-color-primary", "data_key"
  if (/^[a-zA-Z0-9]+(?:[-_][a-zA-Z0-9]+)+$/.test(s)) return true;

  // CSS class tokens: space-separated words all kebab/snake (HTML className)
  if (/^[a-zA-Z0-9]+(?:[-_][a-zA-Z0-9]+)*(?:\s+[a-zA-Z0-9]+(?:[-_][a-zA-Z0-9]+)*)*$/.test(s)) {
    if (s.includes("-") || s.includes("_")) return true;
  }

  // Camel-case identifiers  e.g. "crescent", "menuitem", "progressbar"
  // These appear as technical ARIA role values or Ionic component values
  if (/^[a-z][a-zA-Z0-9]*$/.test(s) && s.length <= 20) return true;

  // ALL-CAPS acronym tokens  e.g. "text", "cancel", "start", "end", "page",
  // but NOT "An unexpected error …" — covered by the length + uppercase check
  // Short uppercase tokens used as enum-like values  e.g. "icon-only"
  if (/^[A-Z][A-Z0-9_]*$/.test(s) && s.length <= 10) return true;

  return false;
};

// ---------------------------------------------------------------------------
// JSX attribute names that NEVER carry user-visible text
// ---------------------------------------------------------------------------
const TECHNICAL_ATTR_NAMES = new Set([
  // HTML / ARIA technical attrs
  "id",
  "className",
  "class",
  "style",
  "type",
  "role",
  "slot",
  "name",
  "href",
  "src",
  "srcset",
  "alt",          // alt IS user-visible but must come from i18n — caught by JSXText rule
  "htmlFor",
  "for",
  "tabIndex",
  "tabindex",
  "target",
  "rel",
  "download",
  "lang",
  "dir",
  "inputMode",
  "inputmode",
  "autoComplete",
  "autocomplete",
  "autoFocus",
  "autofocus",
  "method",
  "action",
  "encType",
  "enctype",
  "pattern",
  "min",
  "max",
  "step",
  "rows",
  "cols",
  "wrap",
  "accept",
  "capture",
  "crossOrigin",
  "crossorigin",
  "loading",
  "decoding",
  "referrerPolicy",
  "sandbox",
  "allow",
  "frameBorder",
  "scrolling",
  "shape",
  "coords",
  "media",
  "sizes",
  "preload",

  // Data / test-id attrs
  "data-testid",
  "data-theme",

  // Ionic / CSS utility attrs
  "fill",
  "color",
  "size",
  "expand",
  "shape",
  "position",
  "side",
  "mode",
  "interface",
  "value",         // usually a technical value (segment/tab id) — text content comes from children
  "debounce",
  "animated",
  "backdropDismiss",
  "keyboardClose",

  // React Router attrs (URL paths are not user text)
  "path",
  "exact",
  "to",
  "from",
  "push",
  "replace",

  // SVG technical attrs
  "viewBox",
  "viewbox",
  "d",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "width",
  "height",
  "fill",
  "stroke",
  "strokeWidth",
  "strokeLinecap",
  "strokeLinejoin",
  "transform",
  "points",
  "preserveAspectRatio",
  "xmlns",
  "xmlnsXlink",
  "xlinkHref",

  // React internals
  "key",
  "ref",

  // ARIA state attrs  (the *label* attrs are user-visible → NOT excluded)
  "aria-hidden",
  "aria-live",
  "aria-atomic",
  "aria-busy",
  "aria-current",
  "aria-pressed",
  "aria-selected",
  "aria-expanded",
  "aria-checked",
  "aria-disabled",
  "aria-required",
  "aria-invalid",
  "aria-multiselectable",
  "aria-multiline",
  "aria-readonly",
  "aria-sort",
  "aria-level",
  "aria-posinset",
  "aria-setsize",
  "aria-colspan",
  "aria-rowspan",
  "aria-colindex",
  "aria-rowindex",
  "aria-valuemin",
  "aria-valuemax",
  "aria-valuenow",
  "aria-orientation",
  "aria-haspopup",
  "aria-autocomplete",
  "aria-relevant",
  "aria-dropeffect",
  "aria-grabbed",
  "aria-flowto",
  "aria-controls",
  "aria-owns",
  "aria-activedescendant",
  "aria-describedby",
  "aria-labelledby",
  "aria-errormessage",
  "aria-details",
]);

// Object property keys that carry user-visible strings when their value is
// a plain string literal (e.g. inside button config arrays passed to Ionic).
// NOTE: "label" and "description" are intentionally NOT included here because
// they also appear in non-JSX data objects (category records from the database,
// attribution records, etc.) where the string comes from an external source.
// For JSX attribute usage, the JSXAttribute visitor already catches them.
const USER_TEXT_OBJECT_KEYS = new Set([
  "text",
  "message",
  "header",
  "subHeader",
  "title",
  "placeholder",
  "caption",
  "tooltip",
  "helperText",
  "errorText",
  "successText",
  "warningText",
]);

// ---------------------------------------------------------------------------
// Rule implementation
// ---------------------------------------------------------------------------

const hardcodedTextRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Detect hardcoded visible text in JSX / TS that must come from translate()",
    },
    messages: {
      hardcoded:
        "Hardcoded text '{{text}}' found. Use translate() from src/Shared/I18n.ts.",
    },
  },

  create(context) {
    // Track whether a file contains JSX — we only flag module-scope string
    // constants in files that are components (contain JSX).
    let fileContainsJSX = false;

    /**
     * Report a node when its trimmed string value looks like user-visible text.
     */
    const reportIfUserText = (node, rawText) => {
      if (typeof rawText === "string" && !isTechnical(rawText)) {
        context.report({
          node,
          messageId: "hardcoded",
          data: { text: rawText.trim() },
        });
      }
    };

    return {
      // -----------------------------------------------------------------------
      // 1. JSX text nodes  e.g.  <h1>Hello world</h1>
      // -----------------------------------------------------------------------
      JSXText(node) {
        fileContainsJSX = true;
        if (typeof node.value === "string") {
          reportIfUserText(node, node.value);
        }
      },

      // -----------------------------------------------------------------------
      // 2. JSX opening tags → track JSX presence
      // -----------------------------------------------------------------------
      JSXOpeningElement() {
        fileContainsJSX = true;
      },

      // -----------------------------------------------------------------------
      // 3. JSX attributes  (string literal or {string literal} expression)
      // -----------------------------------------------------------------------
      JSXAttribute(node) {
        const attrName =
          node.name.type === "JSXIdentifier"
            ? node.name.name
            : node.name.name; // JSXNamespacedName (fallback)

        // Skip purely technical attribute names
        if (TECHNICAL_ATTR_NAMES.has(attrName)) return;

        // Skip "data-*" attributes entirely — they are never user-visible
        if (typeof attrName === "string" && attrName.startsWith("data-")) return;

        if (!node.value) return;

        // String literal  e.g.  label="JLPT / Joyo"
        if (
          node.value.type === "Literal" &&
          typeof node.value.value === "string"
        ) {
          reportIfUserText(node, node.value.value);
          return;
        }

        // Expression container  e.g.  label={"JLPT / Joyo"}
        if (node.value.type === "JSXExpressionContainer") {
          const expr = node.value.expression;
          if (expr.type === "Literal" && typeof expr.value === "string") {
            reportIfUserText(expr, expr.value);
          }
        }
      },

      // -----------------------------------------------------------------------
      // 4. Object properties with user-text keys inside JSX expressions
      //    e.g.  buttons={[{ text: "OK", role: "cancel" }]}
      // -----------------------------------------------------------------------
      Property(node) {
        const keyName =
          node.key.type === "Identifier"
            ? node.key.name
            : node.key.type === "Literal"
            ? String(node.key.value)
            : null;

        if (!keyName || !USER_TEXT_OBJECT_KEYS.has(keyName)) return;

        const val = node.value;
        if (val.type === "Literal" && typeof val.value === "string") {
          reportIfUserText(val, val.value);
        }

        // Template literal with no expressions
        if (
          val.type === "TemplateLiteral" &&
          val.expressions.length === 0 &&
          val.quasis.length === 1
        ) {
          reportIfUserText(val, val.quasis[0].value.cooked ?? "");
        }
      },

      // -----------------------------------------------------------------------
      // 5. Module-scope string variable declarations in component files
      //    e.g.  const DEFAULT_ERROR_MESSAGE = "An unexpected error …";
      //    We only flag UPPER_SNAKE_CASE or PascalCase constants whose value
      //    is a plain non-technical string literal and that live at the top
      //    (program) scope — the typical pattern for hardcoded message strings.
      // -----------------------------------------------------------------------
      "Program:exit"(programNode) {
        if (!fileContainsJSX) return;

        for (const statement of programNode.body) {
          if (statement.type !== "VariableDeclaration") continue;

          for (const declarator of statement.declarations) {
            if (
              declarator.id.type !== "Identifier" ||
              declarator.init === null ||
              declarator.init === undefined
            ) {
              continue;
            }

            const init = declarator.init;

            // String literal  e.g.  const FOO = "text";
            if (
              init.type === "Literal" &&
              typeof init.value === "string" &&
              !isTechnical(init.value)
            ) {
              reportIfUserText(init, init.value);
              continue;
            }

            // Template literal without expressions  e.g.  const FOO = `text`;
            if (
              init.type === "TemplateLiteral" &&
              init.expressions.length === 0 &&
              init.quasis.length === 1 &&
              !isTechnical(init.quasis[0].value.cooked ?? "")
            ) {
              reportIfUserText(init, init.quasis[0].value.cooked ?? "");
            }
          }
        }
      },
    };
  },
};

// ---------------------------------------------------------------------------
// ESLint flat-config export
// ---------------------------------------------------------------------------

export default tseslint.config(
  ...tseslint.configs.recommended,
  // Global rules for all source files
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "custom-i18n": { rules: { "no-hardcoded-text": hardcodedTextRule } },
    },
    rules: {
      "custom-i18n/no-hardcoded-text": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  // The i18n file itself contains the translation strings — exclude it from
  // the no-hardcoded-text rule to prevent every translation value being flagged.
  {
    files: ["src/Shared/I18n.ts"],
    rules: {
      "custom-i18n/no-hardcoded-text": "off",
    },
  }
);
