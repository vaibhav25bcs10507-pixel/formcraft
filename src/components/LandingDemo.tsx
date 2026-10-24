"use client";

import { useState } from "react";
import ConversationalForm from "@/components/ConversationalForm";
import type { FormDTO } from "@/lib/types";

const DEMO_FORM: FormDTO = {
  id: "demo",
  slug: "demo",
  title: "A quick demo",
  description: "Three questions. See how it feels.",
  createdAt: "",
  updatedAt: "",
  settings: {
    published: true,
    brandColor: "#6366f1",
    theme: "light",
    showProgress: true,
    welcomeEnabled: false,
    thankYouEnabled: true,
    thankYouTitle: "That's FormCraft 🎉",
    thankYouDescription: "This entire form was self-hosted with zero SaaS subscriptions. Yours can look like this too.",
  },
  questions: [
    {
      id: "d1",
      type: "choice",
      title: "Which tool are you tired of overpaying for?",
      required: true,
      options: ["Typeform", "SurveyMonkey", "Qualtrics", "All of them"],
    },
    {
      id: "d2",
      type: "rating",
      title: "How painful is that bill every month?",
      required: true,
      maxRating: 5,
    },
    {
      id: "d3",
      type: "email",
      title: "Want updates when we ship something great?",
      required: false,
      placeholder: "you@example.com",
    },
  ],
};

export default function LandingDemo() {
  const [key, setKey] = useState(0);
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-white shadow-2xl shadow-indigo-500/10">
      <div className="flex items-center gap-1.5 border-b border-neutral-200 bg-neutral-50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 truncate rounded-md bg-white px-2.5 py-0.5 text-xs text-neutral-400">
          yourserver.com/f/demo
        </span>
        <button
          onClick={() => setKey((k) => k + 1)}
          className="ml-auto text-xs font-semibold text-indigo-600 hover:text-indigo-500"
        >
          ↺ Restart
        </button>
      </div>
      <ConversationalForm key={key} form={DEMO_FORM} mode="preview" onRestart={() => setKey((k) => k + 1)} />
    </div>
  );
}
