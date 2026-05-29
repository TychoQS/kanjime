import tseslint from 'typescript-eslint';

const isTechnical = (text) => {
    const s = text.trim();
    if (s.length === 0) return true;
    if (s.length === 1) return true;
    if (!Number.isNaN(Number(s))) return true;
    // Nombres de clases CSS: kebab-case, snake_case, o palabras separadas por espacios donde alguna tiene guiones.
    if (/^[a-zA-Z0-9\-_]+(?:\s+[a-zA-Z0-9\-_]+)*$/.test(s)) {
        if (s.includes('-') || s.includes('_')) return true;
    }
    return false;
};

const hardcodedTextRule = {
    meta: {
        type: "problem",
        docs: {
            description: "Detect hardcoded text literals in JSX that should be translated"
        },
        messages: {
            hardcoded: "Hardcoded text '{{text}}' found. Use translate() from src/Shared/I18n.ts."
        }
    },
    create(context) {
        return {
            JSXText(node) {
                if (typeof node.value === 'string') {
                    if (!isTechnical(node.value)) {
                        context.report({
                            node,
                            messageId: "hardcoded",
                            data: { text: node.value.trim() }
                        });
                    }
                }
            },
            JSXAttribute(node) {
                const attrName = node.name.name;
                if (['aria-label', 'placeholder', 'title'].includes(attrName)) {
                    if (node.value) {
                        if (node.value.type === 'Literal' && typeof node.value.value === 'string') {
                            if (!isTechnical(node.value.value)) {
                                context.report({
                                    node,
                                    messageId: "hardcoded",
                                    data: { text: node.value.value.trim() }
                                });
                            }
                        } else if (node.value.type === 'JSXExpressionContainer') {
                            const expr = node.value.expression;
                            if (expr.type === 'Literal' && typeof expr.value === 'string') {
                                if (!isTechnical(expr.value)) {
                                    context.report({
                                        node: expr,
                                        messageId: "hardcoded",
                                        data: { text: expr.value.trim() }
                                    });
                                }
                            }
                        }
                    }
                }
            }
        };
    }
};

export default tseslint.config(
    ...tseslint.configs.recommended,
    {
        files: ["src/**/*.{ts,tsx}"],
        plugins: {
            "custom-i18n": { rules: { "no-hardcoded-text": hardcodedTextRule } }
        },
        rules: {
            "custom-i18n/no-hardcoded-text": "error",
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-unused-vars": "error",
            "no-console": ["error", { allow: ["warn", "error"] }]
        }
    }
);
