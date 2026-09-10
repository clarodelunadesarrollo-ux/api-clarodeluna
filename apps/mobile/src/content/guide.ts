import type { GuideQuestion } from '@claro-de-luna/shared';

// EDIT THIS FILE to script the guide chatbot.
// Each entry is a suggested question the guest can tap and its predefined answer.
// There is no AI here: answers are fixed. Keep all text in Spanish.
export const guideQuestions: GuideQuestion[] = [
  {
    id: 'menu-vegano',
    question: '¿Tienen opciones veganas?',
    answer:
      'Sí. Varios platos de la huerta son veganos y los verás marcados con la etiqueta "vegano" en la carta.',
  },
  {
    id: 'como-llegar',
    question: '¿Cómo me muevo por el lugar?',
    answer:
      'En la sección Mapa vas a encontrar el recorrido con cada punto de interés y los horarios de tu experiencia.',
  },
  {
    id: 'huerta-visita',
    question: '¿Puedo visitar la huerta?',
    answer:
      'Claro. La visita a la huerta es parte del recorrido; el guía te avisará el momento en tu itinerario.',
  },
  {
    id: 'alergenos',
    question: '¿Puedo avisar sobre alergias o intolerancias?',
    answer:
      'Sí, contale a tu guía o al personal antes de comer. Adaptamos los platos siempre que sea posible según los ingredientes disponibles.',
  },
  {
    id: 'duracion',
    question: '¿Cuánto dura la experiencia?',
    answer:
      'El recorrido completo dura alrededor de dos horas, incluyendo la visita a la huerta y la comida. Los horarios exactos están en tu itinerario.',
  },
  {
    id: 'ingredientes-origen',
    question: '¿De dónde vienen los ingredientes?',
    answer:
      'La mayoría se cultiva en nuestra propia huerta, a pocos metros de tu mesa. Lo que no producimos lo conseguimos con productores locales de la zona.',
  },
  {
    id: 'sustentabilidad',
    question: '¿Qué hacen con los residuos?',
    answer:
      'Compostamos los restos de la cocina y la huerta para nutrir los próximos cultivos. Podés conocer el proceso en la sección Huerta.',
  },
  {
    id: 'fotos',
    question: '¿Puedo sacar fotos?',
    answer:
      '¡Sí! Te invitamos a tomar fotos de la huerta y los platos. Solo te pedimos cuidar la experiencia de las demás personas.',
  },
  {
    id: 'pagos',
    question: '¿Qué formas de pago aceptan?',
    answer:
      'Aceptamos efectivo y las principales tarjetas. Si tenés una consulta puntual sobre tu reserva, tu guía te ayuda.',
  },
  {
    id: 'llegada-tarde',
    question: '¿Qué pasa si llego tarde?',
    answer:
      'Avisanos apenas puedas. Intentaremos reacomodarte en el recorrido, aunque algunos momentos dependen de los horarios grupales.',
  },
];

// First message the guide shows when the chat opens.
export const guideIntro =
  'Hola, soy tu guía de Claro de Luna. Tocá una pregunta y te cuento.';
