import { eq, desc, like, and, or, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, deliveryNotes, noteLines, serials, companyConfig, clients, Product, DeliveryNote, NoteLine, Serial, CompanyConfig, Client } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

function getInsertId(result: unknown): number | null {
  const value = result as any;
  const insertId = value?.[0]?.insertId ?? value?.insertId;
  const id = Number(insertId);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export type CompleteDeliveryNoteLineInput = {
  productId: number;
  quantity: number;
  unitPrice: string | number;
  serials?: string[];
};

export type CompleteDeliveryNoteInput = {
  noteNumber: string;
  noteDate: string | Date;
  clientName: string;
  clientRif?: string | null;
  clientAddress?: string | null;
  clientPhone?: string | null;
  clientContact?: string | null;
  applyIVA: boolean;
  ivaRate?: string | number | null;
  observations?: string | null;
  deliveredBy?: string | null;
  receivedBy?: string | null;
  lines: CompleteDeliveryNoteLineInput[];
};

export type UpdateCompleteDeliveryNoteInput = CompleteDeliveryNoteInput & {
  id: number;
};

function toMoney(value: number): string {
  return value.toFixed(2);
}

function toDateOnly(value: string | Date): Date {
  const date = value instanceof Date ? value : new Date(`${value.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("La fecha de la nota no es válida");
  }

  return date;
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ PRODUCTOS ============
export async function getProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0] || null;
}

export async function searchProducts(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(
    or(
      like(products.barcode, `%${query}%`),
      like(products.name, `%${query}%`)
    )
  ).limit(20);
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  return result;
}

export async function updateProduct(id: number, data: Partial<Product>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

// ============ CONFIGURACIÓN EMPRESARIAL ============
export async function getCompanyConfig() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(companyConfig).limit(1);
  return result[0] || null;
}

export async function upsertCompanyConfig(data: Partial<CompanyConfig>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getCompanyConfig();
  if (existing) {
    await db.update(companyConfig).set(data).where(eq(companyConfig.id, existing.id));
  } else {
    await db.insert(companyConfig).values(data as any);
  }
}

// ============ NOTAS DE ENTREGA ============
export async function getDeliveryNotes(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deliveryNotes).orderBy(desc(deliveryNotes.createdAt)).limit(limit).offset(offset);
}

export async function getDeliveryNoteById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(deliveryNotes).where(eq(deliveryNotes.id, id)).limit(1);
  return result[0] || null;
}

export async function getDeliveryNoteByNumber(noteNumber: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(deliveryNotes).where(eq(deliveryNotes.noteNumber, noteNumber)).limit(1);
  return result[0] || null;
}

export async function searchDeliveryNotes(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deliveryNotes).where(
    or(
      like(deliveryNotes.noteNumber, `%${query}%`),
      like(deliveryNotes.clientName, `%${query}%`)
    )
  ).orderBy(desc(deliveryNotes.createdAt)).limit(50);
}

export async function getNextNoteNumber() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    pad(now.getDate()),
    pad(now.getMonth() + 1),
    now.getFullYear(),
    pad(now.getHours()),
    pad(now.getMinutes()),
  ].join("");
}

export async function createDeliveryNote(data: Omit<DeliveryNote, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(deliveryNotes).values(data);
  return result;
}

export async function updateDeliveryNote(id: number, data: Partial<DeliveryNote>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(deliveryNotes).set(data).where(eq(deliveryNotes.id, id));
}

export async function createCompleteDeliveryNote(data: CompleteDeliveryNoteInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const noteNumber = data.noteNumber.trim();
  const clientName = data.clientName.trim();

  if (!noteNumber) throw new Error("El número de nota es obligatorio");
  if (!clientName) throw new Error("El cliente es obligatorio");
  if (!data.lines.length) throw new Error("La nota debe tener al menos un producto");

  const existingNote = await db
    .select({ id: deliveryNotes.id })
    .from(deliveryNotes)
    .where(eq(deliveryNotes.noteNumber, noteNumber))
    .limit(1);

  if (existingNote.length > 0) {
    throw new Error(`Ya existe una nota con el número ${noteNumber}`);
  }

  const productIds = new Set<number>();
  const normalizedLines = data.lines.map((line, index) => {
    const quantity = Number(line.quantity);
    const unitPrice = Number(line.unitPrice);
    const serialValues = (line.serials ?? [])
      .map((serial) => serial.trim())
      .filter(Boolean);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`La cantidad de la línea ${index + 1} debe ser mayor que cero`);
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error(`El precio de la línea ${index + 1} no es válido`);
    }

    productIds.add(line.productId);

    return {
      productId: line.productId,
      quantity,
      unitPrice,
      lineTotal: quantity * unitPrice,
      serials: serialValues,
    };
  });

  const allSerials = normalizedLines.flatMap((line) => line.serials);
  const duplicatedSerial = allSerials.find((serial, index) => allSerials.indexOf(serial) !== index);
  if (duplicatedSerial) {
    throw new Error(`El serial ${duplicatedSerial} está duplicado en la nota`);
  }

  const productRows = await db
    .select()
    .from(products)
    .where(inArray(products.id, Array.from(productIds)));

  const productById = new Map(productRows.map((product) => [product.id, product]));

  for (const line of normalizedLines) {
    const product = productById.get(line.productId);
    if (!product) {
      throw new Error(`El producto con ID ${line.productId} no existe`);
    }

    if (product.hasSerial && line.serials.length !== line.quantity) {
      throw new Error(
        `El producto ${product.name} requiere ${line.quantity} serial(es) y tiene ${line.serials.length}`
      );
    }
  }

  const subtotal = normalizedLines.reduce((sum, line) => sum + line.lineTotal, 0);
  const ivaRate = Number(data.ivaRate ?? 16);
  const ivaAmount = data.applyIVA ? subtotal * (ivaRate / 100) : 0;
  const total = subtotal + ivaAmount;

  return db.transaction(async (tx) => {
    const noteInsertResult = await tx.insert(deliveryNotes).values({
      noteNumber,
      noteDate: toDateOnly(data.noteDate),
      clientName,
      clientRif: data.clientRif || null,
      clientAddress: data.clientAddress || null,
      clientPhone: data.clientPhone || null,
      clientContact: data.clientContact || null,
      applyIVA: data.applyIVA,
      subtotal: toMoney(subtotal),
      ivaAmount: toMoney(ivaAmount),
      total: toMoney(total),
      observations: data.observations || null,
      deliveredBy: data.deliveredBy || null,
      receivedBy: data.receivedBy || null,
    });

    let noteId = getInsertId(noteInsertResult);

    if (!noteId) {
      const createdNote = await tx
        .select({ id: deliveryNotes.id })
        .from(deliveryNotes)
        .where(eq(deliveryNotes.noteNumber, noteNumber))
        .limit(1);
      noteId = createdNote[0]?.id ?? null;
    }

    if (!noteId) {
      throw new Error("No se pudo obtener el ID de la nota creada");
    }

    for (const line of normalizedLines) {
      const lineInsertResult = await tx.insert(noteLines).values({
        noteId,
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: toMoney(line.unitPrice),
        lineTotal: toMoney(line.lineTotal),
      });

      let lineId = getInsertId(lineInsertResult);

      if (!lineId) {
        const createdLine = await tx
          .select({ id: noteLines.id })
          .from(noteLines)
          .where(and(eq(noteLines.noteId, noteId), eq(noteLines.productId, line.productId)))
          .orderBy(desc(noteLines.createdAt))
          .limit(1);
        lineId = createdLine[0]?.id ?? null;
      }

      if (!lineId) {
        throw new Error("No se pudo obtener el ID de una línea creada");
      }

      if (line.serials.length > 0) {
        await tx.insert(serials).values(
          line.serials.map((serial) => ({
            lineId,
            serial,
          }))
        );
      }
    }

    return {
      id: noteId,
      noteNumber,
      subtotal: toMoney(subtotal),
      ivaAmount: toMoney(ivaAmount),
      total: toMoney(total),
    };
  });
}

export async function updateCompleteDeliveryNote(data: UpdateCompleteDeliveryNoteInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const noteNumber = data.noteNumber.trim();
  const clientName = data.clientName.trim();

  if (!noteNumber) throw new Error("El numero de nota es obligatorio");
  if (!clientName) throw new Error("El cliente es obligatorio");
  if (!data.lines.length) throw new Error("La nota debe tener al menos un producto");

  const currentNote = await db
    .select({ id: deliveryNotes.id })
    .from(deliveryNotes)
    .where(eq(deliveryNotes.id, data.id))
    .limit(1);

  if (currentNote.length === 0) {
    throw new Error("La nota no existe");
  }

  const existingNote = await db
    .select({ id: deliveryNotes.id })
    .from(deliveryNotes)
    .where(eq(deliveryNotes.noteNumber, noteNumber))
    .limit(1);

  if (existingNote.length > 0 && existingNote[0].id !== data.id) {
    throw new Error(`Ya existe una nota con el numero ${noteNumber}`);
  }

  const productIds = new Set<number>();
  const normalizedLines = data.lines.map((line, index) => {
    const quantity = Number(line.quantity);
    const unitPrice = Number(line.unitPrice);
    const serialValues = (line.serials ?? [])
      .map((serial) => serial.trim())
      .filter(Boolean);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`La cantidad de la linea ${index + 1} debe ser mayor que cero`);
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error(`El precio de la linea ${index + 1} no es valido`);
    }

    productIds.add(line.productId);

    return {
      productId: line.productId,
      quantity,
      unitPrice,
      lineTotal: quantity * unitPrice,
      serials: serialValues,
    };
  });

  const allSerials = normalizedLines.flatMap((line) => line.serials);
  const duplicatedSerial = allSerials.find((serial, index) => allSerials.indexOf(serial) !== index);
  if (duplicatedSerial) {
    throw new Error(`El serial ${duplicatedSerial} esta duplicado en la nota`);
  }

  const productRows = await db
    .select()
    .from(products)
    .where(inArray(products.id, Array.from(productIds)));

  const productById = new Map(productRows.map((product) => [product.id, product]));

  for (const line of normalizedLines) {
    const product = productById.get(line.productId);
    if (!product) {
      throw new Error(`El producto con ID ${line.productId} no existe`);
    }

    if (product.hasSerial && line.serials.length !== line.quantity) {
      throw new Error(
        `El producto ${product.name} requiere ${line.quantity} serial(es) y tiene ${line.serials.length}`
      );
    }
  }

  const subtotal = normalizedLines.reduce((sum, line) => sum + line.lineTotal, 0);
  const ivaRate = Number(data.ivaRate ?? 16);
  const ivaAmount = data.applyIVA ? subtotal * (ivaRate / 100) : 0;
  const total = subtotal + ivaAmount;

  return db.transaction(async (tx) => {
    await tx.update(deliveryNotes).set({
      noteNumber,
      noteDate: toDateOnly(data.noteDate),
      clientName,
      clientRif: data.clientRif || null,
      clientAddress: data.clientAddress || null,
      clientPhone: data.clientPhone || null,
      clientContact: data.clientContact || null,
      applyIVA: data.applyIVA,
      subtotal: toMoney(subtotal),
      ivaAmount: toMoney(ivaAmount),
      total: toMoney(total),
      observations: data.observations || null,
      deliveredBy: data.deliveredBy || null,
      receivedBy: data.receivedBy || null,
    }).where(eq(deliveryNotes.id, data.id));

    const existingLines = await tx.select().from(noteLines).where(eq(noteLines.noteId, data.id));

    for (const line of existingLines) {
      await tx.delete(serials).where(eq(serials.lineId, line.id));
    }

    await tx.delete(noteLines).where(eq(noteLines.noteId, data.id));

    for (const line of normalizedLines) {
      const lineInsertResult = await tx.insert(noteLines).values({
        noteId: data.id,
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: toMoney(line.unitPrice),
        lineTotal: toMoney(line.lineTotal),
      });

      let lineId = getInsertId(lineInsertResult);

      if (!lineId) {
        const createdLine = await tx
          .select({ id: noteLines.id })
          .from(noteLines)
          .where(and(eq(noteLines.noteId, data.id), eq(noteLines.productId, line.productId)))
          .orderBy(desc(noteLines.createdAt))
          .limit(1);
        lineId = createdLine[0]?.id ?? null;
      }

      if (!lineId) {
        throw new Error("No se pudo obtener el ID de una linea creada");
      }

      if (line.serials.length > 0) {
        await tx.insert(serials).values(
          line.serials.map((serial) => ({
            lineId,
            serial,
          }))
        );
      }
    }

    return {
      id: data.id,
      noteNumber,
      subtotal: toMoney(subtotal),
      ivaAmount: toMoney(ivaAmount),
      total: toMoney(total),
    };
  });
}

// ============ LÍNEAS DE NOTA ============
export async function getNoteLines(noteId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      line: noteLines,
      product: products,
    })
    .from(noteLines)
    .leftJoin(products, eq(noteLines.productId, products.id))
    .where(eq(noteLines.noteId, noteId));

  return rows.map((row) => ({
    ...row.line,
    product: row.product,
  }));
}

export async function getNoteLineById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(noteLines).where(eq(noteLines.id, id)).limit(1);
  return result[0] || null;
}

export async function createNoteLine(data: Omit<NoteLine, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(noteLines).values(data);
  return result;
}

export async function updateNoteLine(id: number, data: Partial<NoteLine>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(noteLines).set(data).where(eq(noteLines.id, id));
}

export async function deleteNoteLine(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(noteLines).where(eq(noteLines.id, id));
}

// ============ SERIALES ============
export async function getSerials(lineId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(serials).where(eq(serials.lineId, lineId));
}

export async function createSerial(data: Omit<Serial, 'id' | 'createdAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(serials).values(data);
  return result;
}

export async function deleteSerial(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(serials).where(eq(serials.id, id));
}


// ============ CLIENTES ============
export async function getClients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).orderBy(desc(clients.createdAt));
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result[0] || null;
}

export async function searchClients(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(
    or(
      like(clients.name, `%${query}%`),
      like(clients.rif, `%${query}%`),
      like(clients.email, `%${query}%`)
    )
  ).limit(10);
}

export async function createClient(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clients).values(data);
  return result;
}

export async function updateClient(id: number, data: Partial<Client>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clients).set(data).where(eq(clients.id, id));
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(clients).where(eq(clients.id, id));
}

// ============ NOTAS DE ENTREGA - FUNCIONES ADICIONALES ============
export async function deleteDeliveryNote(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.transaction(async (tx) => {
    const lines = await tx.select().from(noteLines).where(eq(noteLines.noteId, id));

    for (const line of lines) {
      await tx.delete(serials).where(eq(serials.lineId, line.id));
    }

    await tx.delete(noteLines).where(eq(noteLines.noteId, id));
    await tx.delete(deliveryNotes).where(eq(deliveryNotes.id, id));

    return { success: true };
  });
}
