# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

## Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).



All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |



Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

# camilo llego hasta aqui

sprint 1- login

se  hizo el login con la HU de iniciar sesión, cerrar sesión, expirar sesión y bloqueo de cuenta,
se hizo el codigo para conectar con el backend posteriormente, pero por tema de tiempo se va a hacer el frontend de forma local, mientras se desarrollan y entregan el backend 02/03/2026


se realizo el token de sesion y la inactividad del usuario en un periodo de 2 minutos, si el usuario no realiza ninguna accion en ese tiempo se cerrara la sesion, se realizo un toast para notificar al usuario que su sesion esta a punto de expirar, se realizo el bloqueo de cuenta por intentos fallidos de inicio de sesion, se realizo el cierre de sesion por parte del usuario.