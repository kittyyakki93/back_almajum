import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateMedicineDto } from "src/domain/medicine/dto/medicine.dto";
import { MedicineRepository } from "src/repository/medicine/medicine.repository";
import { PrismaService } from "../prisma/prisma.service";


@Injectable()
export class MedicineService {
  constructor(private readonly medicineRepository: MedicineRepository,
    private readonly prisma: PrismaService
  ) { }

  //생성
  async create(dto: CreateMedicineDto) {
    const { ingredientIds, ...data } = dto;
  
    // 1. 중복 체크
    const exist = await this.prisma.medicine.findFirst({
      where: { name: data.name },
    })

    if(exist) {
      throw new BadRequestException('이미 존재하는 약입니다.');
    }

    // 2. medicine 먼저 생성
    const medicine = await this.prisma.medicine.create({
      data,
    });
  
    // 2. ingredientIds 있을 때만 실행 (방어코드)
    if (ingredientIds && ingredientIds.length > 0) {
      for (const id of ingredientIds) {
        await this.prisma.medicineIngredient.create({
          data: {
            medicine_id: medicine.id,
            ingredient_id: id,
          },
        });
      }
    }
  
    return medicine;
  }

  async findOne(id: number) {
    const data = await this.prisma.medicine.findUnique({
      where: { id },
      include: {
        medicineIngredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });
  
    if (!data) {
      throw new NotFoundException('약이 존재하지 않습니다');
    }
  
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      type: data.type,
      ingredients: data.medicineIngredients.map(mi => mi.ingredient),
    };
  }

  async addIngredients(medicineId: number, ingredientIds: number[]) {
    return this.prisma.medicineIngredient.createMany({
      data: ingredientIds.map((id) => ({
        medicine_id: medicineId,
        ingredient_id: id,
      })),
      skipDuplicates: true,
    });
  }

  // 전체 조회
  async findAll() {
    return this.medicineRepository.findAll();
  }

  // 단건 조회
  async findById(id: number) {
    const medicine = await this.medicineRepository.findById(id);

    if (!medicine) {
      throw new NotFoundException('해당 약이 존재하지 않습니다');
    }
    return medicine;
  }

  // 수정
  async update(id: number, dto: Partial<CreateMedicineDto>) {
    await this.findById(id); // 존재 여부 체크
    return this.medicineRepository.update(id, dto);
  }

  // 삭제 (관리자: 약–성분·약–증상 연관 행 제거 후 약 삭제. 장바구니·타이머는 DB CASCADE)
  async delete(id: number) {
    await this.findById(id);

    return this.prisma.$transaction(async (tx) => {
      await tx.medicineIngredient.deleteMany({ where: { medicine_id: id } });
      await tx.medicineSymptom.deleteMany({ where: { medicine_id: id } });
      return tx.medicine.delete({ where: { id } });
    });
  }

  async addSymptoms(medicineId: number, symptomIds: number[]) {
    return this.prisma.medicineSymptom.createMany({
      data: symptomIds.map(id => ({
        medicine_id: medicineId,
        symptom_id: id,
      })),
      skipDuplicates: true,
    });
  }
}