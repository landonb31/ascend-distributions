"use client";

import { FAQ_ITEMS } from "@/lib/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CTASection } from "@/components/marketing/cta-section";

export default function FAQPage() {
  return (
    <>
      <div className="py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Everything you need to know about Ascend Distributions.
        </p>
      </div>

      <section className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <CTASection />
    </>
  );
}
