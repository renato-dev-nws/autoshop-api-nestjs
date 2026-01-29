import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Iniciando seed...');

  try {
    // Seed de Categorias/Tipos de Veículos
    console.log('📦 Criando categorias de veículos...');
    await dataSource.query(`
      INSERT INTO vehicle_types (name, icon, active) 
      VALUES
        ('Sedan', '🚗', true),
        ('SUV', '🚙', true),
        ('Hatchback', '🚗', true),
        ('Pickup', '🛻', true),
        ('Moto', '🏍️', true),
        ('Caminhão', '🚚', true)
      ON CONFLICT DO NOTHING;
    `);

    // Seed de Loja Matriz
    console.log('🏢 Criando loja matriz...');
    await dataSource.query(`
      INSERT INTO stores (name, cnpj, address, phone, parent_id) 
      VALUES
        ('Matriz São Paulo', '12.345.678/0001-90', 'Av. Paulista, 1000 - São Paulo, SP', '(11) 98888-7777', NULL),
        ('Filial Campinas', '12.345.678/0002-71', 'Av. Brasil, 500 - Campinas, SP', '(19) 98777-6666', 1)
      ON CONFLICT (cnpj) DO NOTHING;
    `);

    // Seed de Usuário Admin
    console.log('👤 Criando usuário admin...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await dataSource.query(`
      INSERT INTO users (email, password, name, role, store_id, active) 
      VALUES
        ('admin@autoshop.com', '${hashedPassword}', 'Admin User', 'admin', NULL, true),
        ('manager@autoshop.com', '${await bcrypt.hash('manager123', 10)}', 'Manager User', 'manager', 1, true)
      ON CONFLICT (email) DO NOTHING;
    `);

    // Seed de Marcas
    console.log('🏷️ Criando marcas...');
    await dataSource.query(`
      INSERT INTO brands (brand_fipe_id, name, logo) 
      VALUES
        ('21', 'FIAT', NULL),
        ('22', 'FORD', NULL),
        ('23', 'GM - CHEVROLET', NULL),
        ('24', 'HONDA', NULL),
        ('25', 'HYUNDAI', NULL),
        ('26', 'NISSAN', NULL),
        ('27', 'PEUGEOT', NULL),
        ('28', 'RENAULT', NULL),
        ('29', 'TOYOTA', NULL),
        ('30', 'VOLKSWAGEN', NULL)
      ON CONFLICT DO NOTHING;
    `);

    // Seed de Modelos
    console.log('🚗 Criando modelos...');
    await dataSource.query(`
      INSERT INTO vehicle_models (brand_id, model_fipe_id, name) 
      VALUES
        (1, '5940', 'PALIO 1.0 FIRE'),
        (1, '5941', 'UNO 1.0 VIVACE'),
        (9, '5942', 'COROLLA GLI UPPER 2.0'),
        (9, '5943', 'HILUX CD 4X4 2.8'),
        (10, '5944', 'GOL 1.0'),
        (10, '5945', 'AMAROK CD 4X4 2.0')
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Seed concluído com sucesso!');
    console.log('');
    console.log('📋 Credenciais padrão:');
    console.log('   Admin:');
    console.log('   - Email: admin@autoshop.com');
    console.log('   - Senha: admin123');
    console.log('');
    console.log('   Manager:');
    console.log('   - Email: manager@autoshop.com');
    console.log('   - Senha: manager123');
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
  } finally {
    await app.close();
  }
}

seed();
