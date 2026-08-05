# iNurse como app nativa (Android / iOS)

Este proyecto usa [Capacitor](https://capacitorjs.com) como envoltorio nativo. La
app nativa **no** empaqueta una copia estática del frontend: carga directamente
`https://inurse-cima.onrender.com` dentro de un WebView (ver `server.url` en
`capacitor.config.json`). Esto es intencional — iNurse depende de un backend
propio (Javny/Gemini, CIMA-AEMPS, cuentas, sincronización) y no funciona como
sitio estático. La ventaja: no hay que reconstruir ni volver a subir la app
nativa cada vez que cambie el frontend — los cambios en `public/index.html` se
ven en la app en cuanto se despliegan en Render, igual que en el navegador.

Lo que **sí** requiere reconstruir y volver a subir la app a las tiendas: cambiar
el icono, el nombre, permisos nativos, o la URL del backend.

## Lo que ya está preparado en el repo

- `capacitor.config.json` — configuración (appId `com.inurse.cima`, nombre
  `iNurse`, URL del backend).
- `android/` — proyecto nativo de Android generado con `npx cap add android`,
  con los iconos y splash screens ya generados a partir de
  `public/icon-512.png` / `icon-512-maskable.png` (ver
  `scripts/gen-android-assets.py`).
- `npm run android:sync` — vuelve a sincronizar `capacitor.config.json` con el
  proyecto nativo tras cualquier cambio de configuración.
- `npm run android:assets` — regenera iconos/splash si cambias el icono de la
  app, y sincroniza.
- `npm run android:open` — abre el proyecto en Android Studio (requiere tenerlo
  instalado).

## Android — pasos que faltan (requieren tu ordenador y tu cuenta)

Nada de esto se puede hacer desde este entorno remoto: hace falta Android
Studio instalado localmente y una cuenta de Google Play Console.

1. **Instala [Android Studio](https://developer.android.com/studio)** (gratis).
2. Clona el repo en tu máquina y ejecuta `npm install`.
3. `npm run android:open` — abre `android/` en Android Studio. Deja que
   termine el "Gradle sync" la primera vez (puede tardar varios minutos).
4. **Prueba en un emulador o móvil conectado** con el botón ▶ de Android
   Studio, para confirmar que carga bien la app real.
5. **Genera una clave de firma** (una sola vez, guárdala en un sitio seguro —
   si la pierdes, no podrás volver a actualizar la app publicada):
   ```
   keytool -genkey -v -keystore inurse-release.keystore -alias inurse -keyalg RSA -keysize 2048 -validity 10000
   ```
6. En Android Studio: `Build → Generate Signed Bundle / APK → Android App
   Bundle`, selecciona el keystore del paso anterior. Esto genera un `.aab`
   (el formato que pide Google Play).
7. **Crea una cuenta de [Google Play Console](https://play.google.com/console/)**
   (pago único de $25).
8. Crea una ficha de app nueva, sube el `.aab`, rellena la ficha de la tienda
   (capturas de pantalla, descripción, política de privacidad — obligatoria
   para apps de salud) y envíala a revisión.

## iOS — requiere un Mac

Xcode solo existe en macOS, así que el proyecto iOS **no se puede generar desde
este entorno** (que es Linux). Cuando tengas acceso a un Mac:

```
npm install
npx cap add ios
npm run android:assets   # o un script equivalente que también regenere iOS
npx cap open ios
```

A partir de ahí, en Xcode: configurar el equipo de firma (requiere cuenta de
[Apple Developer Program](https://developer.apple.com/programs/), $99/año),
`Product → Archive`, y subir a App Store Connect para la revisión de Apple.

## Cambiar la URL del backend

Si en el futuro pones un dominio propio (en vez de `inurse-cima.onrender.com`),
solo hay que cambiar `server.url` en `capacitor.config.json`, ejecutar
`npm run android:sync` (y el equivalente en iOS), y volver a generar y subir
un build firmado — es el único caso en el que hace falta republicar solo por
un cambio de configuración, no de contenido.
