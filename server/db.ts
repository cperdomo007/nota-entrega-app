import { eq, desc, like, and, sql, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, deliveryNotes, noteLines, serials, companyConfig, clients, Product, DeliveryNote, NoteLine, Serial, CompanyConfig, Client, InsertClient } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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
  const db = await getDb();
  if (!db) return "1";
  const result = await db.select({
    maxNumber: sql<string>`CAST(MAX(CAST(SUBSTRING_INDEX(noteNumber, '-', -1) AS UNSIGNED)) AS CHAR)`
  }).from(deliveryNotes);
  const maxNum = parseInt(result[0]?.maxNumber || "0", 10);
  return String(maxNum + 1);
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

// ============ LÍNEAS DE NOTA ============
export async function getNoteLines(noteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(noteLines).where(eq(noteLines.noteId, noteId));
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
  // Eliminar seriales
  const lines = await db.select().from(noteLines).where(eq(noteLines.noteId, id));
  for (const line of lines) {
    await db.delete(serials).where(eq(serials.lineId, line.id));
  }
  // Eliminar líneas
  await db.delete(noteLines).where(eq(noteLines.noteId, id));
  // Eliminar nota
  await db.delete(deliveryNotes).where(eq(deliveryNotes.id, id));
}
