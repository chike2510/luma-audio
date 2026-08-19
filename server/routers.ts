import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  ai: router({
    generateDrumPattern: publicProcedure
      .input(z.object({ mood: z.string().min(1).max(80), bpm: z.number().min(60).max(220), key: z.string().min(1).max(20) }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          model: "gpt-5-mini",
          messages: [
            { role: "system", content: "You are Luma Audio, a concise music-production co-pilot. Return only structured JSON for an editable 16-step drum pattern. Keep patterns musical and practical." },
            { role: "user", content: `Create a 16-step drum pattern for a ${input.mood} track at ${input.bpm} BPM in ${input.key}. Use kick, snare, hat, and clap arrays of exactly 16 booleans.` },
          ],
          reasoning: { effort: "low" },
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "drum_pattern",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  rationale: { type: "string" },
                  kick: { type: "array", items: { type: "boolean" }, minItems: 16, maxItems: 16 },
                  snare: { type: "array", items: { type: "boolean" }, minItems: 16, maxItems: 16 },
                  hat: { type: "array", items: { type: "boolean" }, minItems: 16, maxItems: 16 },
                  clap: { type: "array", items: { type: "boolean" }, minItems: 16, maxItems: 16 },
                },
                required: ["name", "rationale", "kick", "snare", "hat", "clap"],
                additionalProperties: false,
              },
            },
          },
        });
        const content = response.choices[0]?.message?.content;
        if (typeof content !== "string") throw new Error("The co-pilot did not return a pattern.");
        const pattern = JSON.parse(content);
        return { ...pattern, bpm: input.bpm, key: input.key };
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
