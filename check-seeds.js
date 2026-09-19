const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const clients = await prisma.client.count()
    const orders = await prisma.order.count()
    const scripts = await prisma.script.count()
    const creators = await prisma.creator.count()
    const shoots = await prisma.shoot.count()
    const videos = await prisma.video.count()
    const tasks = await prisma.task.count()
    const payments = await prisma.payment.count()
    const expenses = await prisma.expense.count()
    const notifications = await prisma.notification.count()

    console.log(JSON.stringify({
      clients, orders, scripts, creators, shoots, videos, tasks, payments, expenses, notifications
    }, null, 2))
  } catch (err) {
    console.error("DATABASE COUNT VERIFICATION: NOT AVAILABLE", err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
