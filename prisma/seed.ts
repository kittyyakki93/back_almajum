import { PrismaClient, MedicineType } from "@prisma/client";

const prisma = new PrismaClient();

async function ensureIngredient(name: string, description?: string | null) {
  const existing = await prisma.ingredient.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.ingredient.create({
    data: {
      name,
      description: description ?? null,
    },
  });
}

async function ensureMedicineWithIngredients(input: {
  name: string;
  type: MedicineType;
  description?: string | null;
  image_url?: string | null;
  ingredientNames: string[];
}) {
  const found = await prisma.medicine.findFirst({
    where: { name: input.name },
  });
  if (found) return found;

  const ingredients = await Promise.all(
    input.ingredientNames.map((n) => ensureIngredient(n))
  );

  const medicine = await prisma.medicine.create({
    data: {
      name: input.name,
      type: input.type,
      description: input.description ?? null,
      image_url: input.image_url ?? null,
    },
  });

  if (ingredients.length > 0) {
    await prisma.medicineIngredient.createMany({
      data: ingredients.map((ing) => ({
        medicine_id: medicine.id,
        ingredient_id: ing.id,
      })),
      skipDuplicates: true,
    });
  }

  return medicine;
}

async function main() {
  await ensureMedicineWithIngredients({
    name: "아세탐정 500mg",
    type: MedicineType.OTC,
    description: "해열·진통.",
    ingredientNames: ["아세트아미노펜"],
  });

  await ensureMedicineWithIngredients({
    name: "이브프로정 200mg",
    type: MedicineType.OTC,
    description: "소염·진통.",
    ingredientNames: ["이부프로펜"],
  });

  await ensureMedicineWithIngredients({
    name: "제산정 650mg",
    type: MedicineType.OTC,
    description: "위산 과다 완화.",
    ingredientNames: ["탄산수소나트륨"],
  });

  await ensureMedicineWithIngredients({
    name: "오메가3 골드 1100",
    type: MedicineType.SUPPLEMENT,
    description: "불포화지방산 보충.",
    ingredientNames: ["EPA", "DHA"],
  });

  await ensureMedicineWithIngredients({
    name: "비타민D3 2000IU",
    type: MedicineType.SUPPLEMENT,
    description: "뼈·면역.",
    ingredientNames: ["콜레칼시페롤"],
  });

  await ensureMedicineWithIngredients({
    name: "마그네슘 비스글리시네이트 400",
    type: MedicineType.SUPPLEMENT,
    description: "마그네슘 보충.",
    ingredientNames: ["마그네슘"],
  });

  const otc = await prisma.medicine.count({ where: { type: MedicineType.OTC } });
  const sup = await prisma.medicine.count({
    where: { type: MedicineType.SUPPLEMENT },
  });
  console.log(`OTC ${otc}건, SUPPLEMENT ${sup}건`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
