import { defineConfig } from "eslint/config";
import unusedImports from "eslint-plugin-unused-imports";

export default defineConfig([{
    plugins: {
        "unused-imports": unusedImports,
    },

    rules: {
        "unused-imports/no-unused-imports": "error",

        "unused-imports/no-unused-vars": ["warn", {
            vars: "all",
            varsIgnorePattern: "^_",
            argsIgnorePattern: "^_",
        }],
    },
}]);