# Uruguay Labura

Sitio estático para centralizar llamados laborales en Uruguay. Actualmente solo cuenta con los llamados de Uruguay Concursa.

## Motivación

La experiencia de usuario del sitio de Uruguay Concursa me pareció compleja. Esta es una solución 1:1 pero enfocada en mejor UX.

## Stack

- Astro 6.1
- React 19
- Tailwind + Basecoat

## Comandos

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm check`

## Configuración

El proyecto usa un script de scraping que se ejecuta automáticamente en build. Requiere la variable de entorno `SOURCE_URL` apuntando al JSON con los datos.

```bash
SOURCE_URL=https://gist.githubusercontent.com/GabrielDLeon/152fb922300190a5c43ecf0318ed0ce2/raw/022d358f8aebcb36187fa182078b2aa20513c083/concursos.json pnpm build
```

## Contribuir

Haz fork del repo, crea una rama con tus cambios y abre un PR.

## Deploy

- **Producción**: https://uruguay-labura.pages.dev/

## Licencia

MIT
