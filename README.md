# Bookstore Inventory API

API REST con **NestJS** para inventario de librerías: CRUD de libros (baja lógica), búsqueda por categoría, stock bajo y cálculo de precio de venta con tipo de cambio **USD → moneda local** (según país proveedor) y margen del **40 %**.

---

## Cómo ejecutarlo (local)

Desde la raíz del repositorio:

```sh
npm install
```

1. **PostgreSQL:** crea una base de datos (por ejemplo `bookstore`) y anota usuario, contraseña, host y puerto.
2. **Variables de entorno:** copia `.env.example` → `.env`  
   - PowerShell: `Copy-Item .env.example .env`  
   - CMD: `copy .env.example .env`
3. En `.env`, ajusta **`DATABASE_URL`** para que apunte a tu Postgres (formato abajo). Opcional: `PORT` (por defecto **3000**), `FALLBACK_RATES_JSON` si quieres tasas de respaldo cuando falle la API de cambio.
4. Arranca la API en modo desarrollo:

```sh
npm run start:dev
```

La API queda en **http://localhost:3000** (o el `PORT` de tu `.env`).

En **desarrollo** (`NODE_ENV=development`), TypeORM crea o actualiza las tablas al arrancar (`synchronize`). En **producción** no: se usan **migraciones** y se aplican al iniciar (`migrationsRun`). Para ejecutar migraciones a mano tras un `npm run build`: `npm run migration:run`.

---

## Requisitos previos

| Requisito | Detalle |
|-----------|---------|
| **Node.js** | 22.x (LTS) recomendado |
| **npm** | Incluido con Node |
| **PostgreSQL** | 16+ accesible desde tu máquina (instalación local, servicio en red, etc.) |
| **Docker Desktop** | Opcional; solo si quieres levantar API + Postgres con `docker compose` |

---

## Variables de entorno

| Archivo | Origen | Propósito |
|---------|--------|-----------|
| `.env` | `.env.example` | Conexión a Postgres (`DATABASE_URL`), puerto, CORS en prod (`CLIENT_URL`), URL y respaldo de tasas (`EXCHANGE_RATE_API_URL`, `FALLBACK_RATES_JSON`). |

`DATABASE_URL` debe seguir este formato:

`postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/NOMBRE_BD`

Ejemplo si Postgres escucha en tu PC en el puerto estándar:

`postgresql://postgres:tu_password@localhost:5432/bookstore`

Puedes crear la base con la herramienta que uses; ejemplo en `psql`:

```sql
CREATE DATABASE bookstore;
```

---

## Documentación de API (Swagger)

Con el API en marcha, la documentación interactiva **OpenAPI (Swagger)** está en:

**http://localhost:3000/api/docs**

(Cambia host o puerto si modificaste `PORT` en `.env`.)

Ahí ves rutas, esquemas y puedes probar los endpoints.

---

## Ejemplos de uso de los endpoints

Base URL local: **http://localhost:3000**  
Los cuerpos JSON van en **camelCase** (DTOs de Nest).

| Método | Ruta | Body |
|--------|------|------|
| `POST` | `/books` | JSON crear libro |
| `GET` | `/books` | Opcional: `?page=1&perPage=20` |
| `GET` | `/books/:id` | — |
| `PUT` | `/books/:id` | JSON parcial o completo |
| `DELETE` | `/books/:id` | — (baja lógica) |
| `GET` | `/books/search?category=texto` | — |
| `GET` | `/books/low-stock?threshold=10` | — |
| `POST` | `/books/:id/calculate-price` | — |

### Crear libro

`POST http://localhost:3000/books`  
`Content-Type: application/json`

```json
{
  "title": "El Quijote",
  "author": "Miguel de Cervantes",
  "isbn": "978-84-376-0494-7",
  "costUsd": 15.99,
  "stockQuantity": 25,
  "category": "Literatura Clásica",
  "supplierCountry": "ES"
}
```

### Actualizar libro

`PUT http://localhost:3000/books/1`  
`Content-Type: application/json`

```json
{
  "title": "Kafka en la orilla",
  "author": "Haruki Murakami",
  "isbn": "9780099491439",
  "costUsd": 24.5,
  "sellingPriceLocal": null,
  "stockQuantity": 12,
  "category": "Ficción",
  "supplierCountry": "JP"
}
```

### Calcular precio de venta

`POST http://localhost:3000/books/1/calculate-price`  

Sin body. Usa `cost_usd` del libro, tasa USD→moneda local y guarda `selling_price_local`. Si falla la API externa, entra en juego `FALLBACK_RATES_JSON`.

---

## Docker (opcional)

Si tienes **Docker Desktop** en ejecución, puedes levantar API y Postgres juntos:

```sh
docker compose up --build
```

- API: **http://localhost:3000** — Swagger: **http://localhost:3000/api/docs**
- Postgres expuesto en el host en el puerto **5434** (usuario / contraseña / base: `bookstore` / `bookstore` / `bookstore`), según `docker-compose.yml`.

En segundo plano: `docker compose up --build -d`  
Detener: `docker compose down`

Si ves error de conexión al “pipe” de Docker, el motor no está arrancado: abre Docker Desktop y espera a que esté listo.

---

## Colección Postman

En `postman/` puedes versionar la colección exportada desde Postman (por ejemplo `bookstore-inventory-api.postman_collection.json`).

---

## Scripts útiles

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Desarrollo con recarga |
| `npm run build` | Compilar |
| `npm run start:prod` | Ejecutar `dist/main.js` |
| `npm run migration:run` | Aplicar migraciones (tras `build`) |
| `npm run migration:revert` | Revertir última migración |
