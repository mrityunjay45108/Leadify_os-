import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Seeding Leadyfy OS database...')

  // Seed Owner
  const hashedPw = await bcrypt.hash('admin123', 12)

  const owner = await db.user.upsert({
    where: { email: 'owner@leadyfy.com' },
    update: {},
    create: {
      name:     'Agency Owner',
      email:    'owner@leadyfy.com',
      password: hashedPw,
      role:     'OWNER',
    },
  })

  await db.employee.upsert({
    where: { userId: owner.id },
    update: {},
    create: {
      userId:      owner.id,
      designation: 'Founder & Owner',
      department:  'Management',
    },
  })

  // Seed Admin
  const admin = await db.user.upsert({
    where: { email: 'admin@leadyfy.com' },
    update: {},
    create: {
      name:     'Operations Manager',
      email:    'admin@leadyfy.com',
      password: hashedPw,
      role:     'ADMIN',
    },
  })

  await db.employee.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId:      admin.id,
      designation: 'Operations Manager',
      department:  'Operations',
    },
  })

  // Seed Script Writer
  const emp = await db.user.upsert({
    where: { email: 'writer@leadyfy.com' },
    update: {},
    create: {
      name:     'Priya Verma',
      email:    'writer@leadyfy.com',
      password: hashedPw,
      role:     'EMPLOYEE',
    },
  })

  await db.employee.upsert({
    where: { userId: emp.id },
    update: {},
    create: {
      userId:      emp.id,
      designation: 'Script Writer',
      department:  'Content',
    },
  })

  // Seed sample client
  const clientUser = await db.user.upsert({
    where: { email: 'client@brand.com' },
    update: {},
    create: {
      name:     'Amit Patel',
      email:    'client@brand.com',
      password: hashedPw,
      role:     'CLIENT',
    },
  })

  const client = await db.client.upsert({
    where: { email: 'client@brand.com' },
    update: {},
    create: {
      userId:      clientUser.id,
      name:        'Amit Patel',
      companyName: 'Patel Organics',
      email:       'client@brand.com',
      phone:       '+91 98765 00001',
      brandName:   'PatelOrganics',
      industry:    'D2C / Health & Wellness',
      source:      'Instagram DM',
      status:      'ACTIVE',
    },
  })

  // Seed a creator
  const creator = await db.creator.upsert({
    where: { id: 'creator-seed-001' },
    update: {},
    create: {
      id:          'creator-seed-001',
      name:        'Sneha Gupta',
      gender:      'Female',
      ageGroup:    '22-28',
      languages:   ['Hindi', 'English'],
      location:    'Mumbai',
      niches:      ['Lifestyle', 'Beauty', 'D2C'],
      ratePerVideo: 2500,
      availability: 'AVAILABLE',
    },
  })

  // Seed an order
  const order = await db.order.upsert({
    where: { id: 'order-seed-001' },
    update: {},
    create: {
      id:             'order-seed-001',
      clientId:       client.id,
      packageName:    'Starter Pack — 10 UGC Videos',
      videoCount:     10,
      pricing:        25000,
      gstAmount:      4500,
      totalInvoice:   29500,
      amountReceived: 15000,
      outstandingBalance: 14500,
      status:         'IN_PRODUCTION',
    },
  })

  // Seed activity log
  await db.activityLog.createMany({
    skipDuplicates: true,
    data: [
      {
        userId:     owner.id,
        clientId:   client.id,
        action:     'created_client',
        entityType: 'client',
        entityId:   client.id,
      },
      {
        userId:     admin.id,
        clientId:   client.id,
        action:     'created_order',
        entityType: 'order',
        entityId:   order.id,
      },
    ],
  })

  console.log('✅ Seed complete!')
  console.log('\nLogin credentials:')
  console.log('  Owner:   owner@leadyfy.com / admin123')
  console.log('  Admin:   admin@leadyfy.com / admin123')
  console.log('  Employee: writer@leadyfy.com / admin123')
  console.log('  Client:  client@brand.com  / admin123')
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
