// Scan a prescription label or medical paper and return structured fields.
// Uses the Lovable AI Gateway Responses API (streaming, strict JSON schema).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const nullableString = { type: ["string", "null"] } as const;

const PRESCRIPTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["medications", "notes"],
  properties: {
    notes: nullableString,
    medications: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "name",
          "strength",
          "reason",
          "doctor",
          "directions",
          "morning",
          "afternoon",
          "night",
        ],
        properties: {
          name: nullableString,
          strength: nullableString,
          reason: nullableString,
          doctor: nullableString,
          directions: nullableString,
          morning: { type: "boolean" },
          afternoon: { type: "boolean" },
          night: { type: "boolean" },
        },
      },
    },
  },
} as const;

const MEDICAL_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "visit_date",
    "doctor_name",
    "clinic",
    "reason",
    "blood_pressure",
    "heart_rate",
    "weight",
    "temperature",
    "diagnoses",
    "test_results",
    "lab_notes",
    "next_appointment",
  ],
  properties: {
    visit_date: nullableString,
    doctor_name: nullableString,
    clinic: nullableString,
    reason: nullableString,
    blood_pressure: nullableString,
    heart_rate: nullableString,
    weight: nullableString,
    temperature: nullableString,
    diagnoses: nullableString,
    test_results: nullableString,
    lab_notes: nullableString,
    next_appointment: nullableString,
  },
} as const;

const PRESCRIPTION_PROMPT = `You read photographs of prescription medication labels, pharmacy printouts and medication lists.
Extract every distinct medication you can see. For each one:
- name: the medication name (generic or brand as printed).
- strength: the strength/dose, e.g. "10 mg", "500 mg / 2 tablets".
- directions: the printed directions verbatim if legible.
- reason: the condition it treats, only if printed.
- doctor: the prescribing doctor's name, only if printed.
- morning / afternoon / night: infer from the directions when clear ("once daily in the morning" -> morning true).
  If the directions say a number of times per day without a time, spread them sensibly
  (twice daily -> morning + night; three times daily -> morning + afternoon + night).
Use null for anything not legible or not printed. Never invent a value. Put anything else worth keeping in notes.
Return json.`;

const MEDICAL_PROMPT = `You read photographs and scans of medical paperwork: visit summaries, discharge papers, lab reports and appointment slips.
Extract the visit date (ISO yyyy-mm-dd when you can tell), the provider/doctor name, the clinic or hospital,
the reason for the visit, vital signs (blood pressure, heart rate, weight, temperature) exactly as printed,
diagnoses, test results, lab notes and any next/follow-up appointment date or time.
Use null for anything not present or not legible. Never invent a value. Return json.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json({ ok: false, error: "AI scanning isn't set up yet." }, 500);

  let body: { mode?: string; fileDataUrl?: string; mimeType?: string; filename?: string };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Bad request" }, 400);
  }

  const mode = body.mode === "medical" ? "medical" : "prescription";
  const dataUrl = (body.fileDataUrl ?? "").trim();
  const mimeType = (body.mimeType ?? "").toLowerCase();
  if (!dataUrl.startsWith("data:")) {
    return json({ ok: false, error: "No photo or file was received." }, 400);
  }

  const isPdf = mimeType === "application/pdf" || dataUrl.startsWith("data:application/pdf");
  const mediaPart = isPdf
    ? { type: "input_file", filename: body.filename || "document.pdf", file_data: dataUrl }
    : { type: "input_image", image_url: dataUrl };

  const instructions = mode === "medical" ? MEDICAL_PROMPT : PRESCRIPTION_PROMPT;

  let res: Response;
  try {
    res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        reasoning: { effort: "low", summary: "auto" },
        include: ["reasoning.encrypted_content"],
        store: false,
        input: [
          {
            role: "user",
            content: [{ type: "input_text", text: instructions }, mediaPart],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: mode === "medical" ? "medical_document" : "prescription_scan",
            strict: true,
            schema: mode === "medical" ? MEDICAL_SCHEMA : PRESCRIPTION_SCHEMA,
          },
        },
      }),
    });
  } catch (e) {
    console.error("gateway fetch failed", e);
    return json({ ok: false, error: "Couldn't reach the scanner. Please try again." }, 502);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("gateway error", res.status, detail.slice(0, 800));
    if (res.status === 429) {
      return json({ ok: false, error: "The scanner is busy right now. Try again in a moment." }, 429);
    }
    if (res.status === 402) {
      return json({ ok: false, error: "AI credits are used up — top up to keep scanning." }, 402);
    }
    if (res.status === 403) {
      return json({ ok: false, error: "Scanning isn't allowed for this account right now." }, 403);
    }
    return json({ ok: false, error: "The scanner couldn't read that file." }, 502);
  }

  // Read the SSE stream and accumulate the answer text.
  let text = "";
  try {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
            text += evt.delta;
          } else if (evt.type === "response.completed" && typeof evt.response?.output_text === "string") {
            if (!text) text = evt.response.output_text;
          }
        } catch {
          // ignore keep-alive / partial frames
        }
      }
    }
  } catch (e) {
    console.error("stream read failed", e);
    return json({ ok: false, error: "The scan was interrupted. Please try again." }, 502);
  }

  if (!text.trim()) {
    return json({ ok: false, error: "Nothing could be read from that image. Try a clearer, well-lit photo." }, 422);
  }

  try {
    const data = JSON.parse(text);
    return json({ ok: true, mode, data });
  } catch {
    console.error("unparseable model output", text.slice(0, 500));
    return json({ ok: false, error: "The scan came back unreadable. Please try again." }, 502);
  }
});
