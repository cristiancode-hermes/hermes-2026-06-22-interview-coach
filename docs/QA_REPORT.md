# QA Report — Interview Coach

## Resumen
⚠️ **WARN** — Proyecto funcional con builds y tests pasando, pero con múltiples issues de calidad de código pendientes.

## Build
| Build | Estado |
|-------|--------|
| `nest build` (API) | ✅ |
| `ng build` (Web) | ✅ |

## Tests

| Suite | Estado | Tests |
|-------|--------|-------|
| AuthService | ✅ | 4 pass |
| AI Agent / LocalStrategy | ✅ | 3 pass |
| InterviewsService **(nuevo)** | ✅ | 21 pass |
| QuestionsService **(nuevo)** | ✅ | 16 pass |
| UsersService **(nuevo)** | ✅ | 12 pass |
| **Total API** | **✅** | **56 tests, 0 fail** |
| Angular Web | ❌ No config | 0 tests — sin framework de testing configurado |

### Nuevos tests añadidos: **49**
- `src/interviews/interviews.service.spec.ts` — 21 tests (CRUD, paginación, filtros, NotFound)
- `src/questions/questions.service.spec.ts` — 16 tests (búsqueda, generación, batch create, errores)
- `src/users/users.service.spec.ts` — 12 tests (findById/Email, stats, weaknesses)

## Auditoría

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| Build | ✅ | Ambos builds exitosos sin errores |
| Lint | ⚠️ | 210 issues (209 errors prettier/formato, 1 warning floating promises). Mayoría auto-fixeable con `--fix` |
| Types | ⚠️ | Uso excesivo de `any` types en frontend (`any` en services, type assertions en backend) |
| Code smells | ⚠️ | `any` types generalizados, variables sin usar, métodos async sin await |
| Docs | ✅ | 7 documentos completos: ARCHITECTURE, API, DATABASE, FRONTEND, LEARNINGS, DECISIONS, AI_INTEGRATION |
| Edge cases | ⚠️ | Dashboard usa `any[]` cast en lugar de tipos. Falta manejo de 401 en frontend |
| Angular tests | ❌ | Sin configuración de testing — `skipTests: true` en schematics, sin test builder |
| Design System | ✅ | Design specs aplicados correctamente: colores Indigo/Púrpura, Inter font, Tailwind v4 |
| Responsive | ✅ | Mobile-first con breakpoints, grid adaptativo |
| Dark mode | ✅ | Implementado con detección de preferencia del sistema |

## Issues

### 🔥 Alta — Sin tests en frontend Angular
**Problema:** La aplicación Angular no tiene configuración de testing (`angular.json` no tiene builder de test, no hay dependencias de test en `package.json`, schematics con `skipTests: true`). Todo el frontend (10+ páginas, 12+ componentes, 7 servicios) no tiene ni un solo test.

**Impacto:** Cualquier regresión visual o lógica en el frontend pasa desapercibida.

**Solución:** Configurar Karma + Jasmine o migrar a Jest para Angular. Instalar `@angular-builders/jest` o configurar `@angular-devkit/build-angular:karma`. Escribir tests para servicios (HTTP) y componentes clave.

### ⚠️ Media — Uso excesivo de `any` types
**Problema:** Múltiples servicios y controladores usan `any` types en lugar de tipos específicos:
- `InterviewService.getAll()` devuelve `Promise<any>` en lugar de `PaginatedResponse<InterviewSummary>`
- `AuthService.login()` accede a `res.token` pero backend responde con `accessToken`
- `DashboardPage` castea arrays como `as any[]` en lugar de usar tipos

**Impacto:** Potencial mismatch frontend-backend (como el caso `token` vs `accessToken`). Pérdida de seguridad de tipos.

**Solución:** Tipar todas las respuestas HTTP en los servicios Angular con interfaces concretas.

### ⚠️ Media — 210 lint errors (mayoría Prettier)
**Problema:** El linter reporta 209 errores, predominantemente de formato Prettier (saltos de línea, comas trailing, indentación). También hay issues reales: variables sin usar (9), métodos async sin await (3), unsafe any access.

**Impacto:** El gutter de errores dificulta detectar issues reales entre el ruido de formato.

**Solución:** Ejecutar `eslint --fix` y configurar formateo automático en pre-commit hook.

### ⚠️ Media — Frontend error handling incompleto
**Problema:** No hay interceptores globales para errores HTTP (401, 500). Si el token expira, el usuario no recibe feedback claro. `AuthService` no refresca token automáticamente.

**Impacto:** Sesiones expiradas causan errores silenciosos o pantallas en blanco.

**Solución:** Implementar `HttpInterceptor` que redirija a login en 401 y muestre toasts en errores de servidor.

### 📝 Baja — DashboardPage template inflado
**Problema:** `dashboard.page.ts` tiene el template HTML inline (138 líneas) con lógica de presentación compleja (colores condicionales inline, anidamiento profundo).

**Solución:** Extraer sub-componentes para WeaknessProfile y stats grid.

### 📝 Baja — `synchronize: true` en producción
**Problema:** `app.module.ts` usa `synchronize: true` en TypeORM. Seguro para desarrollo/SQLite, pero peligroso si se despliega con PostgreSQL.

**Solución:** Usar migraciones para producción.

## Diseño — Verificación de Design System

| Elemento | Estado | Notas |
|----------|--------|-------|
| Primary color (#6366f1) | ✅ | Indigo usado correctamente en botones, links |
| AI accent (#a855f7) | ✅ | Purple usado para badges de AI |
| Inter font | ✅ | Cargado vía Google Fonts |
| Tailwind v4 | ✅ | `@theme` directive en styles.css |
| Dark mode | ✅ | `dark:` classes con persistencia |
| Skeleton loaders | ✅ | En dashboard y páginas principales |
| Empty/Error states | ✅ | Componentes dedicados EmptyState y ErrorState |
| Botones primarios | ✅ | Indigo 500 con hover Indigo 600 |
| Cards | ✅ | Borde neutral-200, shadow, rounded-xl |
| Badges | ✅ | primary-100 bg con primary-700 text |
| Modal | — | Componente presente pero no implementado en rutas |

## Tests nuevos — Resumen

### `interviews.service.spec.ts` — 21 tests
```
✓ create (2) — DTO completo y mínimo
✓ findAll (6) — paginación, filtros por status/role/type, combinados
✓ findRecent (3) — límite default, custom, sin resultados
✓ findOne (3) — encontrado, NotFound (id erróneo), NotFound (userId erróneo)
✓ update (4) — actualización, NotFound x2, preserva campos no enviados
✓ remove (3) — borrado, NotFound x2
```

### `questions.service.spec.ts` — 16 tests
```
✓ findOne (3) — encontrado, NotFound, mensaje correcto
✓ findByInterview (2) — ordenado por orderIndex, array vacío
✓ generate (7) — generación exitosa, NotFound, BadRequest, cycling, fallback, count, timeLimit
✓ batchCreate (4) — creación múltiple, NotFound, single DTO, keyPoints undefined
```

### `users.service.spec.ts` — 12 tests
```
✓ findById (2) — encontrado, null
✓ findByEmail (2) — encontrado, null
✓ getStats (4) — stats completos, ceros, sin feedback, mixto
✓ getWeaknesses (4) — sorted, skip sin feedback, empty, múltiples en misma categoría
```

## Conclusión

**Fortalezas:** Builds limpios, documentación completa, design system consistente, API tests sólidos (56 tests, todos pasando). La arquitectura Signal-first en Angular y Strategy Pattern para AI son decisiones acertadas.

**Debilidades:** Falta total de tests frontend, uso excesivo de `any` types, lint mayoritariamente no formateado, error handling en frontend incompleto.

**Recomendación:** Priorizar configuración de testing Angular y tipado de servicios frontend antes de nuevos features.
