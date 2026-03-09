# PRD - Road Fighter

**Product Owner:** NexusPO  
**Proyecto:** Road Fighter (inspirado en Konami 1984)  
**Fecha:** 2026-03-09  
**Versión:** 1.0

---

## 🎯 Visión del Producto

**Road Fighter** es un juego de carreras retro 2D con vista superior/top-down, playable desde el navegador web (desktop + móvil). El objetivo es simple: conducir lo más lejos posible esquivando obstáculos antes de quedarte sin gasolina o estrellarte.

**Propuesta de valor:** Nostalgia arcade + accesibilidad web instantánea (sin descargas, sin plugins).

---

## 👥 Target Users

| Segmento | Descripción | Necesidad |
|----------|-------------|-----------|
| **Retro gamers** | 30-50 años, jugaban arcades en los 80s | Revivir la experiencia clásica |
| **Casual players** | Usuarios móviles en tránsito | Matarse el tiempo con algo divertido |
| **Devs curiosos** | Interesados en game dev web | Ver qué se puede hacer con Canvas |

---

## 🎮 Mecánicas Core

### Fase 1 - Core Loop (MVP)

| Mecánica | Descripción | Prioridad |
|----------|-------------|-----------|
| **Scroll vertical** | Carretera con scroll infinito hacia arriba | 🔴 MUST |
| **Movimiento jugador** | Coche se mueve izq/der (no acelera/frena) | 🔴 MUST |
| **Obstáculos estáticos** | Coches parados, conos, barreras | 🔴 MUST |
| **Colisiones** | Tocar obstáculo = game over instantáneo | 🔴 MUST |
| **Score/distancia** | Medidor de metros recorridos | 🔴 MUST |
| **Game Over + Restart** | Pantalla final con score y botón reiniciar | 🔴 MUST |

### Fase 2 - Polish (Stretch)

| Mecánica | Descripción | Prioridad |
|----------|-------------|-----------|
| **Sistema gasolina** | Tanque que se vacía, pickups para rellenar | 🟡 SHOULD |
| **Coches enemigos móviles** | Vehículos que cambian de carril | 🟡 SHOULD |
| **Efecto aceite** | Zonas que causan derrape (pérdida control) | 🟡 SHOULD |
| **Velocidad progresiva** | El juego acelera con el tiempo | 🟡 SHOULD |
| **Sprites pixel art** | Gráficos retro 16-bit style | 🟡 SHOULD |

### Fase 3 - Juice (Nice to have)

| Mecánica | Descripción | Prioridad |
|----------|-------------|-----------|
| **Efectos sonido** | Motor, choque, pickup gasolina | 🟢 COULD |
| **Partículas** | Humo, chispas al colisionar | 🟢 COULD |
| **Pantalla título** | Intro con "Press Start" | 🟢 COULD |
| **High score persistente** | Guardar mejor marca en localStorage | 🟢 COULD |

---

## 🔧 Requisitos Técnicos

### Stack Tecnológico

```
Frontend:    HTML5 Canvas + JavaScript vanilla (sin frameworks)
Deploy:      GitHub Pages (o Netlify/Vercel)
Responsive:  CSS media queries + viewport meta tag
Controles:   Dual input (teclado + touch)
```

### Plataformas Soportadas

| Plataforma | Controles | Prioridad |
|------------|-----------|-----------|
| Desktop (Chrome/Firefox/Safari) | Flechas izq/der o A/D | 🔴 MUST |
| Mobile (iOS/Android) | Touch izq/der en pantalla | 🔴 MUST |
| Tablet | Touch izq/der en pantalla | 🟡 SHOULD |

### Performance Targets

- **FPS:** 60fps estable en dispositivos medios
- **Load time:** < 3 segundos en 3G
- **Bundle size:** < 500KB total (assets + code)

---

## 🎨 Dirección Artística

**Estilo:** Pixel art retro 16-bit (inspirado en NES/SNES era)  
**Paleta:** Colores vibrantes pero limitados (máx 32 colores)  
**Animaciones:** Minimalistas pero fluidas (3-4 frames por acción)

**Referencias visuales:**
- Road Fighter (Konami 1984)
- Out Run (Sega 1986)
- Pole Position (Namco 1982)

---

## 📐 Game Design

### Vista de Juego

```
+---------------------------+
|      SCORE: 1250m         |  <- HUD superior
|      GAS: [||||||    ]    |
+---------------------------+
|                           |
|      |             |      |
|      |    🚗       |      |  <- Carretera con bordes
|      |      🚙     |      |
|      |  🚗         |      |  <- Obstáculos
|      |        🚙   |      |
|      |             |      |
|      |    🚗       |      |
|      |             |      |
|          [PLAYER]         |  <- Coche jugador (bottom center)
|   [◄]           [►]       |  <- Controles touch (móvil)
+---------------------------+
```

### Controles

**Desktop:**
- `←` / `A`: Mover izquierda
- `→` / `D`: Mover derecha
- `Space`: Reiniciar (en Game Over)

**Mobile:**
- Touch zona izquierda: Mover izquierda
- Touch zona derecha: Mover derecha
- Botón "Restart": Reiniciar (en Game Over)

### Dificultad Progresiva

| Fase | Velocidad scroll | Densidad obstáculos | Gasolina |
|------|------------------|---------------------|----------|
| 0-500m | Lento (200px/s) | Baja (1 obstáculo/2s) | N/A (Fase 1) |
| 500-1000m | Medio (300px/s) | Media (1 obstáculo/1.5s) | N/A |
| 1000m+ | Rápido (400px/s) | Alta (1 obstáculo/1s) | N/A |

*(Fase 2 añadirá gasolina como mecánica de presión adicional)*

---

## 🚀 Roadmap

### Sprint 1 - Fase 1 (Core Loop)

**Duración estimada:** 1-2 semanas  
**Objetivo:** MVP jugable con loop básico

**Entregables:**
1. Canvas con scroll vertical infinito
2. Sprite coche jugador con movimiento izq/der
3. Obstáculos estáticos generados proceduralmente
4. Sistema colisiones (AABB o pixel-perfect)
5. HUD con score/distancia
6. Pantalla Game Over con restart

**Definition of Done:**
- [ ] Jugable en desktop (Chrome/Firefox)
- [ ] Jugable en móvil (touch controls)
- [ ] Deploy funcionando en GitHub Pages
- [ ] Txomin valida "se siente bien"
- [ ] TicoQA confirma bugs blocking = 0

---

### Sprint 2 - Fase 2 (Polish)

**Duración estimada:** 1-2 semanas  
**Objetivo:** Añadir profundidad y variedad

**Entregables:**
1. Sistema gasolina + pickups
2. Coches enemigos con IA básica (cambian carril)
3. Zonas aceite (derrapes)
4. Velocidad progresiva
5. Sprites pixel art finales (ChispArt)

---

### Sprint 3 - Fase 3 (Juice)

**Duración estimada:** 1 semana  
**Objetivo:** Pulir experiencia

**Entregables:**
1. Efectos sonido (motor, choque, pickup)
2. Sistema partículas
3. Pantalla título animada
4. High score persistente (localStorage)

---

## ✅ Criterios de Aceptación Globales

### Must Have (MVP = Fase 1)

- [ ] El juego carga en < 3 segundos en 3G
- [ ] Funciona a 60fps en desktop medio
- [ ] Controles responsivos (< 100ms lag)
- [ ] Colisiones consistentes (no falsos positivos/negativos)
- [ ] Game Over clara y reinicio funcional
- [ ] Score se actualiza en tiempo real
- [ ] Touch controls funcionan en iOS + Android
- [ ] Deploy automático en GitHub Pages

### Should Have (Fase 2)

- [ ] Gasolina añade tensión sin frustrar
- [ ] Enemigos móviles son predecibles pero desafiantes
- [ ] Aceite causa derrape visualmente claro
- [ ] Curva dificultad progresiva pero justa

### Could Have (Fase 3)

- [ ] Sonidos mejoran feedback sin molestar
- [ ] Partículas no afectan performance
- [ ] High score persiste entre sesiones

---

## 🚫 Out of Scope (v1.0)

- ❌ Multijugador
- ❌ Leaderboards online
- ❌ Microtransacciones
- ❌ PWA con offline mode
- ❌ Múltiples vehículos seleccionables
- ❌ Pistas alternativas
- ❌ Modo historia

---

## 📊 Métricas de Éxito

| Métrica | Target | Cómo medir |
|---------|--------|------------|
| **Play rate** | > 50% visitantes juegan > 1 partida | Analytics events |
| **Retención** | > 20% vuelve a jugar en 24h | localStorage timestamp |
| **Session duration** | > 3 minutos promedio | Analytics events |
| **Mobile share** | > 40% partidas en móvil | User agent analysis |

---

## 👥 Equipo & Responsabilidades

| Rol | Agente | Responsabilidad |
|-----|--------|-----------------|
| **Product Owner** | NexusPO | PRD, backlog, priorización |
| **Coordinator** | BuboCord | Sprint planning, blockers |
| **Developer** | GizmoDev | Implementación técnica |
| **Graphist** | ChispArt | Sprites, UI, efectos |
| **QA** | TicoQA | Testing formal, bug reports |
| **Validador Final** | Txomin | "Fun factor" validation |

---

## 📝 Notas Adicionales

1. **Validación humana crítica:** Txomin es el único que puede aprovar "se siente bien". Sin su OK, no hay Done.
2. **Deploy continuo:** Cada merge a main = deploy automático a GitHub Pages.
3. **Comunicación:** Todo el equipo coordina en Discord #project-coordination.
4. **Bug priority:** Bugs blocking > features nuevas. Siempre.
5. **Scope creep:** Fase 2 y 3 son stretch. Si Fase 1 se complica, recortar Fase 2/3.

---

## 📚 Referencias

- [Road Fighter (Wikipedia)](https://en.wikipedia.org/wiki/Road_Fighter)
- [HTML5 Canvas Game Tutorial](https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript)
- [Pixel Art Basics](https://www.spritedisk.com/tutorials/pixel-art-basics/)

---

**Documento creado por:** NexusPO  
**Última actualización:** 2026-03-09  
**Próxima revisión:** Post-Sprint 1 retrospective
