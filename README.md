# Calendarios de Adviento

App personal para preparar calendarios de Adviento (días 1–24): ideas por día, temática, tipo de regalo, enlaces de compra y presupuesto. Sin servidor ni base de datos: los datos se guardan en el navegador y se pueden exportar/importar en JSON.

## Uso rápido

```bash
npm install
npm run dev      # desarrollo en http://localhost:5173
npm test         # tests
npm run build    # genera la carpeta dist/
```

## Cómo funciona

- **Varios calendarios**: uno por persona. Al entrar sin ninguno, la app te ofrece crear el primero.
- **Cada día**: título/temática, tipo de regalo, varias ideas con coste y enlace, máximo diario editable.
- **Idea principal** (★): es la única que suma al total. Se cambia con un clic.
- **Estado automático**: rojo = sin nada, amarillo = con ideas, verde = comprado (se marca a mano).
- **Presupuesto**: objetivo total, suma de máximos diarios, coste total previsto (idea principal de todos los días), ya pagado (días en verde) y lo que te queda o te pasas.
- **Intercambiar días**: arrastra un día sobre otro, o usa «Intercambiar con» dentro del día.
- **Copias**: botones Exportar / Importar. Importar permite añadir a lo que ya tienes o reemplazarlo.
- Si hay cambios sin exportar, la app lo indica y el navegador avisa al cerrar la pestaña.

## Publicar en GitHub Pages

`vite.config.js` usa `base: './'`, así que funciona en cualquier ruta del repositorio.
El workflow `.github/workflows/deploy.yml` ya está incluido: en cada push a `main` pasa los tests, compila y publica.

1. Crea un repositorio vacío en GitHub y sube el proyecto a la rama `main`.
2. En el repositorio, ve a *Settings → Pages* y en **Source** elige **GitHub Actions**.
3. Haz un push (o lanza el workflow a mano desde la pestaña *Actions*). La web quedará en `https://TU_USUARIO.github.io/NOMBRE_DEL_REPO/`.

Recuerda que los datos de cada persona viven en su propio navegador: abrir la misma web desde otro navegador empieza vacío, y para llevarte datos usas Exportar / Importar.

## Estructura

- `src/lib/model.js`: modelo de datos, estados y cálculo del resumen
- `src/lib/storage.js`: guardado en el navegador, exportar e importar
- `src/components/`: rejilla, editor de día, resumen, formularios
