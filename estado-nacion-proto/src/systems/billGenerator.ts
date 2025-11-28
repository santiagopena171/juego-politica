import type { GameState } from '../context/GameContext';
import type { Minister, MinistryType } from '../types/politics';
import type { BillProposal } from '../types/messaging';
import type { Bill } from '../types/parliament';

// Plantillas de proyectos de ley por ministerio
const BILL_TEMPLATES: Record<MinistryType, Array<{
    titleTemplate: string;
    descriptionTemplate: string;
    effects: any;
    contextCheck?: (state: GameState) => boolean;
}>> = {
    'Economy': [
        {
            titleTemplate: 'Reforma Tributaria para {sector}',
            descriptionTemplate: 'Ajustar la carga impositiva del sector {sector} para {objetivo}.',
            effects: { budgetChange: 50, gdpImpact: 0.1 },
            contextCheck: (state: GameState) => state.stats.inflation > 5
        },
        {
            titleTemplate: 'Plan de Estímulo Económico',
            descriptionTemplate: 'Inyectar {amount} millones en infraestructura y subsidios para reactivar la economía.',
            effects: { budgetChange: -200, employmentChange: 2 },
            contextCheck: (state: GameState) => state.stats.unemployment > 8
        },
        {
            titleTemplate: 'Ley de Competencia y Mercados',
            descriptionTemplate: 'Regular monopolios y promover la competencia en sectores clave.',
            effects: { gdpImpact: 0.2, popularityChange: 5 },
        },
        {
            titleTemplate: 'Incentivos Fiscales para Inversión Extranjera',
            descriptionTemplate: 'Reducir impuestos corporativos para atraer inversión internacional.',
            effects: { gdpImpact: 0.3, budgetChange: -30 },
        },
        {
            titleTemplate: 'Reforma del Sistema Bancario',
            descriptionTemplate: 'Regular tasas de interés y proteger a consumidores de prácticas abusivas.',
            effects: { popularityChange: 8, stabilityChange: 3 },
            contextCheck: (state: GameState) => state.resources.stability < 60
        }
    ],
    'Health': [
        {
            titleTemplate: 'Ampliación de Cobertura Hospitalaria',
            descriptionTemplate: 'Construir {number} nuevos hospitales en zonas rurales y suburbanas.',
            effects: { budgetChange: -150, popularityChange: 10 },
            contextCheck: (state: GameState) => state.stats.population > 10_000_000
        },
        {
            titleTemplate: 'Programa Nacional de Vacunación',
            descriptionTemplate: 'Implementar campaña masiva de vacunación contra enfermedades prevenibles.',
            effects: { budgetChange: -80, popularityChange: 7 },
        },
        {
            titleTemplate: 'Ley de Medicamentos Genéricos',
            descriptionTemplate: 'Reducir precios de medicamentos esenciales mediante producción local de genéricos.',
            effects: { popularityChange: 12, budgetChange: -50 },
        },
        {
            titleTemplate: 'Reforma de Salud Mental',
            descriptionTemplate: 'Crear centros especializados y programas de prevención de salud mental.',
            effects: { budgetChange: -100, popularityChange: 6 },
        },
        {
            titleTemplate: 'Regulación de Seguros Médicos Privados',
            descriptionTemplate: 'Establecer topes de precios y cobertura mínima obligatoria.',
            effects: { popularityChange: 8, stabilityChange: -2 },
        }
    ],
    'Education': [
        {
            titleTemplate: 'Plan Nacional de Alfabetización',
            descriptionTemplate: 'Erradicar el analfabetismo mediante programas intensivos en zonas marginadas.',
            effects: { budgetChange: -120, popularityChange: 8 },
        },
        {
            titleTemplate: 'Gratuidad Universitaria',
            descriptionTemplate: 'Eliminar aranceles en universidades públicas para estudiantes de bajos recursos.',
            effects: { budgetChange: -200, popularityChange: 15 },
        },
        {
            titleTemplate: 'Programa de Becas Internacionales',
            descriptionTemplate: 'Financiar estudios de postgrado en el extranjero para estudiantes destacados.',
            effects: { budgetChange: -90, popularityChange: 5 },
        },
        {
            titleTemplate: 'Modernización Tecnológica Escolar',
            descriptionTemplate: 'Equipar escuelas con computadoras, internet y laboratorios.',
            effects: { budgetChange: -150, popularityChange: 9 },
        },
        {
            titleTemplate: 'Ley de Carrera Docente',
            descriptionTemplate: 'Aumentar salarios y beneficios para maestros, con evaluación de desempeño.',
            effects: { budgetChange: -180, popularityChange: 7, stabilityChange: 3 },
        }
    ],
    'Defense': [
        {
            titleTemplate: 'Modernización del Equipamiento Militar',
            descriptionTemplate: 'Adquirir armamento y tecnología de defensa de última generación.',
            effects: { budgetChange: -300, militaryStrength: 15 },
            contextCheck: (state: GameState) => state.resources.stability < 60
        },
        {
            titleTemplate: 'Reforma del Servicio Militar',
            descriptionTemplate: 'Implementar servicio militar obligatorio de {months} meses.',
            effects: { militaryStrength: 10, popularityChange: -8 },
        },
        {
            titleTemplate: 'Programa de Ciberseguridad Nacional',
            descriptionTemplate: 'Crear unidad élite de defensa cibernética contra amenazas digitales.',
            effects: { budgetChange: -100, stabilityChange: 5 },
        },
        {
            titleTemplate: 'Alianzas Estratégicas de Defensa',
            descriptionTemplate: 'Negociar acuerdos de cooperación militar con países aliados.',
            effects: { diplomaticImpact: 10 },
        },
        {
            titleTemplate: 'Ley de Veteranos',
            descriptionTemplate: 'Garantizar pensiones, salud y empleo para ex-militares.',
            effects: { budgetChange: -70, militaryLoyalty: 15, popularityChange: 4 },
        }
    ],
    'Interior': [
        {
            titleTemplate: 'Reforma Policial Integral',
            descriptionTemplate: 'Aumentar salarios policiales, capacitación y equipamiento contra el crimen.',
            effects: { budgetChange: -160, stabilityChange: 8 },
            contextCheck: (state: GameState) => state.resources.stability < 50
        },
        {
            titleTemplate: 'Ley de Seguridad Ciudadana',
            descriptionTemplate: 'Endurecer penas por crímenes violentos y crear patrullajes preventivos.',
            effects: { stabilityChange: 10, humanRightsChange: -5 },
        },
        {
            titleTemplate: 'Plan de Descentralización Administrativa',
            descriptionTemplate: 'Otorgar mayor autonomía a gobiernos regionales y municipales.',
            effects: { stabilityChange: 5, popularityChange: 6 },
        },
        {
            titleTemplate: 'Programa Nacional de Emergencias',
            descriptionTemplate: 'Crear sistema integrado de respuesta ante desastres naturales.',
            effects: { budgetChange: -110, stabilityChange: 7 },
        },
        {
            titleTemplate: 'Ley contra la Corrupción',
            descriptionTemplate: 'Establecer tribunal especial y penas severas para funcionarios corruptos.',
            effects: { popularityChange: 12, stabilityChange: -3 },
        }
    ],
    'Foreign': [
        {
            titleTemplate: 'Apertura de Embajadas en {region}',
            descriptionTemplate: 'Establecer representación diplomática en países estratégicos de {region}.',
            effects: { budgetChange: -80, diplomaticImpact: 8 },
        },
        {
            titleTemplate: 'Tratado de Libre Comercio con {country}',
            descriptionTemplate: 'Negociar acuerdo comercial que elimine aranceles y facilite inversiones.',
            effects: { gdpImpact: 0.2, diplomaticImpact: 10 },
        },
        {
            titleTemplate: 'Programa de Cooperación Internacional',
            descriptionTemplate: 'Enviar ayuda humanitaria y técnica a países en desarrollo.',
            effects: { budgetChange: -60, diplomaticImpact: 12 },
        },
        {
            titleTemplate: 'Ley de Protección Consular',
            descriptionTemplate: 'Reforzar asistencia a ciudadanos en el extranjero.',
            effects: { budgetChange: -40, popularityChange: 5 },
        },
        {
            titleTemplate: 'Adhesión a Organismo Multilateral',
            descriptionTemplate: 'Solicitar membresía en bloque económico regional.',
            effects: { diplomaticImpact: 15, gdpImpact: 0.1 },
        }
    ],
    'Infrastructure': [
        {
            titleTemplate: 'Plan Nacional de Carreteras',
            descriptionTemplate: 'Construir y reparar {km} kilómetros de autopistas y rutas nacionales.',
            effects: { budgetChange: -250, gdpImpact: 0.15 },
        },
        {
            titleTemplate: 'Modernización del Sistema Ferroviario',
            descriptionTemplate: 'Renovar trenes y vías para transporte de carga y pasajeros.',
            effects: { budgetChange: -300, employmentChange: 3 },
        },
        {
            titleTemplate: 'Expansión de Red de Telecomunicaciones',
            descriptionTemplate: 'Instalar fibra óptica y 5G en zonas rurales.',
            effects: { budgetChange: -180, popularityChange: 8 },
        },
        {
            titleTemplate: 'Obras Hídricas y Saneamiento',
            descriptionTemplate: 'Construir plantas de tratamiento y sistemas de alcantarillado.',
            effects: { budgetChange: -200, popularityChange: 10 },
        },
        {
            titleTemplate: 'Programa de Vivienda Social',
            descriptionTemplate: 'Construir {number} viviendas para familias de bajos ingresos.',
            effects: { budgetChange: -220, popularityChange: 14 },
        }
    ],
    'Environment': [
        {
            titleTemplate: 'Ley de Protección de Bosques Nativos',
            descriptionTemplate: 'Prohibir tala indiscriminada y crear reservas naturales.',
            effects: { popularityChange: 6, gdpImpact: -0.05 },
        },
        {
            titleTemplate: 'Transición a Energías Renovables',
            descriptionTemplate: 'Invertir en plantas solares, eólicas y geotérmicas.',
            effects: { budgetChange: -280, gdpImpact: 0.1 },
        },
        {
            titleTemplate: 'Ley de Gestión de Residuos',
            descriptionTemplate: 'Implementar reciclaje obligatorio y economía circular.',
            effects: { budgetChange: -90, popularityChange: 7 },
        },
        {
            titleTemplate: 'Prohibición de Plásticos de Un Solo Uso',
            descriptionTemplate: 'Eliminar bolsas, sorbetes y envases plásticos no biodegradables.',
            effects: { popularityChange: 5, gdpImpact: -0.02 },
        },
        {
            titleTemplate: 'Plan de Reforestación Nacional',
            descriptionTemplate: 'Plantar {millions} millones de árboles en los próximos 5 años.',
            effects: { budgetChange: -120, popularityChange: 9 },
        }
    ]
};

const SECTORS = ['tecnológico', 'agrícola', 'industrial', 'minero', 'turístico', 'financiero'];
const OBJECTIVES = ['estimular el crecimiento', 'redistribuir la riqueza', 'controlar la inflación', 'atraer inversión'];
const REGIONS = ['Asia', 'Europa', 'África', 'Oceanía', 'Medio Oriente'];

export function generateMinisterProposals(minister: Minister, state: GameState): BillProposal[] {
    const templates = BILL_TEMPLATES[minister.ministry] || [];
    
    // Filtrar templates relevantes según contexto
    const relevantTemplates = templates.filter(template => 
        !template.contextCheck || template.contextCheck(state)
    );

    // Mezclar y seleccionar 3 propuestas
    const shuffled = relevantTemplates.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(3, shuffled.length));

    return selected.map((template, index) => {
        const title = template.titleTemplate
            .replace('{sector}', SECTORS[Math.floor(Math.random() * SECTORS.length)])
            .replace('{objetivo}', OBJECTIVES[Math.floor(Math.random() * OBJECTIVES.length)])
            .replace('{amount}', (100 + Math.floor(Math.random() * 400)).toString())
            .replace('{number}', (3 + Math.floor(Math.random() * 7)).toString())
            .replace('{months}', (6 + Math.floor(Math.random() * 13)).toString())
            .replace('{region}', REGIONS[Math.floor(Math.random() * REGIONS.length)])
            .replace('{country}', state.diplomacy.countries[Math.floor(Math.random() * Math.min(5, state.diplomacy.countries.length))]?.name || 'países vecinos');

        const description = template.descriptionTemplate
            .replace('{sector}', SECTORS[Math.floor(Math.random() * SECTORS.length)])
            .replace('{objetivo}', OBJECTIVES[Math.floor(Math.random() * OBJECTIVES.length)])
            .replace('{amount}', (100 + Math.floor(Math.random() * 400)).toString())
            .replace('{number}', (3 + Math.floor(Math.random() * 7)).toString())
            .replace('{months}', (6 + Math.floor(Math.random() * 13)).toString())
            .replace('{region}', REGIONS[Math.floor(Math.random() * REGIONS.length)])
            .replace('{country}', state.diplomacy.countries[Math.floor(Math.random() * Math.min(5, state.diplomacy.countries.length))]?.name || 'países vecinos');

        // Generar reasoning contextual
        const reasoning = generateReasoning(minister.ministry, state);
        const expectedImpact = generateExpectedImpact(template.effects);

        const billProposal: BillProposal = {
            id: `bill_${minister.id}_${Date.now()}_${index}`,
            title,
            description,
            type: 'reform' as any,
            policyArea: 'economic' as any,
            effects: template.effects,
            proposedBy: 'government',
            ministerId: minister.id,
            status: 'pending',
            votes: { yes: 0, no: 0, abstain: 0 },
            requiredMajority: 50,
            urgency: 'medium',
            dateProposed: new Date(),
            reasoning,
            expectedImpact,
            estimatedCost: template.effects.budgetChange ? Math.abs(template.effects.budgetChange) : undefined,
            requiredSupport: 50 + Math.floor(Math.random() * 20)
        };

        return billProposal;
    });
}

function generateReasoning(ministry: MinistryType, state: GameState): string {
    const reasons: Record<MinistryType, string[]> = {
        'Economy': [
            `Con una inflación del ${state.stats.inflation.toFixed(1)}%, es urgente tomar medidas correctivas.`,
            `El PIB actual de $${state.stats.gdp.toFixed(2)}T requiere políticas de estímulo.`,
            `La situación económica demanda acciones inmediatas para proteger el empleo.`
        ],
        'Health': [
            `El sistema de salud está saturado y necesita inversión urgente.`,
            `La población merece acceso universal a servicios médicos de calidad.`,
            `Prevenir es mejor que curar: esta inversión salvará vidas y dinero.`
        ],
        'Education': [
            `El futuro del país depende de la educación de nuestros jóvenes.`,
            `La brecha educativa perpetúa la desigualdad social.`,
            `Invertir en educación es invertir en desarrollo a largo plazo.`
        ],
        'Defense': [
            `La seguridad nacional no es negociable ante las amenazas actuales.`,
            `Nuestras fuerzas armadas requieren modernización para proteger la soberanía.`,
            `Un país fuerte militarmente es un país respetado internacionalmente.`
        ],
        'Interior': [
            `La inseguridad ciudadana exige respuesta contundente del Estado.`,
            `El orden público es prerequisito para el desarrollo económico.`,
            `Los ciudadanos merecen vivir sin temor en sus propias calles.`
        ],
        'Foreign': [
            `En un mundo globalizado, el aislamiento es suicidio económico.`,
            `Nuestros intereses nacionales se defienden mejor con alianzas sólidas.`,
            `La diplomacia es la primera línea de defensa de la nación.`
        ],
        'Infrastructure': [
            `La infraestructura moderna es el motor del desarrollo económico.`,
            `Sin carreteras y servicios básicos, no hay progreso posible.`,
            `Invertir en infraestructura es apostar por el futuro del país.`
        ],
        'Environment': [
            `El cambio climático es la mayor amenaza de nuestro tiempo.`,
            `Proteger el ambiente es proteger nuestra propia supervivencia.`,
            `Las generaciones futuras nos juzgarán por nuestras decisiones ambientales.`
        ]
    };

    const ministerReasons = reasons[ministry] || [`Como ministro de ${ministry}, considero esta medida esencial.`];
    return ministerReasons[Math.floor(Math.random() * ministerReasons.length)];
}

function generateExpectedImpact(effects: any): string {
    const impacts: string[] = [];
    
    if (effects.budgetChange) {
        impacts.push(`Impacto fiscal: ${effects.budgetChange > 0 ? '+' : ''}$${Math.abs(effects.budgetChange)}B`);
    }
    if (effects.popularityChange) {
        impacts.push(`Popularidad: ${effects.popularityChange > 0 ? '+' : ''}${effects.popularityChange}%`);
    }
    if (effects.stabilityChange) {
        impacts.push(`Estabilidad: ${effects.stabilityChange > 0 ? '+' : ''}${effects.stabilityChange}%`);
    }
    if (effects.gdpImpact) {
        impacts.push(`PIB: +${(effects.gdpImpact * 100).toFixed(1)}%`);
    }
    if (effects.employmentChange) {
        impacts.push(`Desempleo: ${effects.employmentChange > 0 ? '-' : '+'}${Math.abs(effects.employmentChange)}%`);
    }

    return impacts.length > 0 ? impacts.join(', ') : 'Impactos múltiples en diversos sectores';
}
