# Hood Cerves

Marcador grupal de litros de cerveza. Sin login: se abre la URL y ya se puede
usar. Datos compartidos por todo el grupo (se refrescan cada 5 segundos).

Este proyecto está pensado para desplegarse en Vercel. Como no hace falta
Node.js en tu ordenador para desplegar (Vercel compila en la nube), estos
pasos funcionan enteramente desde el navegador.

## 1. Sube el proyecto a GitHub (sin usar git en tu ordenador)

1. Ve a [github.com](https://github.com) y crea una cuenta gratis si no
   tienes una.
2. Pulsa **New repository**, ponle de nombre `hood-cerves`, y créalo (puede
   ser público o privado, da igual).
3. En la página del repo recién creado, pulsa **Add file > Upload files**.
4. Arrastra ahí dentro TODA la carpeta `hood-cerves` (o todos sus archivos y
   subcarpetas: `app`, `components`, `lib`, `prisma`, `public`, `package.json`,
   `tsconfig.json`, `next.config.js`, `.gitignore`, `.env.example`,
   `README.md`). GitHub conserva la estructura de carpetas al arrastrar.
5. Pulsa **Commit changes**.

## 2. Crea cuenta en Vercel y conecta el repositorio

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta gratis
   (puedes registrarte directamente con tu cuenta de GitHub, es lo más
   cómodo).
2. Pulsa **Add New... > Project**.
3. Selecciona el repositorio `hood-cerves` que acabas de subir y pulsa
   **Import**.
4. Dejа el framework detectado como **Next.js** (Vercel lo detecta solo).
   Todavía NO despliegues: primero configura la base de datos (paso 3).

## 3. Configura la base de datos (Vercel Postgres)

1. Antes de pulsar Deploy (o después, no pasa nada), ve a la pestaña
   **Storage** del proyecto en Vercel.
2. Pulsa **Create Database** y elige **Postgres**.
3. Sigue el asistente (elige la región más cercana, por ejemplo Europa) y
   créala.
4. Cuando te lo pida, pulsa **Connect** para conectarla a tu proyecto
   `hood-cerves`. Esto añade automáticamente las variables de entorno
   `POSTGRES_PRISMA_URL` y `POSTGRES_URL_NON_POOLING` que usa el proyecto
   (ya están referenciadas en `prisma/schema.prisma`), no hay que tocar nada
   más.

## 4. Despliega

1. Vuelve a la pestaña **Deployments** (o pulsa **Deploy** si aún no lo has
   hecho) y lanza el despliegue.
2. Vercel instalará las dependencias, generará el cliente de Prisma, creará
   las tablas en la base de datos (`prisma db push`) y compilará la app.
3. Al terminar te dará una URL pública tipo `hood-cerves.vercel.app` — esa es
   la que le mandas al grupo. Cada vez que subas cambios al repo de GitHub,
   Vercel vuelve a desplegar solo.

## 5. Añadir a pantalla de inicio (móvil)

En iPhone (Safari): abre la URL, pulsa el botón compartir y luego
"Añadir a pantalla de inicio". En Android (Chrome): abre la URL y usa el
menú "Añadir a pantalla de inicio" / "Instalar app".

## Sobre el logo

No tenía el archivo `hood-cerves-logo.png`, así que la cabecera y los iconos
usan un logo placeholder ("HC" en un círculo). Para poner el logo real:

1. Sustituye `public/icons/icon-192.png` y `public/icons/icon-512.png` por
   tus propios iconos cuadrados (192x192 y 512x512 px).
2. En `app/page.tsx`, cambia el `<svg>` dentro de `.logo-circle` por una
   etiqueta `<img src="/logo.png" alt="Hood Cerves" />` una vez subas tu
   `logo.png` a la carpeta `public/`.

## Desarrollo local

Este proyecto no se ha podido instalar/probar localmente porque la máquina
donde se generó no tiene Node.js. Si en otro ordenador tienes Node.js (v18+)
instalado:

```bash
npm install
cp .env.example .env   # rellena con la connection string de tu base de datos
npm run dev
```
