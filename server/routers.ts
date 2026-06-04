import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCompanyConfig,
  upsertCompanyConfig,
  getDeliveryNotes,
  getDeliveryNoteById,
  searchDeliveryNotes,
  getNextNoteNumber,
  createDeliveryNote,
  createCompleteDeliveryNote,
  updateCompleteDeliveryNote,
  updateDeliveryNote,
  getNoteLines,
  getNoteLineById,
  createNoteLine,
  updateNoteLine,
  deleteNoteLine,
  getSerials,
  createSerial,
  deleteSerial,
  getClients,
  getClientById,
  searchClients,
  createClient,
  updateClient,
  deleteClient,
  deleteDeliveryNote,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ PRODUCTOS ============
  products: router({
    list: publicProcedure.query(async () => {
      return getProducts();
    }),

    getById: publicProcedure.input(z.number()).query(async ({ input }) => {
      return getProductById(input);
    }),

    search: publicProcedure.input(z.string()).query(async ({ input }) => {
      if (!input.trim()) return [];
      return searchProducts(input);
    }),

    create: protectedProcedure
      .input(
        z.object({
          barcode: z.string().trim().optional(),
          name: z.string().trim().min(1, "El nombre es obligatorio"),
          description: z.string().optional(),
          category: z.string().optional(),
          price: z.coerce.number().positive("El precio debe ser mayor que cero"),
          unit: z.string().trim().min(1, "La unidad es obligatoria").default("UN"),
          hasSerial: z.boolean().default(false),
          stock: z.number().default(0),
        })
      )
      .mutation(async ({ input }) => {
        return createProduct({
          barcode: input.barcode || null,
          name: input.name,
          description: input.description || null,
          category: input.category || null,
          price: String(input.price),
          unit: input.unit,
          hasSerial: input.hasSerial,
          stock: input.stock,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          barcode: z.string().trim().optional(),
          name: z.string().trim().min(1, "El nombre es obligatorio").optional(),
          description: z.string().optional(),
          category: z.string().optional(),
          price: z.coerce.number().positive("El precio debe ser mayor que cero").optional(),
          unit: z.string().trim().min(1, "La unidad es obligatoria").optional(),
          hasSerial: z.boolean().optional(),
          stock: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = {};
        if (data.barcode !== undefined) updateData.barcode = data.barcode || null;
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description || null;
        if (data.category !== undefined) updateData.category = data.category || null;
        if (data.price !== undefined) updateData.price = String(data.price);
        if (data.unit !== undefined) updateData.unit = data.unit;
        if (data.hasSerial !== undefined) updateData.hasSerial = data.hasSerial;
        if (data.stock !== undefined) updateData.stock = data.stock;
        return updateProduct(id, updateData);
      }),

    delete: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
      return deleteProduct(input);
    }),
  }),

  // ============ CONFIGURACIÓN EMPRESARIAL ============
  config: router({
    get: publicProcedure.query(async () => {
      return getCompanyConfig();
    }),

    update: protectedProcedure
      .input(
        z.object({
          rif: z.string().optional(),
          businessName: z.string().optional(),
          address: z.string().optional(),
          phone1: z.string().optional(),
          phone2: z.string().optional(),
          email: z.string().optional(),
          website: z.string().optional(),
          logoDataUrl: z.string().optional(),
          ivaRate: z.string().or(z.number()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const updateData: any = {};
        if (input.rif !== undefined) updateData.rif = input.rif || null;
        if (input.businessName !== undefined) updateData.businessName = input.businessName || null;
        if (input.address !== undefined) updateData.address = input.address || null;
        if (input.phone1 !== undefined) updateData.phone1 = input.phone1 || null;
        if (input.phone2 !== undefined) updateData.phone2 = input.phone2 || null;
        if (input.email !== undefined) updateData.email = input.email || null;
        if (input.website !== undefined) updateData.website = input.website || null;
        if (input.logoDataUrl !== undefined) updateData.logoDataUrl = input.logoDataUrl || null;
        if (input.ivaRate !== undefined) updateData.ivaRate = String(input.ivaRate);
        return upsertCompanyConfig(updateData);
      }),
  }),

  // ============ NOTAS DE ENTREGA ============
  notes: router({
    list: publicProcedure
      .input(
        z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return getDeliveryNotes(input.limit, input.offset);
      }),

    getById: publicProcedure.input(z.number()).query(async ({ input }) => {
      const note = await getDeliveryNoteById(input);
      if (!note) return null;
      const lines = await getNoteLines(input);
      const linesWithSerials = await Promise.all(
        lines.map(async (line) => ({
          ...line,
          serials: await getSerials(line.id),
        }))
      );
      return { ...note, lines: linesWithSerials };
    }),

    search: publicProcedure.input(z.string()).query(async ({ input }) => {
      if (!input.trim()) return [];
      return searchDeliveryNotes(input);
    }),

    getNextNumber: publicProcedure.query(async () => {
      return getNextNoteNumber();
    }),

    create: protectedProcedure
      .input(
        z.object({
          noteNumber: z.string(),
          noteDate: z.string(),
          clientName: z.string(),
          clientRif: z.string().optional(),
          clientAddress: z.string().optional(),
          clientPhone: z.string().optional(),
          clientContact: z.string().optional(),
          applyIVA: z.boolean().default(true),
          observations: z.string().optional(),
          deliveredBy: z.string().optional(),
          receivedBy: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await createDeliveryNote({
          noteNumber: input.noteNumber,
          noteDate: new Date(`${input.noteDate.slice(0, 10)}T00:00:00`),
          clientName: input.clientName,
          clientRif: input.clientRif || null,
          clientAddress: input.clientAddress || null,
          clientPhone: input.clientPhone || null,
          clientContact: input.clientContact || null,
          applyIVA: input.applyIVA,
          subtotal: "0",
          ivaAmount: "0",
          total: "0",
          observations: input.observations || null,
          deliveredBy: input.deliveredBy || null,
          receivedBy: input.receivedBy || null,
        });
        return result;
      }),

    createComplete: protectedProcedure
      .input(
        z.object({
          noteNumber: z.string().trim().min(1, "El número de nota es obligatorio"),
          noteDate: z.string().min(1, "La fecha es obligatoria"),
          clientName: z.string().trim().min(1, "El cliente es obligatorio"),
          clientRif: z.string().optional(),
          clientAddress: z.string().optional(),
          clientPhone: z.string().optional(),
          clientContact: z.string().optional(),
          applyIVA: z.boolean().default(true),
          ivaRate: z.string().or(z.number()).optional(),
          observations: z.string().optional(),
          deliveredBy: z.string().optional(),
          receivedBy: z.string().optional(),
          lines: z.array(
            z.object({
              productId: z.number().int().positive(),
              quantity: z.number().int().positive(),
              unitPrice: z.coerce.number().nonnegative(),
              serials: z.array(z.string()).default([]),
            })
          ).min(1, "La nota debe tener al menos un producto"),
        })
      )
      .mutation(async ({ input }) => {
        return createCompleteDeliveryNote({
          noteNumber: input.noteNumber,
          noteDate: input.noteDate,
          clientName: input.clientName,
          clientRif: input.clientRif || null,
          clientAddress: input.clientAddress || null,
          clientPhone: input.clientPhone || null,
          clientContact: input.clientContact || null,
          applyIVA: input.applyIVA,
          ivaRate: input.ivaRate,
          observations: input.observations || null,
          deliveredBy: input.deliveredBy || null,
          receivedBy: input.receivedBy || null,
          lines: input.lines,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          subtotal: z.string().or(z.number()).optional(),
          ivaAmount: z.string().or(z.number()).optional(),
          total: z.string().or(z.number()).optional(),
          observations: z.string().optional(),
          deliveredBy: z.string().optional(),
          receivedBy: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = {};
        if (data.subtotal !== undefined) updateData.subtotal = String(data.subtotal);
        if (data.ivaAmount !== undefined) updateData.ivaAmount = String(data.ivaAmount);
        if (data.total !== undefined) updateData.total = String(data.total);
        if (data.observations !== undefined) updateData.observations = data.observations || null;
        if (data.deliveredBy !== undefined) updateData.deliveredBy = data.deliveredBy || null;
        if (data.receivedBy !== undefined) updateData.receivedBy = data.receivedBy || null;
        return updateDeliveryNote(id, updateData);
      }),

    updateComplete: protectedProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          noteNumber: z.string().trim().min(1, "El numero de nota es obligatorio"),
          noteDate: z.string().min(1, "La fecha es obligatoria"),
          clientName: z.string().trim().min(1, "El cliente es obligatorio"),
          clientRif: z.string().optional(),
          clientAddress: z.string().optional(),
          clientPhone: z.string().optional(),
          clientContact: z.string().optional(),
          applyIVA: z.boolean().default(true),
          ivaRate: z.string().or(z.number()).optional(),
          observations: z.string().optional(),
          deliveredBy: z.string().optional(),
          receivedBy: z.string().optional(),
          lines: z.array(
            z.object({
              productId: z.number().int().positive(),
              quantity: z.number().int().positive(),
              unitPrice: z.coerce.number().nonnegative(),
              serials: z.array(z.string()).default([]),
            })
          ).min(1, "La nota debe tener al menos un producto"),
        })
      )
      .mutation(async ({ input }) => {
        return updateCompleteDeliveryNote({
          id: input.id,
          noteNumber: input.noteNumber,
          noteDate: input.noteDate,
          clientName: input.clientName,
          clientRif: input.clientRif || null,
          clientAddress: input.clientAddress || null,
          clientPhone: input.clientPhone || null,
          clientContact: input.clientContact || null,
          applyIVA: input.applyIVA,
          ivaRate: input.ivaRate,
          observations: input.observations || null,
          deliveredBy: input.deliveredBy || null,
          receivedBy: input.receivedBy || null,
          lines: input.lines,
        });
      }),

    delete: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
      return deleteDeliveryNote(input);
    }),
  }),

  // ============ LÍNEAS DE NOTA ============
  noteLines: router({
    getByNoteId: publicProcedure.input(z.number()).query(async ({ input }) => {
      const lines = await getNoteLines(input);
      return Promise.all(
        lines.map(async (line) => ({
          ...line,
          serials: await getSerials(line.id),
        }))
      );
    }),

    getById: publicProcedure.input(z.number()).query(async ({ input }) => {
      const line = await getNoteLineById(input);
      if (!line) return null;
      return {
        ...line,
        serials: await getSerials(input),
      };
    }),

    create: protectedProcedure
      .input(
        z.object({
          noteId: z.number(),
          productId: z.number(),
          quantity: z.number().min(1),
          unitPrice: z.string().or(z.number()),
          lineTotal: z.string().or(z.number()),
        })
      )
      .mutation(async ({ input }) => {
        return createNoteLine({
          noteId: input.noteId,
          productId: input.productId,
          quantity: input.quantity,
          unitPrice: String(input.unitPrice),
          lineTotal: String(input.lineTotal),
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          quantity: z.number().optional(),
          unitPrice: z.string().or(z.number()).optional(),
          lineTotal: z.string().or(z.number()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = {};
        if (data.quantity !== undefined) updateData.quantity = data.quantity;
        if (data.unitPrice !== undefined) updateData.unitPrice = String(data.unitPrice);
        if (data.lineTotal !== undefined) updateData.lineTotal = String(data.lineTotal);
        return updateNoteLine(id, updateData);
      }),

    delete: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
      return deleteNoteLine(input);
    }),
  }),

  // ============ SERIALES ============
  serials: router({
    getByLineId: publicProcedure.input(z.number()).query(async ({ input }) => {
      return getSerials(input);
    }),

    create: protectedProcedure
      .input(
        z.object({
          lineId: z.number(),
          serial: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        return createSerial({
          lineId: input.lineId,
          serial: input.serial,
        });
      }),

    delete: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
      return deleteSerial(input);
    }),
  }),

  clients: router({
    list: publicProcedure.query(async () => {
      return getClients();
    }),

    getById: publicProcedure.input(z.number()).query(async ({ input }) => {
      return getClientById(input);
    }),

    search: publicProcedure.input(z.string()).query(async ({ input }) => {
      if (!input.trim()) return [];
      return searchClients(input);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          rif: z.string().optional(),
          address: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          contact: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return createClient({
          name: input.name,
          rif: input.rif || null,
          address: input.address || null,
          phone: input.phone || null,
          email: input.email || null,
          contact: input.contact || null,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          rif: z.string().optional(),
          address: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          contact: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateClient(id, data as any);
      }),

    delete: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
      return deleteClient(input);
    }),
  }),
});

export type AppRouter = typeof appRouter;
