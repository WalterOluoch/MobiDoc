require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const config = require('./config');

const seed = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});

    // Create admin
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      const adminPasswordHash = await bcrypt.hash('Password123', config.bcryptSaltRounds);
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        passwordHash: adminPasswordHash,
        role: 'admin',
        phone: '+1234567890',
      });
      console.log('✅ Admin created:', admin.email);
    } else {
      console.log('ℹ️  Admin already exists');
    }

    // Create approved doctor
    const doctorExists = await User.findOne({ email: 'doctor@example.com' });
    if (!doctorExists) {
      const doctorPasswordHash = await bcrypt.hash('Password123', config.bcryptSaltRounds);
      const doctor = await User.create({
        name: 'Dr. John Smith',
        email: 'doctor@example.com',
        passwordHash: doctorPasswordHash,
        role: 'doctor',
        phone: '+1234567891',
        specialties: ['Cardiology', 'General Medicine'],
        licenseNumber: 'MD12345',
        kycStatus: 'approved',
        available: true,
      });
      console.log('✅ Doctor created:', doctor.email);
    } else {
      console.log('ℹ️  Doctor already exists');
    }

    // Create patient
    const patientExists = await User.findOne({ email: 'patient@example.com' });
    if (!patientExists) {
      const patientPasswordHash = await bcrypt.hash('Password123', config.bcryptSaltRounds);
      const patient = await User.create({
        name: 'Jane Doe',
        email: 'patient@example.com',
        passwordHash: patientPasswordHash,
        role: 'patient',
        phone: '+1234567892',
      });
      console.log('✅ Patient created:', patient.email);
    } else {
      console.log('ℹ️  Patient already exists');
    }

    console.log('\n📋 Demo Credentials:');
    console.log('Admin: admin@example.com / Password123');
    console.log('Doctor: doctor@example.com / Password123');
    console.log('Patient: patient@example.com / Password123');

    await mongoose.connection.close();
    console.log('\n✅ Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seed();

