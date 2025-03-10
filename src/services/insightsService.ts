// src/services/insightsService.ts
import type { RestaurantMetrics } from '../types/metrics';
import type { Review } from '../types/reviews';
import type { Employee, Schedule } from '../types/employee';

// Extended Employee interface with review statistics
interface EmployeeWithStats extends Employee {
  reviewCount?: number;
  averageRating?: number;
}

interface InsightRequest {
  restaurants: RestaurantMetrics[];
  timeRange: string;
  employeeData?: Record<string, EmployeeWithStats[]>;
  reviewData?: Record<string, Review[]>;
}

const API_KEY = import.meta.env.PUBLIC_OPENAI_API_KEY || '';

export async function getRestaurantInsights(
  data: InsightRequest
): Promise<string[]> {
  try {
    // If no restaurants, we can't generate insights
    if (!data.restaurants || data.restaurants.length === 0) {
      return [
        'Selecciona al menos un restaurante para generar análisis.',
        'No hay suficientes datos para generar insights.',
        'La comparación entre restaurantes proporciona insights más valiosos.',
        'Selecciona varios restaurantes para ver análisis comparativos.',
      ];
    }

    // If no API key, use static insights to avoid errors
    if (!API_KEY) {
      console.warn(
        'No se ha configurado la API key de OpenAI. Usando insights predeterminados.'
      );
      return generateStaticInsights(data.restaurants, data.timeRange);
    }

    // Create a prompt for ChatGPT
    const prompt = createPrompt(data);

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using GPT-4o for better analysis
        messages: [
          {
            role: 'system',
            content:
              'Eres un consultor experto en análisis de restaurantes y hospitalidad con amplia experiencia en datos de feedback de clientes de la empresa Yuppie. Proporciona insights concisos, específicos y accionables basados en los datos presentados. Tus recomendaciones deben ser prácticas y estar orientadas a resultados mesurables. Yuppie es una plataforma integral para la gestión y análisis de restaurantes. Tu misión es ayudar a los clientes a aprovechar al máximo todas las funcionalidades de Yuppie. No debes recomendar ni mencionar plataformas o soluciones externas, sino siempre centrarte en las opciones que Yuppie ofrece. A continuación, se detallan las funcionalidades clave de Yuppie: 1:	Gestión de cupones: Permite crear cupones de descuento de forma sencilla y enviarlos automáticamente a los clientes por correo electrónico, controlando el porcentaje de descuento y generando códigos únicos. 2:	Gestión de empleados: Ofrece la posibilidad de ver detalles completos de cada empleado, asignarles roles y horarios, editar su información, y gestionar su rendimiento a través de reseñas y métricas internas. 3:	Gestión de restaurantes: Permite visualizar información detallada de cada restaurante, incluyendo datos clave, reseñas, calificaciones, y análisis de rendimiento. Cada restaurante se administra de forma individual y se pueden comparar múltiples locales. 4:	Analytics avanzado: Incluye paneles de control interactivos que muestran: Evolución y tendencia de reseñas y calificaciones en gráficos de líneas y radar, Distribución de calificaciones y análisis de tendencias mensuales, Comparación detallada entre locales en tablas y gráficos, incluyendo métricas como total de reseñas, rating promedio, tasa de conversión y tamaño del equipo. 5:	Notificaciones de emergencia: Se puede activar una notificación de emergencia en caso de recibir una reseña negativa, permitiendo una respuesta rápida para mitigar problemas. 6:	Calendario de reseñas: Visualiza en un calendario la cantidad de reseñas recibidas por día, facilitando el seguimiento de la actividad y la identificación de patrones. 7:	Puntos de mejora y análisis de desempeño: La plataforma resalta puntos fuertes y áreas de mejora basándose en las reseñas, permitiendo a los gerentes identificar oportunidades de capacitación y mejora. 8:	Comparación entre empleados y locales: Facilita la comparación de rendimiento entre empleados y entre diferentes sucursales, permitiendo identificar a los mejores y a aquellos que requieren atención. 9:	Establecimiento de objetivos: Permite fijar y seguir objetivos en una sección dedicada, ayudando a mantener metas claras para mejorar la atención y satisfacción de los clientes.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error(`Error en la API de OpenAI: ${response.status}`);
      throw new Error(`Error en la API de OpenAI: ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No se recibió respuesta de la API');
    }

    // Parse the response to get insights
    return parseInsightsResponse(content);
  } catch (error) {
    console.error('Error generando insights:', error);
    return generateStaticInsights(data.restaurants, data.timeRange);
  }
}

// Create an advanced prompt for ChatGPT-4o
function createPrompt(data: InsightRequest): string {
  const { restaurants, timeRange, employeeData, reviewData } = data;

  // Convert timeRange to a readable period
  const periodMap: Record<string, string> = {
    day: 'último día',
    week: 'última semana',
    month: 'último mes',
    year: 'último año',
  };

  const period = periodMap[timeRange] || 'último mes';

  // Determine if we have employee and review data
  const hasEmployeeData = employeeData && Object.keys(employeeData).length > 0;
  const hasReviewData = reviewData && Object.keys(reviewData).length > 0;

  // Prepare restaurant data for the prompt
  const restaurantData = restaurants
    .map((r) => {
      // Basic restaurant data
      let restaurantInfo = `
    Restaurante: ${r.name}
    - Total de Reseñas: ${r.totalReviews}
    - Calificación Promedio: ${r.averageRating.toFixed(1)}/5.0
    - Número de Empleados: ${r.employeeCount}
    - Tasa de Conversión (reseñas/taps): ${r.conversionRate.toFixed(1)}%
    - Porcentaje de Reseñas Positivas: ${r.positiveReviewsPercent.toFixed(1)}%
    `;

      // Add employee data if available
      if (hasEmployeeData && employeeData && employeeData[r.documentId]) {
        // Get top 3 employees
        const topEmployees = employeeData[r.documentId]
          .filter(
            (emp: EmployeeWithStats) => emp.reviewCount && emp.reviewCount > 0
          )
          .sort(
            (a: EmployeeWithStats, b: EmployeeWithStats) =>
              (b.averageRating || 0) - (a.averageRating || 0)
          )
          .slice(0, 3);

        if (topEmployees.length > 0) {
          restaurantInfo += `
    - Mejores Empleados:
      ${topEmployees
        .map(
          (emp: EmployeeWithStats) =>
            `* ${emp.firstName} ${emp.lastName} (${
              emp.position
            }): ${emp.averageRating?.toFixed(1)}/5.0 de ${
              emp.reviewCount
            } reseñas`
        )
        .join('\n      ')}
    `;
        }
      }

      // Add review data if available
      if (hasReviewData && reviewData && reviewData[r.documentId]) {
        // Most frequent categories
        const typeImprovements: Record<string, number> = {};
        reviewData[r.documentId].forEach((review: Review) => {
          if (review.typeImprovement) {
            typeImprovements[review.typeImprovement] =
              (typeImprovements[review.typeImprovement] || 0) + 1;
          }
        });

        // Sort by frequency
        const sortedCategories = Object.entries(typeImprovements)
          .sort(([, countA], [, countB]) => countB - countA)
          .slice(0, 3);

        if (sortedCategories.length > 0) {
          restaurantInfo += `
    - Principales categorías de mejora:
      ${sortedCategories
        .map(([category, count]) => `* ${category}: ${count} menciones`)
        .join('\n      ')}
    `;
        }

        // Examples of recent comments (2 positive, 2 negative)
        const positiveComments = reviewData[r.documentId]
          .filter((review: Review) => review.calification >= 4)
          .sort(
            (a: Review, b: Review) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 2);

        const negativeComments = reviewData[r.documentId]
          .filter((review: Review) => review.calification <= 2)
          .sort(
            (a: Review, b: Review) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 2);

        if (positiveComments.length > 0 || negativeComments.length > 0) {
          restaurantInfo += `
    - Ejemplos de comentarios recientes:`;

          if (positiveComments.length > 0) {
            restaurantInfo += `
      * Positivos:
        ${positiveComments
          .map(
            (review: Review) =>
              `"${review.comment.substring(0, 100)}${
                review.comment.length > 100 ? '...' : ''
              }" - ${review.calification}★`
          )
          .join('\n        ')}`;
          }

          if (negativeComments.length > 0) {
            restaurantInfo += `
      * Negativos:
        ${negativeComments
          .map(
            (review: Review) =>
              `"${review.comment.substring(0, 100)}${
                review.comment.length > 100 ? '...' : ''
              }" - ${review.calification}★`
          )
          .join('\n        ')}`;
          }
        }
      }

      return restaurantInfo;
    })
    .join('\n\n');

  // Main prompt
  return `
  Eres un consultor estratégico en experiencia gastronómicas y gestión de restaurantes.
  
  A continuación te presento los datos de rendimiento de ${restaurants.length} restaurante(s) durante el ${period}:
  
  ${restaurantData}
  
  Basándote exclusivamente en estos datos, proporciona exactamente 4 insights estratégicos, enumerados del 1 al 4:
  
  1. MEJORES PRÁCTICAS: Identifica específicamente qué está haciendo bien el restaurante con mejor calificación o rendimiento. Menciona prácticas concretas que podrían estar contribuyendo a su éxito y que otros restaurantes deberían imitar. Si hay datos sobre empleados destacados, inclúyelos en el análisis.
  
  2. ÁREAS DE MEJORA: Analiza el restaurante con peor desempeño e identifica específicamente qué podría estar fallando. Sugiere 2-3 acciones correctivas muy concretas basadas en los datos disponibles, enfocándote en las categorías de mejora más frecuentes y en los comentarios negativos.
  
  3. ALERTAS: Identifica la métrica más preocupante entre todos los restaurantes (p.ej., baja tasa de conversión, pocas reseñas, comentarios negativos recurrentes). Explica por qué es urgente atenderla y recomienda una acción inmediata.
  
  4. OPORTUNIDADES DE CRECIMIENTO: Basándote en todos los datos, sugiere una estrategia específica que podría mejorar el rendimiento de todos los restaurantes. Debe ser una recomendación concreta, medible y alcanzable.
  
  Cada insight debe ser expresado en 2-4 oraciones concisas. Enfócate exclusivamente en recomendaciones accionables basadas en los datos presentados. Evita introducciones o conclusiones innecesarias.
  
Análisis predictivo: Yuppie realiza análisis predictivos sobre la satisfacción del cliente, ayudando a anticipar tendencias y a tomar decisiones informadas para mejorar la experiencia en el restaurante.

realiza análisis predictivos sobre la satisfacción del cliente, ayudando a anticipar tendencias y a tomar decisiones informadas para mejorar la experiencia en el restaurante. Podes realizar análisis predictivos sobre la satisfacción del cliente, ayudando a anticipar tendencias y a tomar decisiones informadas para mejorar la experiencia en el restaurante.
Tu respuesta debe incluir recomendaciones, mejores prácticas y sugerencias específicas para sacar el máximo provecho a estas funcionalidades. Recuerda siempre enfocar tu respuesta en soluciones y opciones que sean exclusivas de Yuppie, resaltando cómo cada función puede aportar valor al negocio de restaurantes.Podes usar Emojis y otros recursos para hacerlo mas facil de leer para el dueño del restaurant, sin perder la profesionalidad. El texto debe ser Facilmente "escaneable" con las cosas mas destacables e negrita y una buena segmentación para que el dueño pueda leerlo rapidamente`;
}

// Parse the response to get insights
function parseInsightsResponse(content: string): string[] {
  try {
    // Detect numbering (1., 2., etc.) or sections by title
    let insights: string[] = [];

    // First try to split by numbering
    const numberedMatches = content.match(/\d+\.\s+([\s\S]+?)(?=\n\d+\.|$)/g);

    if (numberedMatches && numberedMatches.length >= 4) {
      insights = numberedMatches.slice(0, 4).map((match) => {
        // Remove the number and clean spaces
        return match.replace(/^\d+\.\s+/, '').trim();
      });
    } else {
      // If numbering doesn't work, split by paragraphs and filter empty ones
      const paragraphs = content
        .split('\n\n')
        .filter((p) => p.trim().length > 0);
      insights = paragraphs.slice(0, 4);

      // If we don't have enough paragraphs, complement
      while (insights.length < 4) {
        insights.push(getGenericInsight(insights.length));
      }
    }

    return insights;
  } catch (error) {
    console.error('Error parsing insights:', error);
    return [
      'Enfócate en replicar las prácticas del restaurante mejor calificado en todos tus locales, especialmente en la capacitación de personal y atención al cliente.',
      'Mejora el servicio al cliente y la calidad de los platos en los locales con peores calificaciones. Implementa un sistema de seguimiento de comentarios y solución rápida de problemas.',
      'Presta atención a la baja tasa de conversión de reseñas. Asegúrate de que los códigos QR sean visibles y motiva al personal a invitar activamente a los clientes a dejar su opinión.',
      'Implementa un programa de reconocimiento para empleados destacados y comparte mejores prácticas entre restaurantes. Considera un sistema de incentivos basado en las calificaciones de las reseñas.',
    ];
  }
}

// Generic message if response can't be parsed
function getGenericInsight(index: number): string {
  const genericInsights = [
    'Analiza las prácticas del restaurante mejor calificado y aplícalas sistemáticamente en los demás locales, prestando especial atención a la experiencia del cliente y la calidad del servicio.',
    'Enfócate en mejorar la capacitación del personal y la calidad del servicio en los restaurantes con calificaciones más bajas. Implementa un sistema de seguimiento para resolver quejas rápidamente.',
    'Presta atención a los restaurantes con tasas de conversión bajas. Verifica la visibilidad de los QR codes y asegúrate que el personal invite activamente a los clientes a dejar reseñas.',
    'Implementa un programa de reconocimiento para empleados destacados y desarrolla un sistema para compartir mejores prácticas entre restaurantes. Esto elevará el estándar de servicio en todos los locales.',
  ];

  return (
    genericInsights[index] ||
    'Recomienda realizar análisis periódicos detallados para identificar tendencias y oportunidades de mejora continua en todos tus restaurantes.'
  );
}

// Generate static insights based on data (when API can't be used)
function generateStaticInsights(
  restaurants: RestaurantMetrics[],
  timeRange: string
): string[] {
  if (restaurants.length === 0) {
    return [
      'No hay suficientes datos para generar insights. Selecciona al menos un restaurante para obtener análisis.',
      'Se requieren datos de restaurantes para proporcionar recomendaciones específicas y accionables.',
      'La comparación entre múltiples restaurantes te permitirá identificar patrones y oportunidades de mejora.',
      'El análisis de datos de restaurantes te ayudará a tomar decisiones informadas para mejorar el servicio y aumentar la satisfacción del cliente.',
    ];
  }

  // Period in readable form
  const periodMap: Record<string, string> = {
    day: 'hoy',
    week: 'esta semana',
    month: 'este mes',
    year: 'este año',
  };

  const periodText = periodMap[timeRange] || 'este período';

  // Sort restaurants by average rating
  const sortedByRating = [...restaurants].sort(
    (a, b) => b.averageRating - a.averageRating
  );
  const bestRestaurant = sortedByRating[0];
  const worstRestaurant = sortedByRating[sortedByRating.length - 1];

  // Sort by conversion rate
  const sortedByConversion = [...restaurants].sort(
    (a, b) => b.conversionRate - a.conversionRate
  );
  const bestConversion = sortedByConversion[0];
  const worstConversion = sortedByConversion[sortedByConversion.length - 1];

  return [
    `El restaurante "${
      bestRestaurant.name
    }" tiene la mejor calificación ${periodText} (${bestRestaurant.averageRating.toFixed(
      1
    )}/5.0). Implementa sus prácticas de servicio al cliente en otros locales, enfocándote en la capacitación cruzada para que todo el personal adopte estos estándares. Considera crear un programa de mentorías donde empleados destacados de este local entrenen al personal de otros restaurantes.`,

    `El restaurante "${
      worstRestaurant.name
    }" necesita mejorar su calificación actual de ${worstRestaurant.averageRating.toFixed(
      1
    )}/5.0. Implementa un sistema de respuesta inmediata a comentarios negativos y establece un plan de capacitación intensiva en atención al cliente. Realiza auditorías de calidad semanales para identificar problemas específicos y verificar el progreso de las mejoras.`,

    `La tasa de conversión de "${
      worstConversion.name
    }" (${worstConversion.conversionRate.toFixed(
      1
    )}%) está significativamente por debajo del promedio. Revisa la ubicación y visibilidad de los códigos QR, e implementa un incentivo temporal para motivar a los clientes a dejar reseñas. Es crítico que el personal esté entrenado para solicitar activamente feedback al final de cada servicio.`,

    `Implementa un sistema de compartición de mejores prácticas entre todos los restaurantes, con reuniones periódicas donde los equipos puedan discutir estrategias exitosas. Desarrolla un programa de reconocimiento que premie a los empleados con mejores calificaciones y al restaurante que muestre la mayor mejora mensual. Esto fomentará una competencia saludable y la adopción de prácticas efectivas.`,
  ];
}
