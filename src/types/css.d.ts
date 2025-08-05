// This declaration tells TypeScript how to handle imports of CSS files
// with the `?inline` query. Vite supports importing CSS as a string
// when using the `?inline` suffix. Without this declaration, the
// compiler would error that the module has an implicit 'any' type.
declare module '*.css?inline' {
  const content: string;
  export default content;
}