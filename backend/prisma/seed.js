import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database");
}

const seedFile = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../mock-data/reports.json"
);

const reports = JSON.parse(readFileSync(seedFile, "utf8"));

const data = reports.map((report) => ({
  id: report.id,
  title: report.title,
  description: report.description,
  type: report.type,
  category: report.category,
  location: report.location,
  date: new Date(report.date),
  imageUrl: report.imageUrl,
  reporterName: report.reporterName,
  contactType: report.contact.type,
  contactValue: report.contact.value,
  createdAt: new Date(report.createdAt),
  updatedAt: new Date(report.updatedAt),
}));

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

try {
  const result = await prisma.report.createMany({
    data,
    skipDuplicates: true,
  });
  console.log(`Seeded ${result.count} of ${data.length} reports`);
} finally {
  await prisma.$disconnect();
}
