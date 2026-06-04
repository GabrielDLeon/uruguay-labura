/// <reference types='astro/client' />
/// <reference types='@astrojs/react/client' />

declare module "*?raw" {
  const content: string
  export default content
}
