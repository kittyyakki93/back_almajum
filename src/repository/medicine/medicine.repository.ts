import { Injectable } from "@nestjs/common";
import { CreateMedicineDto } from "src/domain/medicine/dto/medicine.dto";
import { PrismaService } from "src/service/prisma/prisma.service";


@Injectable()
export class MedicineRepository{
  constructor(private readonly prisma: PrismaService) { }
  
  async create(data: any) {
    return this.prisma.medicine.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
      },
    });
  }

  async findAll() {
    return this.prisma.medicine.findMany({
      include: {
        medicineIngredients: {
          include: { ingredient: true },
        },
      },
    });
  }

  async findById(id: number) {
    return this.prisma.medicine.findUnique({
      where:{id},
    })
  }

  async update(id: number, data: Partial<CreateMedicineDto>) {
    return this.prisma.medicine.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.medicine.delete({
      where: {id},
    })
  }
}