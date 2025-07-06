/* eslint-disable import/no-anonymous-default-export */
import typescriptEslint from "@typescript-eslint/eslint-plugin"
import path from "node:path"
import { fileURLToPath } from "node:url"
import js from "@eslint/js"
import { FlatCompat } from "@eslint/eslintrc"
import pluginLingui from "eslint-plugin-lingui"
import unusedImports from "eslint-plugin-unused-imports"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  {
    ignores: ["node_modules/", ".next/"],
  },
  ...compat.extends("next/core-web-vitals"),
  pluginLingui.configs["flat/recommended"],
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],

    plugins: {
      "@typescript-eslint": typescriptEslint,
      "unused-imports": unusedImports,
    },

    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "comma-dangle": ["error", "always-multiline"],

      "import/no-cycle": [
        "error",
        {
          maxDepth: 10,
          ignoreExternal: true,
        },
      ],

      "import/order": [
        "error",
        {
          groups: [["builtin", "external"], "internal", "parent", "sibling", "index", "object", "type"],

          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "next",
              group: "external",
              position: "before",
            },
            {
              pattern: "next/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "@/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "**/*.css",
              group: "internal",
              position: "after",
            }
          ],

          pathGroupsExcludedImportTypes: ["internal"],
          "newlines-between": "never",

          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },

          warnOnUnassignedImports: true,
        },
      ],

      "no-undef": "off",

      "no-unused-vars": [
        "off",
        {
          vars: "all",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          ignoreRestSiblings: false,
        },
      ],

      "no-warning-comments": [
        "warn",
        {
          terms: ["todo", "fixme"],
          location: "anywhere",
        },
      ],

      "object-curly-spacing": [
        "error",
        "always",
        {
          arraysInObjects: true,
          objectsInObjects: true,
        },
      ],

      "quotes": ["error", "double"],
      "semi": ["error", "never"],

      "sort-imports": [
        "error",
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ["all", "multiple", "single", "none"],
        },
      ],

      "react-hooks/exhaustive-deps": "off",

      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
      ],
    },
  },
]
