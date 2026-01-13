/** @type {import("prettier").Config} */
const config = {
  plugins: ["prettier-plugin-astro"],
  trailingComma: "all",
  singleQuote: false,
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  arrowParens: "always",
  semi: true,
  bracketSpacing: true,
  endOfLine: "lf",
  htmlWhitespaceSensitivity: "ignore",
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};

export default config;
