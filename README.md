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
   `hood-cerves`. Esto añade automáticamente la variable de entorno
   `DATABASE_URL` que usa el proyecto (ya está referenciada en
   `prisma/schema.prisma`), no hay que tocar nada más.

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

## 6. Notificaciones push (opcional pero ya integrado en el código)

Cada vez que alguien apunta una bebida, todos los que hayan activado las
notificaciones (botón "🔔 Activar notificaciones" en la web) reciben un
aviso tipo "¡Fernando se acaba de tomar: Pinta!".

**Importante en iPhone**: por restricción de Apple, las notificaciones push
solo funcionan si la web está añadida a la pantalla de inicio (paso 5) — en
una pestaña normal de Safari no llegan. En Android/Chrome funcionan también
sin instalarla.

Para activarlo, añade estas variables de entorno en tu proyecto de Vercel
(**Settings → Environment Variables**, para Production y Preview):

```
VAPID_PUBLIC_KEY=BNfygOHC4VMYrG1SItW7nFiA57y0Qpa78ItnVL7e9elfTLjpV-zMCY8YZphcAjoQ7hkStS1GtmsWz5nw-8Fa1YQ
VAPID_PRIVATE_KEY=9-HxBJ-_YN994PVNAkhoNITd__H7vbrhJL09MoFBmOg
VAPID_SUBJECT=mailto:tu-email@ejemplo.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BNfygOHC4VMYrG1SItW7nFiA57y0Qpa78ItnVL7e9elfTLjpV-zMCY8YZphcAjoQ7hkStS1GtmsWz5nw-8Fa1YQ
```

(`NEXT_PUBLIC_VAPID_PUBLIC_KEY` debe tener el mismo valor que
`VAPID_PUBLIC_KEY` — una es para el servidor y otra para el navegador).
Cambia `VAPID_SUBJECT` por un email de contacto real tuyo, no se muestra a
nadie, es solo un requisito técnico del protocolo push. Después de añadir
las variables, vuelve a desplegar (Redeploy) para que se apliquen.

## Desarrollo local

Este proyecto no se ha podido instalar/probar localmente porque la máquina
donde se generó no tiene Node.js. Si en otro ordenador tienes Node.js (v18+)
instalado:

```bash
npm install
cp .env.example .env   # rellena con la connection string de tu base de datos
npm run dev
```
