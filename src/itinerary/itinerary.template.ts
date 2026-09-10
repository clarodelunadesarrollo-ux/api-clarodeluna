export interface MilestoneTemplate {
  order: number;
  time: string;
  name: string;
  description: string;
  x: number;
  y: number;
}

// Standard day itinerary. Positions are normalized (0..1) over the venue map.
// Persisted per reservation on first fetch so it can later diverge per booking.
export const ITINERARY_TEMPLATE: MilestoneTemplate[] = [
  {
    order: 1,
    time: '09:00',
    name: 'Llegada y recepción',
    description: 'Te recibimos en la entrada principal con una bebida de bienvenida.',
    x: 0.42,
    y: 0.8,
  },
  {
    order: 2,
    time: '09:30',
    name: 'Huerta',
    description: 'Recorrido por la huerta orgánica y cosecha del día.',
    x: 0.3,
    y: 0.61,
  },
  {
    order: 3,
    time: '11:00',
    name: 'Taller',
    description: 'Taller de cocina de raíz con productos de estación.',
    x: 0.74,
    y: 0.62,
  },
  {
    order: 4,
    time: '12:00',
    name: 'Restaurante',
    description: 'Almuerzo de siete pasos en el salón principal.',
    x: 0.62,
    y: 0.45,
  },
  {
    order: 5,
    time: '15:00',
    name: 'Cierre',
    description: 'Sobremesa y despedida para cerrar la experiencia.',
    x: 0.44,
    y: 0.33,
  },
];
