# Fase 5: Sistema de Eventos Narrativos Avanzados

## ✅ Completado

### 1. Sistema de Tipos Expandido (`src/data/events.ts`)

**Nuevos tipos:**
- `EventCategory`: Categorías de eventos (economic, political, social, diplomatic, disaster, scandal, storyline)
- `EventCondition`: Condiciones complejas para activación contextual
  - Condiciones económicas: gdpMin/Max, unemploymentMin/Max, inflationMin/Max
  - Condiciones políticas: popularityMin/Max, stabilityMin/Max
  - Condiciones de ministros: hasMinisterWithTrait, ministerCount
  - Condiciones sociales: anyProtestActive, socialTensionMin
  - Condiciones de historia: storyVars, eventHistoryIncludes/Excludes
  - Condiciones temporales: monthsSinceGameStart
  - Función custom: customCheck()

- `EventConsequence`: Consecuencias detalladas
  - `immediate`: Efectos instantáneos (budget, politicalCapital, stability, popularity, humanRights)
  - `delayed`: Eventos que se activan en el futuro (eventId, turnsDelay)
  - `storyVars`: Variables de historia que persisten
  - `approvalModifiers`: Cambios en grupos de interés con duración
  - `hidden`: Efectos secretos que el jugador descubrirá

- `EventChoice`: Elecciones con requisitos
  - `requirements`: Budget, politicalCapital, ministers, storyVars necesarios
  - `consequences`: EventConsequence aplicada
  - `tooltip`: Advertencias adicionales

- `Storyline`, `StorylineStage`, `StorylineEnding`: Para historias ramificadas multi-etapa
- `ActiveStoryline`: Estado de storylines en progreso

### 2. Motor Storyteller (`src/systems/storyteller.ts`)

**Funciones implementadas:**

#### `evaluateCondition(condition, state)`
Evalúa condiciones complejas:
```typescript
condition: {
    inflationMin: 0.08,
    popularityMax: 60,
    hasMinisterWithTrait: 'Corrupt',
    storyVars: { suppressed_transport_strike: true }
}
```

#### `selectContextualEvent(state)`
Sistema principal que:
1. Verifica eventos demorados (delayed events)
2. Genera escándalos ministeriales (10% chance)
3. Selecciona eventos contextuales elegibles
4. Pondera por weight y retorna el mejor

#### `applyConsequences(consequence, state)`
Aplica efectos de una elección:
- Efectos inmediatos en resources/stats
- Actualiza storyVars
- Registra delayed events
- Maneja approval modifiers

#### `generateMinisterialScandal(state)`
Genera escándalos basados en traits de ministros:
- **Corrupt** → Escándalo de corrupción
- **Incompetent** → Declaración vergonzosa
- Usa ministry y name del ministro real

#### `checkDelayedEvents(state)`
Verifica eventos programados:
- Decrementa turnsRemaining
- Activa eventos cuando triggersIn <= 0
- Limpia eventos activados

#### `progressStoryline(storyline, definition, state)`
Avanza storylines multi-etapa:
- Verifica advanceCondition
- Maneja autoAdvance
- Retorna nextStage

### 3. Integración GameContext

**Nuevos campos en GameState:**
```typescript
{
    storyVars: { [key: string]: any },        // Variables de historia
    eventHistory: string[],                    // IDs de eventos ocurridos
    delayedEvents: Array<{                     // Eventos programados
        eventId: string;
        triggersIn: number;
    }>,
    activeStorylines: Array<{                  // Storylines activas
        storylineId: string;
        currentStage: number;
        startedAt: Date;
        storyVars: { [key: string]: any };
    }>,
    emergencyMode: {                           // Modo de emergencia
        active: boolean;
        type?: 'earthquake' | 'flood' | 'pandemic' | 'drought';
        severity?: number;
        turnsRemaining?: number;
    },
    ministers: Minister[],                     // Alias para storyteller
    date: { month: number; year: number }      // Alias para storyteller
}
```

**TICK_MONTH actualizado:**
- Crea `stateWithAliases` para storyteller
- Verifica `checkDelayedEvents()`
- Llama `selectContextualEvent()` (15% chance mensual)
- Actualiza `delayedEvents` y `eventHistory`

**RESOLVE_EVENT actualizado:**
- Detecta sistema nuevo (`consequences`) vs viejo (`effect`)
- Usa `applyConsequences()` para eventos nuevos
- Mantiene compatibilidad con eventos viejos
- Registra evento en `eventHistory`

### 4. Eventos Narrativos Creados

#### 📊 Económicos
- **strike_transport**: Huelga con 3 opciones (negociar, reprimir, subsidiar)
  - Reprimir → activa `union_revenge` delayed 3 turnos
- **tech_boom**: Auge tecnológico con subsidios
  - Subsidiar → activa `tech_sector_success` delayed 6 turnos

#### 💰 Escándalos
- **minister_corruption_scandal**: Generado dinámicamente por ministros Corrupt
  - Despedir inmediatamente (popularidad +)
  - Encubrir (arriesgado, puede reaparecer)
  - Investigación pública (transparencia)

#### 🌍 Diplomáticos
- **border_tension**: Tensión fronteriza
  - Movilizar tropas → activa `border_conflict_escalates`
  - Negociar diplomáticamente (pacífico)

#### 🌪️ Desastres
- **earthquake**: Terremoto magnitud 7.8
  - Movilizar ayuda (100B required)
  - Solicitar ayuda internacional (+50B)
  - Respuesta mínima → activa `earthquake_aftermath_crisis`

#### ⛓️ Cadenas
- **union_revenge**: Activado si reprimiste strike_transport
  - Paro general coordinado
  - Negociar finalmente
  - Represión total → activa `international_condemnation`

### 5. Características Clave

**✨ Eventos Contextuales:**
```typescript
condition: {
    inflationMin: 0.08,           // Solo si inflación > 8%
    popularityMax: 60,            // Y popularidad < 60%
}
```

**⏱️ Eventos Demorados:**
```typescript
delayed: {
    eventId: 'union_revenge',     // Se activa en el futuro
    turnsDelay: 3                 // Después de 3 meses
}
```

**🧠 Variables de Historia:**
```typescript
storyVars: {
    negotiated_transport_strike: true,  // Recuerda tus decisiones
    fired_corrupt_minister: true
}
```

**🎯 Requisitos de Elección:**
```typescript
requirements: {
    budget: 100,                  // Necesitas 100B
    politicalCapital: 20,         // Y 20 capital político
    ministers: ['minister_id']    // Y este ministro específico
}
```

**👥 Efectos en Grupos:**
```typescript
approvalModifiers: [
    { groupId: 'unions', modifier: 15, duration: 6 },      // +15 durante 6 meses
    { groupId: 'business', modifier: -5, duration: 3 }     // -5 durante 3 meses
]
```

**🎲 Escándalos Dinámicos:**
- 10% chance mensual de escándalo ministerial
- Basado en `traitIds` de ministros reales
- Usa nombre y ministry del ministro

**📊 Sistema de Pesos:**
```typescript
weight: 0.3  // 30% de probabilidad relativa
```

## 🔧 Uso del Sistema

### Crear un Evento Nuevo

```typescript
{
    id: 'my_event',
    title: 'Mi Evento',
    description: 'Descripción detallada',
    category: 'economic',
    condition: {
        gdpMin: 100,
        popularityMax: 50,
        storyVars: { some_flag: true }
    },
    weight: 1,
    choices: [
        {
            label: 'Opción 1',
            description: 'Qué pasa si elijo esto',
            requirements: {
                budget: 50
            },
            consequences: {
                immediate: {
                    budget: -50,
                    popularity: 10
                },
                delayed: {
                    eventId: 'consequence_event',
                    turnsDelay: 2
                },
                storyVars: {
                    chose_option_1: true
                }
            }
        }
    ]
}
```

### Crear una Cadena de Eventos

1. Evento inicial con delayed consequence
2. Evento de cadena con condition en storyVars
3. Posibles ramificaciones adicionales

```typescript
// Evento 1
delayed: {
    eventId: 'event_2',
    turnsDelay: 3
}

// Evento 2
condition: {
    storyVars: { event_1_happened: true }
}
```

## 🎯 Próximos Pasos

### ⏳ Pendientes

1. **EventModal Mejorado** (⚠️ TODO)
   - Mostrar requirements visualmente
   - Indicar delayed effects con "???"
   - Categorías con iconos
   - Tooltips expandidos

2. **Storylines Ramificadas** (⚠️ TODO)
   - Carpeta `data/storylines/`
   - Storyline de rebelión multi-etapa
   - Múltiples finales alternativos
   - Sistema de "acumuladores ocultos"

3. **Sistema de Emergencias** (⚠️ TODO)
   - UI especial para desastres
   - Asignación de presupuesto de emergencia
   - Modo emergencia activo
   - Success/failure según respuesta

4. **Testing y Balanceo** (⚠️ TODO)
   - Probar todos los eventos contextuales
   - Verificar delayed events
   - Testear escándalos ministeriales
   - Balancear probabilidades (actualmente 15% mensual)
   - Verificar persistencia de storyVars

## 📈 Estadísticas

- **Archivos creados:** 1 (storyteller.ts)
- **Archivos modificados:** 3 (events.ts, GameContext.tsx, social.ts)
- **Nuevos tipos:** 8 interfaces/types
- **Funciones nuevas:** 6 en storyteller
- **Eventos narrativos:** 7 eventos complejos
- **Eventos de cadena:** 1 (union_revenge)
- **Build time:** 16.92s
- **Bundle size:** 1,454 kB (201 kB gzipped)

## 🎮 Gameplay Impact

**Antes (Fase 4):**
- Eventos aleatorios sin contexto
- Sin memoria de decisiones
- Sin consecuencias a largo plazo
- Sistema reactivo simple

**Ahora (Fase 5):**
- ✨ Eventos que responden al estado del juego
- 🧠 El juego recuerda tus decisiones
- ⏱️ Consecuencias que aparecen meses después
- 🎭 Escándalos basados en ministros reales
- ⛓️ Cadenas de eventos interconectados
- 🎯 Elecciones con requisitos
- 📊 Efectos graduados en grupos de interés

**El simulador ahora es un generador de historias.**
