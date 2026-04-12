import { PrismaClient, MedicineType } from "@prisma/client";

const prisma = new PrismaClient();

const COUNT_OTC = 100;
const COUNT_SUPPLEMENT = 100;

const ING_POOL = [
  "아세트아미노펜",
  "이부프로펜",
  "탄산수소나트륨",
  "EPA",
  "DHA",
  "콜레칼시페롤",
  "마그네슘",
  "비타민C",
  "아연",
  "셀레늄",
  "프로바이오틱스",
  "루테인",
  "코엔자임Q10",
  "글루코사민",
  "MSM",
  "밀크씨슬",
  "판토텐산",
  "엽산",
  "비오틴",
  "철분",
  "칼슘",
  "칼륨",
  "오메가3",
  "글리신",
  "타우린",
];

const OTC_STEMS = [
  "아세트아미노펜",
  "이부프로펜",
  "클루브펜산",
  "덱스트로메토르판",
  "구아이페네신",
  "슈다페드린",
  "클로르페니라민",
  "트리메부틴",
  "도미페리돈",
  "판크레아틴",
  "우르소데옥시콜산",
  "락토바실러스",
  "비사코딜",
  "센나엑스",
  "로페라마이드",
  "니코틴산아미드",
  "판테놀",
  "살리실산",
  "히드로코르티손",
  "마데카소사이드",
];

const OTC_FORMS = [
  "정 500mg",
  "정 200mg",
  "정 400mg",
  "연질캡슐 200mg",
  "산제 2g",
  "서방정 650mg",
  "필름코팅정 325mg",
  "액 100ml",
  "현탁액 15ml",
  "연고 10g",
];

const SUP_PREFIX = [
  "프리미엄",
  "골드",
  "에센셜",
  "데일리",
  "하이포커스",
  "트리플",
  "넥스트",
  "",
];

const SUP_CORE = [
  "오메가3 RTG 1200mg",
  "마그네슘 비스글리시네이트 400",
  "비타민D3 2000IU",
  "프로바이오틱스 100억 CFU",
  "루테인 지아잔틴 20mg",
  "코엔자임Q10 100mg",
  "밀크씨슬 실리마린 130mg",
  "글루코사민 MSM 2400",
  "멀티비타민 미네랄",
  "비타민B군 컴플렉스",
  "아연 피콜리네이트 15mg",
  "철분 푸마레이트 24mg",
  "칼슘 마그네슘 아연",
  "비타민C 1000mg",
  "콘드로이틴 MSM",
  "은행잎 추출물 120mg",
  "홍삼진액 스틱",
  "프로폴리스 스프레이",
  "히알루론산 120mg",
  "NAC 600mg",
  "셀레늄 200mcg",
  "비오틴 5000mcg",
  "판토텐산 500mg",
  "엽산 800mcg",
  "칼륨 글루콘산염 99mg",
  "타우린 1000mg",
  "크릴오일 500mg",
  "EPA·DHA 트리글리세리드",
  "베리 안토시아닌 복합",
  "감마리놀렌산 보라지오일",
  "CLA 1000mg",
  "쏘팔메토 열매추출",
  "테아닌 200mg",
  "GABA 250mg",
  "분리유단백 WPC",
  "HMB 1500mg",
  "베타알라닌 3200",
  "크레아틴 모노하이드레이트",
  "BCAA 2:1:1 5000",
  "아르기닌 3000",
  "시트룰린 말레인산 2000",
  "리코펜 20mg",
  "포스파티딜세린 100mg",
  "프로바이오틱스 19종",
  "유산균·크랜베리",
  "상어연골 분말",
  "보스웰리아 추출물",
  "커큐민 500mg",
  "생강·밤하늘추출 복합",
  "프리바이오틱스 FOS",
  "해조칼슘 600mg",
  "펩타이드 콜라겐 3000",
];

const OTC_DESC = [
  "해열·진통.",
  "소염·진통.",
  "멀미·어지러움 완화.",
  "제산·소화 보조.",
];

const SUP_DESC = [
  "영양 보충.",
  "항산화 보조.",
  "뼈·관절 관리.",
  "면역·피로 관리.",
];

function otcProductName(index: number): string {
  const k = index - 1;
  return `${OTC_STEMS[k % OTC_STEMS.length]} ${OTC_FORMS[(k + Math.floor(k / OTC_STEMS.length)) % OTC_FORMS.length]}`;
}

function supplementProductName(index: number): string {
  const k = index - 1;
  const prefix = SUP_PREFIX[k % SUP_PREFIX.length];
  const core = SUP_CORE[(k * 3 + Math.floor(k / 8)) % SUP_CORE.length];
  return prefix ? `${prefix} ${core}` : core;
}

/** Unsplash 고정 사진(의약·영양 테마, 280 정사각) */
function unsplash(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=280&h=280&q=80`;
}

const OTC_IMG = {
  tablets1: unsplash("photo-1584308666744-24d5c474f2ae"),
  tablets2: unsplash("photo-1559757148-5c350d0d3c56"),
  blister: unsplash("photo-1587854692152-cbe660dbde88"),
  shelf: unsplash("photo-1505751172876-fa1923c5c528"),
  jars: unsplash("photo-1582719478250-c89cae4dc85b"),
  liquid: unsplash("photo-1532187863486-abf9dbad1b69"),
  pourBottle: unsplash("photo-1563213126-a4273aed2016"),
};

const SUP_IMG = {
  capsulesTray: unsplash("photo-1556909114-f6e7ad7d3136"),
  powderJar: unsplash("photo-1607613009820-a29f7bb81c04"),
  bowl: unsplash("photo-1596178065887-1198b6148b2b"),
  bottleRow: unsplash("photo-1587854692152-cbe660dbde88"),
  pillsFlat: unsplash("photo-1584308666744-24d5c474f2ae"),
};

/** 품목명·제형 키워드 → 의약품에 맞는 스톡 이미지 */
function pickOtcImageUrl(productName: string, index: number): string {
  const n = productName;
  if (/연고|크림/.test(n)) return OTC_IMG.jars;
  if (/액\s|시럽|현탁|\d+\s*ml/.test(n) && !/캡슐/.test(n)) return OTC_IMG.liquid;
  if (/연질캡슐/.test(n)) return OTC_IMG.pourBottle;
  if (/캡슐/.test(n)) return OTC_IMG.blister;
  if (/좌제|포\s|산제/.test(n)) return OTC_IMG.tablets2;
  const pool = [
    OTC_IMG.tablets1,
    OTC_IMG.tablets2,
    OTC_IMG.blister,
    OTC_IMG.shelf,
  ];
  return pool[(index - 1) % pool.length];
}

/** 품목명·성분 키워드 → 영양제에 맞는 스톡 이미지 */
function pickSupplementImageUrl(productName: string, index: number): string {
  const n = productName;
  if (/오메가|EPA|DHA|크릴|지방산|오일/.test(n)) return SUP_IMG.bowl;
  if (
    /비타민|루테인|엽산|아연|철분|판토텐|비오틴|칼슘|칼륨|셀레늄|글리신|타우린|코엔자임|Q10|글루코사민|MSM|NAC|글루타|히알루론|리코펜|포스파티딜/.test(
      n
    )
  ) {
    return SUP_IMG.capsulesTray;
  }
  if (/프로바이오틱스|유산균|프리바이오틱|FOS|맥아|난소화/.test(n)) {
    return SUP_IMG.powderJar;
  }
  if (
    /프로테인|BCAA|크레아틴|HMB|아르기닌|시트룰린|베타알라|펩타이드|콜라겐|분리유/.test(n)
  ) {
    return SUP_IMG.powderJar;
  }
  if (
    /밀크씨슬|홍삼|은행잎|보스웰|커큐민|생강|상어연골|쏘팔|감마|테아닌|GABA|CLA|스피루|클로렐/.test(
      n
    )
  ) {
    return SUP_IMG.bottleRow;
  }
  const pool = [
    SUP_IMG.capsulesTray,
    SUP_IMG.powderJar,
    SUP_IMG.bowl,
    SUP_IMG.pillsFlat,
  ];
  return pool[(index - 1) % pool.length];
}

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

function pickTwoIngredients(seed: number): string[] {
  const len = ING_POOL.length;
  const a = ING_POOL[seed % len];
  let b = ING_POOL[(seed * 7 + 3) % len];
  if (b === a) b = ING_POOL[(seed * 7 + 4) % len];
  return [a, b];
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
  if (found) {
    const patch: { image_url?: string | null; description?: string | null } =
      {};
    if (input.image_url !== undefined) patch.image_url = input.image_url;
    if (input.description !== undefined) patch.description = input.description;
    if (Object.keys(patch).length > 0) {
      return prisma.medicine.update({
        where: { id: found.id },
        data: patch,
      });
    }
    return found;
  }

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

async function removeLegacyPlaceholderMedicines() {
  const targets = await prisma.medicine.findMany({
    where: {
      OR: [
        { name: { startsWith: "가라의약품" } },
        { name: { startsWith: "가라영양제" } },
      ],
    },
    select: { id: true },
  });
  for (const row of targets) {
    await prisma.medicineIngredient.deleteMany({
      where: { medicine_id: row.id },
    });
    await prisma.medicineSymptom.deleteMany({
      where: { medicine_id: row.id },
    });
    await prisma.medicine.delete({ where: { id: row.id } });
  }
}

async function main() {
  await removeLegacyPlaceholderMedicines();

  for (let i = 1; i <= COUNT_OTC; i++) {
    const name = otcProductName(i);
    await ensureMedicineWithIngredients({
      name,
      type: MedicineType.OTC,
      description: OTC_DESC[(i - 1) % OTC_DESC.length],
      image_url: pickOtcImageUrl(name, i),
      ingredientNames: pickTwoIngredients(i),
    });
  }

  for (let i = 1; i <= COUNT_SUPPLEMENT; i++) {
    const name = supplementProductName(i);
    await ensureMedicineWithIngredients({
      name,
      type: MedicineType.SUPPLEMENT,
      description: SUP_DESC[(i - 1) % SUP_DESC.length],
      image_url: pickSupplementImageUrl(name, i),
      ingredientNames: pickTwoIngredients(i + COUNT_OTC),
    });
  }

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
