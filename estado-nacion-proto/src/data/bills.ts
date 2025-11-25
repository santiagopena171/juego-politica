import type { Bill, PolicyArea } from '../types/parliament';

/**
 * Templates de bills comunes por área de política
 */

// Economía
export const ECONOMY_BILLS: Partial<Bill>[] = [
    {
        title: 'Reforma Tributaria Progresiva',
        description: 'Aumentar impuestos a los ingresos más altos y reducir la carga sobre la clase media',
        type: 'reform',
        policyArea: 'economy',
        requiredMajority: 50,
        urgency: 'medium',
        effects: {
            statChanges: {
                gdp: -0.02,
                inflation: 0.01,
                popularity: 5
            },
            resourceChanges: {
                budget: 50000
            }
        }
    },
    {
        title: 'Estímulo Fiscal',
        description: 'Paquete de estímulo económico mediante inversión pública y reducción de impuestos',
        type: 'budget',
        policyArea: 'economy',
        requiredMajority: 50,
        urgency: 'high',
        effects: {
            statChanges: {
                gdp: 0.03,
                unemployment: -0.01,
                inflation: 0.02
            },
            resourceChanges: {
                budget: -80000
            }
        }
    }
];

// Social
export const SOCIAL_BILLS: Partial<Bill>[] = [
    {
        title: 'Programa Universal de Ingresos Básicos',
        description: 'Implementar un ingreso básico mensual para todos los ciudadanos',
        type: 'reform',
        policyArea: 'social',
        requiredMajority: 60,
        urgency: 'low',
        effects: {
            statChanges: {
                popularity: 15,
                unemployment: -0.02,
                inflation: 0.03
            },
            resourceChanges: {
                budget: -120000
            }
        }
    },
    {
        title: 'Reforma de Pensiones',
        description: 'Aumentar las pensiones mínimas y ajustar la edad de jubilación',
        type: 'reform',
        policyArea: 'social',
        requiredMajority: 50,
        urgency: 'medium',
        effects: {
            statChanges: {
                popularity: 10
            },
            resourceChanges: {
                budget: -40000
            }
        }
    }
];

// Seguridad
export const SECURITY_BILLS: Partial<Bill>[] = [
    {
        title: 'Ley de Seguridad Ciudadana',
        description: 'Aumentar poderes policiales y penas por delitos menores',
        type: 'policy_change',
        policyArea: 'security',
        requiredMajority: 50,
        urgency: 'medium',
        effects: {
            statChanges: {
                stability: 5,
                popularity: -3
            }
        }
    },
    {
        title: 'Plan Nacional Anticrimen',
        description: 'Inversión masiva en seguridad, tecnología y fuerzas del orden',
        type: 'budget',
        policyArea: 'security',
        requiredMajority: 50,
        urgency: 'high',
        effects: {
            statChanges: {
                stability: 10,
                popularity: 5
            },
            resourceChanges: {
                budget: -60000
            }
        }
    }
];

// Educación
export const EDUCATION_BILLS: Partial<Bill>[] = [
    {
        title: 'Reforma Educativa Integral',
        description: 'Modernizar el currículo y aumentar la inversión en escuelas públicas',
        type: 'reform',
        policyArea: 'education',
        requiredMajority: 50,
        urgency: 'low',
        effects: {
            statChanges: {
                popularity: 8
            },
            resourceChanges: {
                budget: -50000
            }
        }
    },
    {
        title: 'Universidad Gratuita',
        description: 'Eliminar aranceles universitarios y financiar educación superior con impuestos',
        type: 'reform',
        policyArea: 'education',
        requiredMajority: 60,
        urgency: 'low',
        effects: {
            statChanges: {
                popularity: 12,
                unemployment: -0.01
            },
            resourceChanges: {
                budget: -90000
            }
        }
    }
];

// Salud
export const HEALTH_BILLS: Partial<Bill>[] = [
    {
        title: 'Sistema de Salud Universal',
        description: 'Implementar cobertura de salud gratuita para todos los ciudadanos',
        type: 'reform',
        policyArea: 'health',
        requiredMajority: 60,
        urgency: 'medium',
        effects: {
            statChanges: {
                popularity: 18
            },
            resourceChanges: {
                budget: -150000
            }
        }
    },
    {
        title: 'Plan de Emergencia Sanitaria',
        description: 'Inversión urgente en hospitales, equipamiento y personal médico',
        type: 'crisis_response',
        policyArea: 'health',
        requiredMajority: 50,
        urgency: 'crisis',
        effects: {
            statChanges: {
                stability: 10,
                popularity: 10
            },
            resourceChanges: {
                budget: -80000
            }
        }
    }
];

// Medio Ambiente
export const ENVIRONMENT_BILLS: Partial<Bill>[] = [
    {
        title: 'Transición a Energías Renovables',
        description: 'Plan nacional para adoptar energías limpias en 10 años',
        type: 'reform',
        policyArea: 'environment',
        requiredMajority: 50,
        urgency: 'low',
        effects: {
            statChanges: {
                gdp: -0.01,
                popularity: 8
            },
            resourceChanges: {
                budget: -100000
            }
        }
    },
    {
        title: 'Ley de Protección Ambiental',
        description: 'Restricciones estrictas a la contaminación y explotación de recursos',
        type: 'policy_change',
        policyArea: 'environment',
        requiredMajority: 50,
        urgency: 'medium',
        effects: {
            statChanges: {
                gdp: -0.02,
                popularity: 6
            }
        }
    }
];

// Infraestructura
export const INFRASTRUCTURE_BILLS: Partial<Bill>[] = [
    {
        title: 'Plan Nacional de Infraestructura',
        description: 'Construcción masiva de carreteras, puentes y obras públicas',
        type: 'budget',
        policyArea: 'infrastructure',
        requiredMajority: 50,
        urgency: 'low',
        effects: {
            statChanges: {
                gdp: 0.04,
                unemployment: -0.03,
                popularity: 10
            },
            resourceChanges: {
                budget: -200000
            }
        }
    }
];

// Relaciones Exteriores
export const FOREIGN_BILLS: Partial<Bill>[] = [
    {
        title: 'Tratado de Libre Comercio',
        description: 'Acuerdo comercial con principales socios económicos',
        type: 'reform',
        policyArea: 'foreign',
        requiredMajority: 60,
        urgency: 'low',
        effects: {
            statChanges: {
                gdp: 0.03,
                unemployment: -0.01,
                popularity: -2
            }
        }
    },
    {
        title: 'Aumento de Ayuda Internacional',
        description: 'Incrementar el presupuesto de cooperación y ayuda externa',
        type: 'budget',
        policyArea: 'foreign',
        requiredMajority: 50,
        urgency: 'low',
        effects: {
            statChanges: {
                popularity: 3
            },
            resourceChanges: {
                budget: -30000
            }
        }
    }
];

/**
 * Pool completo de bills disponibles
 */
export const ALL_BILL_TEMPLATES: Partial<Bill>[] = [
    ...ECONOMY_BILLS,
    ...SOCIAL_BILLS,
    ...SECURITY_BILLS,
    ...EDUCATION_BILLS,
    ...HEALTH_BILLS,
    ...ENVIRONMENT_BILLS,
    ...INFRASTRUCTURE_BILLS,
    ...FOREIGN_BILLS
];

/**
 * Genera un bill completo con ID y fecha
 */
export function generateBill(template: Partial<Bill>, proposedBy: 'government' | 'opposition', proposerPartyId?: string): Bill {
    return {
        id: `bill-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: template.title || 'Ley Sin Título',
        description: template.description || '',
        type: template.type || 'policy_change',
        policyArea: template.policyArea || 'economy',
        effects: template.effects || { statChanges: {}, resourceChanges: {} },
        proposedBy,
        proposerPartyId,
        status: 'pending',
        votes: { yes: 0, no: 0, abstain: 0 },
        requiredMajority: template.requiredMajority || 50,
        urgency: template.urgency || 'medium',
        dateProposed: new Date()
    };
}

/**
 * Obtiene bills aleatorios por área de política
 */
export function getRandomBillsByArea(area: PolicyArea, count: number = 2): Partial<Bill>[] {
    const bills = ALL_BILL_TEMPLATES.filter(b => b.policyArea === area);
    const shuffled = bills.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

/**
 * Obtiene un bill aleatorio de cualquier área
 */
export function getRandomBill(): Partial<Bill> {
    return ALL_BILL_TEMPLATES[Math.floor(Math.random() * ALL_BILL_TEMPLATES.length)];
}
