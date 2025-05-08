// src/components/ui/AccordionDemo.tsx
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion';

interface FAQ {
  question: string;
  answer: string;
}

interface AccordionDemoProps {
  faqs: FAQ[];
}

export function AccordionDemo({ faqs }: AccordionDemoProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="border-b border-gray-200"
        >
          <AccordionTrigger className="text-primary-dark hover:text-primary text-lg py-6">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-gray-600 text-base">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
