// src/data/testimonials.ts

interface Testimonial {
  rating: number;
  content: string;
  author: {
    name: string;
    role: string;
    company: string;
    image: string;
  };
}

export const testimonials: Testimonial[] = [
  {
    rating: 5,
    content:
      'Yuppie ha revolucionado la forma en que manejamos nuestras reseñas. Nuestro rating promedio subió de 4.2 a 4.8 en solo tres meses.',
    author: {
      name: 'María González',
      role: 'Gerente',
      company: 'Restaurante El Sabor',
      image: '/testimonial-1.jpg',
    },
  },
  {
    rating: 5,
    content:
      'La plataforma es intuitiva y los insights que obtenemos son invaluables para mejorar nuestro servicio.',
    author: {
      name: 'Carlos Ruiz',
      role: 'Director',
      company: 'Hotel Vista Mar',
      image: '/testimonial-2.jpg',
    },
  },
  {
    rating: 5,
    content:
      'El soporte al cliente es excepcional y las actualizaciones constantes mejoran la plataforma cada vez más.',
    author: {
      name: 'Ana Martínez',
      role: 'Propietaria',
      company: 'Café La Esquina',
      image: '/testimonial-3.jpg',
    },
  },
];
