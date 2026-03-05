import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("A iniciar seed da base de dados...")

  // Criar utilizador admin
  const adminPassword = await hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@clube.pt" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@clube.pt",
      password: adminPassword,
      role: "ADMIN",
    },
  })
  console.log("Utilizador admin criado:", admin.email)

  // Criar utilizador treinador
  const treinadorPassword = await hash("treinador123", 12)
  const treinador = await prisma.user.upsert({
    where: { email: "treinador@clube.pt" },
    update: {},
    create: {
      name: "Carlos Silva",
      email: "treinador@clube.pt",
      password: treinadorPassword,
      role: "TREINADOR",
    },
  })
  console.log("Utilizador treinador criado:", treinador.email)

  // Criar modalidades
  const modalidades = await Promise.all([
    prisma.modalidade.upsert({
      where: { nome: "Futebol" },
      update: {},
      create: {
        nome: "Futebol",
        descricao: "Futebol de 11 jogadores em campo relvado",
        ativa: true,
      },
    }),
    prisma.modalidade.upsert({
      where: { nome: "Basquetebol" },
      update: {},
      create: {
        nome: "Basquetebol",
        descricao: "Basquetebol em pavilhao coberto",
        ativa: true,
      },
    }),
    prisma.modalidade.upsert({
      where: { nome: "Natacao" },
      update: {},
      create: {
        nome: "Natacao",
        descricao: "Natacao em piscina olimpica de 50 metros",
        ativa: true,
      },
    }),
    prisma.modalidade.upsert({
      where: { nome: "Atletismo" },
      update: {},
      create: {
        nome: "Atletismo",
        descricao: "Provas de pista e campo",
        ativa: true,
      },
    }),
    prisma.modalidade.upsert({
      where: { nome: "Voleibol" },
      update: {},
      create: {
        nome: "Voleibol",
        descricao: "Voleibol de pavilhao e praia",
        ativa: false,
      },
    }),
  ])
  console.log(`${modalidades.length} modalidades criadas`)

  // Criar equipas
  const equipas = await Promise.all([
    prisma.equipa.create({
      data: {
        nome: "Futebol Seniores A",
        escalao: "Seniores",
        modalidadeId: modalidades[0].id,
      },
    }),
    prisma.equipa.create({
      data: {
        nome: "Futebol Sub-19",
        escalao: "Sub-19",
        modalidadeId: modalidades[0].id,
      },
    }),
    prisma.equipa.create({
      data: {
        nome: "Basquetebol Seniores",
        escalao: "Seniores",
        modalidadeId: modalidades[1].id,
      },
    }),
    prisma.equipa.create({
      data: {
        nome: "Natacao Competicao",
        escalao: "Absoluto",
        modalidadeId: modalidades[2].id,
      },
    }),
  ])
  console.log(`${equipas.length} equipas criadas`)

  // Criar atletas
  const atletas = await Promise.all([
    prisma.atleta.create({
      data: {
        nome: "Joao Fernandes",
        dataNascimento: new Date("2000-03-15"),
        email: "joao.fernandes@email.pt",
        telefone: "912345678",
        numeroSocio: "SOC-001",
        ativo: true,
        equipaId: equipas[0].id,
      },
    }),
    prisma.atleta.create({
      data: {
        nome: "Miguel Santos",
        dataNascimento: new Date("2001-07-22"),
        email: "miguel.santos@email.pt",
        telefone: "923456789",
        numeroSocio: "SOC-002",
        ativo: true,
        equipaId: equipas[0].id,
      },
    }),
    prisma.atleta.create({
      data: {
        nome: "Ana Costa",
        dataNascimento: new Date("2005-11-08"),
        email: "ana.costa@email.pt",
        telefone: "934567890",
        numeroSocio: "SOC-003",
        ativo: true,
        equipaId: equipas[1].id,
      },
    }),
    prisma.atleta.create({
      data: {
        nome: "Sofia Ribeiro",
        dataNascimento: new Date("1999-01-30"),
        email: "sofia.ribeiro@email.pt",
        telefone: "945678901",
        numeroSocio: "SOC-004",
        ativo: true,
        equipaId: equipas[2].id,
      },
    }),
    prisma.atleta.create({
      data: {
        nome: "Pedro Almeida",
        dataNascimento: new Date("2003-05-18"),
        email: "pedro.almeida@email.pt",
        telefone: "956789012",
        numeroSocio: "SOC-005",
        ativo: false,
        equipaId: null,
      },
    }),
    prisma.atleta.create({
      data: {
        nome: "Rita Oliveira",
        dataNascimento: new Date("2002-09-25"),
        email: "rita.oliveira@email.pt",
        telefone: "967890123",
        numeroSocio: "SOC-006",
        ativo: true,
        equipaId: equipas[3].id,
      },
    }),
  ])
  console.log(`${atletas.length} atletas criados`)

  console.log("Seed concluido com sucesso!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
