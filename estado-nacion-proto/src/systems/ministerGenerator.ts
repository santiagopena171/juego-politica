import type { Minister, MinistryType, Ideology } from '../types/politics';
import { selectTraitsForMinister, type MinisterTrait } from '../types/ministerTraits';

const FIRST_NAMES_M = [
    'Juan', 'Carlos', 'Luis', 'Pedro', 'Miguel', 'José', 'Fernando', 'Ricardo', 'Diego', 'Andrés',
    'Rafael', 'Jorge', 'Alberto', 'Francisco', 'Antonio', 'Javier', 'Manuel', 'Roberto', 'Eduardo', 'Mario',
    'Gustavo', 'Raúl', 'Sergio', 'Pablo', 'Héctor'
];

const FIRST_NAMES_F = [
    'María', 'Ana', 'Elena', 'Sofía', 'Lucía', 'Carmen', 'Laura', 'Isabel', 'Patricia', 'Mónica',
    'Gabriela', 'Andrea', 'Cristina', 'Verónica', 'Beatriz', 'Claudia', 'Silvia', 'Teresa', 'Rosa', 'Julia',
    'Natalia', 'Valeria', 'Diana', 'Fernanda', 'Adriana'
];

const LAST_NAMES = [
    'García', 'Rodríguez', 'Martínez', 'Hernández', 'López', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres',
    'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Reyes', 'Gutiérrez', 'Ortiz', 'Mendoza',
    'Silva', 'Castro', 'Vargas', 'Romero', 'Medina', 'Jiménez', 'Moreno', 'Álvarez', 'Ruiz', 'Castillo'
];

/**
 * Generates a minister candidate with procedurally generated traits and stats
 */
export function generateMinister(
    ministry: MinistryType,
    countryContext: {
        ideology: Ideology;
        corruption: number;      // 0-100
        militarySpending: number; // % of GDP
        freedom: number;         // 0-100
    }
): Minister {
    // Gender selection (60% M, 35% F, 5% NB for realism)
    const genderRoll = Math.random();
    const gender: 'M' | 'F' | 'NB' = genderRoll < 0.60 ? 'M' : genderRoll < 0.95 ? 'F' : 'NB';

    // Name generation
    const firstName = gender === 'M'
        ? FIRST_NAMES_M[Math.floor(Math.random() * FIRST_NAMES_M.length)]
        : gender === 'F'
            ? FIRST_NAMES_F[Math.floor(Math.random() * FIRST_NAMES_F.length)]
            : Math.random() < 0.5
                ? FIRST_NAMES_M[Math.floor(Math.random() * FIRST_NAMES_M.length)]
                : FIRST_NAMES_F[Math.floor(Math.random() * FIRST_NAMES_F.length)];

    const lastName1 = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const lastName2 = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const name = `${firstName} ${lastName1} ${lastName2}`;

    // Age: 35-70
    const age = 35 + Math.floor(Math.random() * 36);

    // Base stats (before trait modifiers)
    const baseStats = {
        competence: 30 + Math.floor(Math.random() * 40), // 30-70 base
        loyalty: 30 + Math.floor(Math.random() * 40),
        popularity: 20 + Math.floor(Math.random() * 30),
        corruption: Math.floor(Math.random() * 30), // 0-30 base
        ambition: 20 + Math.floor(Math.random() * 40),
        internalSupport: 30 + Math.floor(Math.random() * 40)
    };

    // Select 1-3 traits
    const traitCount = Math.random() < 0.3 ? 1 : Math.random() < 0.7 ? 2 : 3;
    const traits = selectTraitsForMinister(countryContext, traitCount);

    // Apply trait modifiers to stats
    const finalStats = { ...baseStats };
    traits.forEach(trait => {
        if (trait.competenceBonus) finalStats.competence += trait.competenceBonus;
        if (trait.loyaltyBonus) finalStats.loyalty += trait.loyaltyBonus;
        if (trait.popularityBonus) finalStats.popularity += trait.popularityBonus;
        if (trait.corruptionRisk) finalStats.corruption += trait.corruptionRisk;
        if (trait.ambitionBonus) finalStats.ambition += trait.ambitionBonus;
    });

    // Clamp all stats to 0-100
    Object.keys(finalStats).forEach(key => {
        finalStats[key as keyof typeof finalStats] = Math.max(0, Math.min(100, finalStats[key as keyof typeof finalStats]));
    });

    // Generate biography
    const biography = generateBiography(firstName, age, traits, ministry);

    return {
        id: crypto.randomUUID(),
        name,
        age,
        gender,
        ministry,
        partyId: 'independent', // Will be assigned properly when integrated
        ideology: selectIdeology(countryContext, traits),
        stats: finalStats,
        traitIds: traits.map(t => t.id),
        biography,
        scandalsCount: 0
    };
}

/**
 * Generates a pool of minister candidates for selection
 */
export function generateMinisterCandidates(
    ministry: MinistryType,
    count: number,
    countryContext: {
        ideology: Ideology;
        corruption: number;
        militarySpending: number;
        freedom: number;
    }
): Minister[] {
    const candidates: Minister[] = [];

    for (let i = 0; i < count; i++) {
        candidates.push(generateMinister(ministry, countryContext));
    }

    // Sort by competence (best first)
    return candidates.sort((a, b) => b.stats.competence - a.stats.competence);
}

/**
 * Select ideology based on country context and traits
 */
function selectIdeology(
    countryContext: { ideology: Ideology; freedom: number },
    traits: MinisterTrait[]
): Ideology {
    // Start with country tendency
    let ideology = countryContext.ideology;

    // Check for strong ideological bias from traits
    const strongBias = traits.find(t => t.ideologyBias);
    if (strongBias?.ideologyBias) {
        // Map bias to ideology
        if (strongBias.ideologyBias === 'left') {
            ideology = 'Socialist';
        } else if (strongBias.ideologyBias === 'right') {
            ideology = Math.random() < 0.5 ? 'Liberal' : 'Conservative';
        } else if (strongBias.ideologyBias === 'authoritarian') {
            ideology = 'Authoritarian';
        } else if (strongBias.ideologyBias === 'libertarian') {
            ideology = 'Liberal';
        }
    } else {
        // Random variation from country norm
        const ideologies: Ideology[] = ['Socialist', 'Liberal', 'Conservative', 'Nationalist', 'Centrist', 'Authoritarian'];
        if (Math.random() < 0.3) { // 30% chance to differ from country
            ideology = ideologies[Math.floor(Math.random() * ideologies.length)];
        }
    }

    return ideology;
}

/**
 * Generate an expanded, detailed biography based on traits and background
 */
function generateBiography(
    firstName: string,
    age: number,
    traits: MinisterTrait[],
    ministry: MinistryType
): string {
    // Educational backgrounds
    const educations = [
        'Universidad Nacional Mayor',
        'Universidad de Buenos Aires',
        'Instituto Tecnológico',
        'Harvard University',
        'London School of Economics',
        'Universidad Complutense de Madrid',
        'MIT',
        'Universidad Nacional Autónoma',
        'Yale University',
        'Oxford University'
    ];

    const degrees = [
        'Economía',
        'Derecho',
        'Ciencias Políticas',
        'Administración Pública',
        'Ingeniería',
        'Sociología',
        'Relaciones Internacionales',
        'Filosofía',
        'Historia',
        'Medicina'
    ];

    // Career paths
    const careerPaths = [
        'trabajó como consultor para organismos internacionales',
        'fue funcionario de carrera por más de 15 años',
        'dirigió una exitosa empresa del sector privado',
        'lideró múltiples organizaciones de la sociedad civil',
        'se desempeñó como profesor universitario',
        'ocupó cargos en gobiernos anteriores',
        'trabajó en el sector financiero internacional',
        'fue líder sindical en su gremio',
        'dirigió importantes proyectos de infraestructura',
        'trabajó en organismos multilaterales como el FMI y el Banco Mundial'
    ];

    // Achievements
    const achievements = [
        'implementó reformas que modernizaron su sector',
        'negoció acuerdos comerciales clave para el país',
        'lideró proyectos de desarrollo que beneficiaron a millones',
        'publicó investigaciones influyentes sobre política pública',
        'dirigió la respuesta a crisis económicas anteriores',
        'medió en conflictos sociales complejos',
        'implementó programas sociales ampliamente reconocidos',
        'modernizó sistemas administrativos obsoletos',
        'atrajo inversión extranjera significativa',
        'redujo la corrupción en instituciones clave'
    ];

    // Controversies (for some traits)
    const controversies = [
        'aunque enfrenta críticas por supuestos conflictos de interés',
        'a pesar de rumores sobre irregularidades en contratos pasados',
        'pese a cuestionamientos sobre su patrimonio inexplicado',
        'aunque algunos le atribuyen vínculos con grupos de poder económico',
        'a pesar de denuncias de nepotismo en su gestión anterior',
        'pese a señalamientos de autoritarismo en su estilo de gestión'
    ];

    // Recognition
    const recognitions = [
        'ampliamente respetado por su integridad',
        'reconocido por su compromiso con la transparencia',
        'admirado por su capacidad técnica excepcional',
        'valorado por su habilidad para construir consensos',
        'elogiado por su visión estratégica de largo plazo',
        'distinguido por su trayectoria impecable',
        'respetado por aliados y opositores por igual',
        'considerado uno de los mejores en su campo'
    ];

    // Build biography
    const education = educations[Math.floor(Math.random() * educations.length)];
    const degree = degrees[Math.floor(Math.random() * degrees.length)];
    const career = careerPaths[Math.floor(Math.random() * careerPaths.length)];
    const achievement = achievements[Math.floor(Math.random() * achievements.length)];

    let bio = `${firstName}, ${age} años. Graduado en ${degree} de la ${education}, ${career}. `;

    // Add trait-specific content
    const hasTecnocrata = traits.some(t => t.id === 'tecnocrata');
    const hasPopulista = traits.some(t => t.id === 'populista');
    const hasCorrupto = traits.some(t => t.id === 'corrupto');
    const hasIntegro = traits.some(t => t.id === 'integro');
    const hasMilitar = traits.some(t => t.id === 'militar');
    const hasEmpresario = traits.some(t => t.id === 'empresario');
    const hasAcademico = traits.some(t => t.id === 'academico');
    const hasDiplomatico = traits.some(t => t.id === 'diplomatico');

    if (hasTecnocrata) {
        bio += `Conocido por su enfoque analítico y basado en evidencia, ${achievement}. `;
        bio += `${recognitions[Math.floor(Math.random() * recognitions.length)]}. `;
    } else if (hasPopulista) {
        bio += `Reconocido por su conexión con las bases populares y su carisma en medios, ha construido una amplia base de apoyo. `;
        bio += `Sus críticos señalan su tendencia a priorizar la popularidad sobre la efectividad técnica. `;
    } else if (hasCorrupto) {
        bio += `En su gestión anterior ${achievement}, `;
        bio += `${controversies[Math.floor(Math.random() * controversies.length)]}. `;
        bio += `Mantiene fuertes conexiones con sectores empresariales clave. `;
    } else if (hasIntegro) {
        bio += `${achievement}. `;
        bio += `${recognitions[0]} y su rechazo absoluto a cualquier forma de corrupción. `;
        bio += `Ha rechazado múltiples ofertas del sector privado para mantener su servicio público. `;
    } else if (hasMilitar) {
        bio += `Retirado con honores de las Fuerzas Armadas, aplicó principios de disciplina y jerarquía en su gestión civil. `;
        bio += `Enfoca los problemas con rigor militar y emphasiza el orden por sobre otras consideraciones. `;
    } else if (hasEmpresario) {
        bio += `Fundó y dirigió exitosas empresas antes de entrar en la política, trayendo una perspectiva del sector privado. `;
        bio += `${achievement}, aplicando principios de gestión empresarial al sector público. `;
    } else if (hasAcademico) {
        bio += `Ha publicado extensamente sobre ${degree.toLowerCase()} y política pública, siendo referencia en su campo. `;
        bio += `${achievement} basándose en rigurosa investigación académica. `;
    } else if (hasDiplomatico) {
        bio += `Con experiencia en múltiples embajadas y organismos internacionales, ${achievement}. `;
        bio += `Destacado por su habilidad para negociar y construir puentes entre facciones opuestas. `;
    } else {
        // Generic successful professional
        bio += `A lo largo de su carrera, ${achievement}. `;
        bio += `${recognitions[Math.floor(Math.random() * recognitions.length)]}. `;
    }

    // Ministry-specific addition
    const ministryExperience: Record<MinistryType, string> = {
        'Economy': 'Su experiencia en política fiscal y reformas estructurales lo posicionan como experto en estabilización macroeconómica.',
        'Foreign': 'Su red de contactos internacionales y dominio de cinco idiomas facilitan negociaciones complejas.',
        'Interior': 'Su comprensión de las dinámicas regionales y capacidad de mediación son clave para la gobernabilidad.',
        'Defense': 'Su conocimiento de doctrina militar moderna y relaciones con las Fuerzas Armadas aseguran lealtad institucional.',
        'Health': 'Su experiencia en gestión sanitaria durante crisis pasadas demuestra capacidad de respuesta rápida.',
        'Education': 'Su visión de reforma educativa integral busca transformar el sistema desde sus fundaciones.',
        'Infrastructure': 'Su récord en ejecución de megaproyectos y captación de inversión lo distinguen en el sector.',
        'Environment': 'Su compromiso con la sostenibilidad balancea desarrollo económico con protección ambiental.'
    };

    bio += ministryExperience[ministry];

    return bio;
}

