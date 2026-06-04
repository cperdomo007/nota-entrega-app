import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, date, index, uniqueIndex, longtext } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============ PRODUCTOS ============
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  barcode: varchar("barcode", { length: 255 }).unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }).default("UN"),
  hasSerial: boolean("hasSerial").default(false),
  stock: int("stock").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ============ CLIENTES ============
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  name: text("name").notNull(),
  rif: varchar("rif", { length: 50 }).unique(),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  contact: varchar("contact", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// ============ CONFIGURACIÓN EMPRESARIAL ============
export const companyConfig = mysqlTable("company_config", {
  id: int("id").autoincrement().primaryKey(),
  rif: varchar("rif", { length: 50 }),
  businessName: text("businessName"),
  address: text("address"),
  phone1: varchar("phone1", { length: 20 }),
  phone2: varchar("phone2", { length: 20 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  logoDataUrl: longtext("logoDataUrl"),
  ivaRate: decimal("ivaRate", { precision: 5, scale: 2 }).default("16.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompanyConfig = typeof companyConfig.$inferSelect;
export type InsertCompanyConfig = typeof companyConfig.$inferInsert;

// ============ NOTAS DE ENTREGA ============
export const deliveryNotes = mysqlTable("delivery_notes", {
  id: int("id").autoincrement().primaryKey(),
  noteNumber: varchar("noteNumber", { length: 50 }).notNull().unique(),
  noteDate: date("noteDate").notNull(),
  clientName: text("clientName").notNull(),
  clientRif: varchar("clientRif", { length: 50 }),
  clientAddress: text("clientAddress"),
  clientPhone: varchar("clientPhone", { length: 20 }),
  clientContact: varchar("clientContact", { length: 100 }),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0"),
  applyIVA: boolean("applyIVA").default(true),
  ivaAmount: decimal("ivaAmount", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).default("0"),
  observations: text("observations"),
  deliveredBy: varchar("deliveredBy", { length: 100 }),
  receivedBy: varchar("receivedBy", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DeliveryNote = typeof deliveryNotes.$inferSelect;
export type InsertDeliveryNote = typeof deliveryNotes.$inferInsert;

// ============ LÍNEAS DE NOTA ============
export const noteLines = mysqlTable("note_lines", {
  id: int("id").autoincrement().primaryKey(),
  noteId: int("noteId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  lineTotal: decimal("lineTotal", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  noteIdIdx: index("note_lines_note_id_idx").on(table.noteId),
  productIdIdx: index("note_lines_product_id_idx").on(table.productId),
}));

export type NoteLine = typeof noteLines.$inferSelect;
export type InsertNoteLine = typeof noteLines.$inferInsert;

// ============ SERIALES ============
export const serials = mysqlTable("serials", {
  id: int("id").autoincrement().primaryKey(),
  lineId: int("lineId").notNull(),
  serial: varchar("serial", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  lineIdIdx: index("serials_line_id_idx").on(table.lineId),
  lineSerialUnique: uniqueIndex("serials_line_serial_unique").on(table.lineId, table.serial),
}));

export type Serial = typeof serials.$inferSelect;
export type InsertSerial = typeof serials.$inferInsert;

// ============ RELACIONES ============
export const deliveryNotesRelations = relations(deliveryNotes, ({ many }) => ({
  lines: many(noteLines),
}));

export const noteLinesRelations = relations(noteLines, ({ one, many }) => ({
  note: one(deliveryNotes, {
    fields: [noteLines.noteId],
    references: [deliveryNotes.id],
  }),
  product: one(products, {
    fields: [noteLines.productId],
    references: [products.id],
  }),
  serials: many(serials),
}));

export const serialsRelations = relations(serials, ({ one }) => ({
  line: one(noteLines, {
    fields: [serials.lineId],
    references: [noteLines.id],
  }),
}));
