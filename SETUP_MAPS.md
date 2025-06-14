# Configuración del Mapa de Tiendas y Optimizador de Compras

## Configuración de Google Maps API

Para que el mapa de tiendas funcione correctamente, necesitas configurar una API key de Google Maps:

### 1. Obtener API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Ve a "Credentials" y crea una nueva API key
5. Restringe la API key a tu dominio por seguridad

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui

# Base de datos
DATABASE_URL="file:./dev.db"
```

### 3. Funcionalidades del Mapa

El mapa de tiendas incluye:

- **Visualización de tiendas**: Muestra todas las tiendas de supermercados en el mapa
- **Filtros por cadena**: Filtra por Walmart, Soriana, Chedraui
- **Filtros por ciudad**: Filtra por Ciudad de México, Guadalajara, Monterrey
- **Información detallada**: Muestra dirección, teléfono, horarios y calificación
- **Ubicación del usuario**: Detecta automáticamente tu ubicación
- **Selección de tienda**: Permite seleccionar una tienda para usar en la aplicación

### 4. Optimizador de Compras

El sistema incluye un optimizador inteligente que:

- **Compara precios**: Analiza los precios de ingredientes en diferentes tiendas
- **Calcula ahorros**: Muestra cuánto puedes ahorrar en cada tienda
- **Considera distancia**: Toma en cuenta la proximidad de las tiendas
- **Integración MCP**: Usa IA para recomendar las mejores opciones
- **Lista de compras**: Genera listas optimizadas por tienda

### 5. Tiendas Incluidas

El sistema incluye tiendas de ejemplo en:
- **Ciudad de México**: Walmart, Soriana, Chedraui en diferentes colonias
- **Guadalajara**: Walmart y Soriana
- **Monterrey**: Walmart y Soriana

### 6. Uso

#### Mapa de Tiendas:
1. Ve a la sección "Tiendas" en la navegación
2. Usa los filtros para encontrar tiendas específicas
3. Haz clic en un marcador del mapa para ver detalles
4. Selecciona una tienda para usarla en la aplicación

#### Optimizador de Compras:
1. Ve a "Optimizar Compras" en la navegación
2. Selecciona una receta o usa el optimizador MCP
3. El sistema calculará los mejores precios por tienda
4. Revisa la comparación de precios y ahorros
5. Selecciona la tienda que prefieras

#### Optimizador MCP Inteligente:
1. En el Dashboard, usa el "Optimizador MCP Inteligente"
2. El sistema generará recetas y las optimizará automáticamente
3. Verás un ranking de las mejores opciones
4. Haz clic en "Ver Detalles" para más información

### 7. Personalización

Puedes agregar más tiendas:
1. Ejecuta el script de población: `npx ts-node scripts/seed-stores.ts`
2. O agrega tiendas manualmente a través de la API
3. Modifica el archivo `scripts/seed-stores.ts` para agregar más tiendas

### 8. Solución de Problemas

Si el mapa no se carga:
1. Verifica que la API key esté configurada correctamente
2. Asegúrate de que las APIs estén habilitadas en Google Cloud Console
3. Revisa la consola del navegador para errores específicos
4. Verifica que la API key tenga las restricciones correctas

### 9. Características Avanzadas

- **Precios simulados**: El sistema incluye precios realistas para ingredientes comunes
- **Cálculo de distancias**: Usa la fórmula de Haversine para calcular distancias precisas
- **Sistema de scoring**: Combina precio, distancia y disponibilidad para rankings
- **Integración con MCP**: Usa IA para recomendaciones personalizadas
- **Persistencia de selecciones**: Guarda las tiendas seleccionadas en localStorage 