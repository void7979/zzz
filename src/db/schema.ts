import {
  boolean,
  customType,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  nameFa: varchar("name_fa", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  nameFa: varchar("name_fa", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  descriptionFa: text("description_fa").notNull(),
  descriptionEn: text("description_en").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("image_url").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  date: varchar("date", { length: 50 }).notNull(),
  time: varchar("time", { length: 50 }).notNull(),
  guests: integer("guests").notNull(),
  status: varchar("status", { length: 30 }).notNull().default("pending"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const siteInfo = pgTable("site_info", {
  id: serial("id").primaryKey(),
  hoursFa: varchar("hours_fa", { length: 255 }).notNull(),
  hoursEn: varchar("hours_en", { length: 255 }).notNull(),
  phonePrimary: varchar("phone_primary", { length: 50 }).notNull(),
  phoneSecondary: varchar("phone_secondary", { length: 50 }).notNull(),
  addressFa: text("address_fa").notNull(),
  addressEn: text("address_en").notNull(),
  instagramUrl: text("instagram_url").notNull(),
  instagramHandle: varchar("instagram_handle", { length: 255 }).notNull(),
  mapsUrl: text("maps_url").notNull(),
  taglineFa: text("tagline_fa").notNull(),
  taglineEn: text("tagline_en").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const admins = pgTable(
  "admins",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    usernameIdx: uniqueIndex("admins_username_idx").on(table.username),
  }),
);

export const uploadedImages = pgTable("uploaded_images", {
  id: varchar("id", { length: 36 }).primaryKey(),
  fileName: text("file_name").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  data: bytea("data").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;
export type SiteInfo = typeof siteInfo.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type UploadedImage = typeof uploadedImages.$inferSelect;
