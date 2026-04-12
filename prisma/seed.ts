import { PrismaClient, MedicineType } from "@prisma/client";

const prisma = new PrismaClient();

async function ensureIngredient(name: string, description?: string) {
  const existing = await prisma.ingredient.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.ingredient.create({
    data: {
      name,
      description: description ?? `${name} (시드 데이터)`,
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
  // 일반의약품(OTC) — 성분 1~2개 연결
  await ensureMedicineWithIngredients({
    name: "타이레놀정 500mg",
    type: MedicineType.OTC,
    description: "해열·진통에 쓰이는 대표 일반의약품(시드 예시)",
    ingredientNames: ["아세트아미노펜"],
  });

  await ensureMedicineWithIngredients({
    name: "부루펜정 200mg",
    type: MedicineType.OTC,
    description: "소염·진통(시드 예시)",
    ingredientNames: ["이부프로펜"],
  });

  await ensureMedicineWithIngredients({
    name: "제산제 정제 (시드)",
    type: MedicineType.OTC,
    description: "위산 과다 완화(개발용 시드 예시)",
    ingredientNames: ["탄산수소나트륨"],
  });

  // 영양제(SUPPLEMENT)
  await ensureMedicineWithIngredients({
    name: "오메가3 EPA/DHA (시드)",
    type: MedicineType.SUPPLEMENT,
    description: "불포화지방산 보충(시드 예시)",
    ingredientNames: ["EPA", "DHA"],
  });

  await ensureMedicineWithIngredients({
    name: "비타민D3 2000IU (시드)",
    type: MedicineType.SUPPLEMENT,
    description: "뼈·면역 관련(시드 예시)",
    ingredientNames: ["콜레칼시페롤"],
  });

  await ensureMedicineWithIngredients({
    name: "마그네슘 비스글리시네이트 (시드)",
    type: MedicineType.SUPPLEMENT,
    description: "마그네슘 보충(시드 예시)",
    ingredientNames: ["마그네슘"],
  });

  const otc = await prisma.medicine.count({ where: { type: MedicineType.OTC } });
  const sup = await prisma.medicine.count({
    where: { type: MedicineType.SUPPLEMENT },
  });
  console.log(`Seed 완료: OTC ${otc}건, SUPPLEMENT ${sup}건 (이미 있던 이름은 건너뜀)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
