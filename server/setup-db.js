// Setup initial database with sample users
import { db } from './firebase.js';

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...\n');

    // Create sample users
    const users = [
      {
        id: 'admin001',
        name: 'Admin User',
        email: 'admin@company.com',
        password: 'admin123', // In production, use bcrypt hashing
        role: 'Admin',
        location: 'Head Office',
        department: 'Management',
        optionalField1: 'IT Department',
        optionalField2: 'Senior Level',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'approver001',
        name: 'Approver User',
        email: 'approver@company.com',
        password: 'approver123',
        role: 'Approver',
        location: 'Branch Office',
        department: 'Finance',
        optionalField1: 'Finance Team',
        optionalField2: 'Manager Level',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'employee001',
        name: 'Employee User',
        email: 'employee@company.com',
        password: 'employee123',
        role: 'Employee',
        location: 'Regional Office',
        department: 'Sales',
        optionalField1: 'Sales Team',
        optionalField2: 'Executive Level',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Add users to Firestore
    console.log('📝 Creating users...');
    for (const user of users) {
      await db.collection('users').doc(user.id).set(user);
      console.log(`✓ Created ${user.role}: ${user.name} (${user.email})`);
    }

    console.log('\n✅ Database setup complete!\n');
    console.log('Login credentials:');
    console.log('─────────────────────────────────────────');
    console.log('Admin    → Name: Admin User      | Password: admin123');
    console.log('Approver → Name: Approver User   | Password: approver123');
    console.log('Employee → Name: Employee User   | Password: employee123');
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
