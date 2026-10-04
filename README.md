# GameVault Services

Aplicación gamer orientada a servicios desarrollada para el Subproducto No. 6.

## Concepto
GameVault Services es una plataforma gamer que integra varios dominios funcionales mediante servicios separados y una API REST.

### Servicios implementados
- Catalog Service
- Library Service
- Achievement Service
- Tournament Service
- Review Service
- Profile Service
- Notification Service
- Analytics Service

## Funciones
- Dashboard con métricas del jugador.
- Catálogo de videojuegos con filtros.
- Biblioteca con progreso, horas y estado.
- Lista de deseos.
- Logros y simulación de desbloqueo.
- XP y nivel de jugador.
- Torneos con cupos y registro/cancelación.
- Reseñas comunitarias.
- Notificaciones.
- Actividad reciente.
- Arquitectura visual de servicios.
- Prueba real del endpoint /api/health.

## Arquitectura
Frontend SPA -> API REST -> Servicios especializados -> Persistencia JSON

## Ejecutar
1. Abre PowerShell dentro de la carpeta del proyecto.
2. Ejecuta:
   npm start
3. Abre:
   http://localhost:3000

No requiere instalar paquetes externos. Utiliza módulos nativos de Node.js.

## Endpoints principales
GET    /api/health
GET    /api/dashboard
GET    /api/analytics
GET    /api/games
GET    /api/games/:id
GET    /api/library
POST   /api/library
PUT    /api/library/:gameId
DELETE /api/library/:gameId
GET    /api/wishlist
POST   /api/wishlist/toggle
GET    /api/achievements
POST   /api/achievements/:id/unlock
GET    /api/tournaments
POST   /api/tournaments/:id/register
POST   /api/tournaments/:id/unregister
GET    /api/reviews
POST   /api/reviews
GET    /api/profile
PUT    /api/profile
GET    /api/notifications
POST   /api/notifications/read-all
