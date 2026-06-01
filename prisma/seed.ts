import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@sistema.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@sistema.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const employeePassword = await bcrypt.hash("func123", 12);
  await prisma.user.upsert({
    where: { email: "funcionario@sistema.com" },
    update: {},
    create: {
      name: "Funcionário Padrão",
      email: "funcionario@sistema.com",
      password: employeePassword,
      role: "EMPLOYEE",
    },
  });

  const types = [
    { name: "Manutenção", description: "Serviços de manutenção corretiva e preventiva" },
    { name: "Instalação", description: "Instalação de equipamentos e sistemas" },
    { name: "Suporte", description: "Suporte técnico e atendimento" },
    { name: "Revisão", description: "Revisão periódica de equipamentos" },
  ];

  for (const type of types) {
    await prisma.ticketType.upsert({
      where: { name: type.name },
      update: {},
      create: type,
    });
  }

  console.log("✅ Seed concluído!");
  console.log(`   Admin: admin@sistema.com / admin123`);
  console.log(`   Funcionário: funcionario@sistema.com / func123`);
  console.log({ adminId: admin.id });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
