import mysql from 'mysql2/promise';
import fs from 'fs';

// Leer productos del JSON
const productos = JSON.parse(fs.readFileSync('/tmp/productos.json', 'utf-8'));

async function seedProducts() {
  const dbUrl = process.env.DATABASE_URL;
  const urlObj = new URL(dbUrl);
  
  const connection = await mysql.createConnection({
    host: urlObj.hostname,
    port: urlObj.port || 3306,
    user: urlObj.username,
    password: urlObj.password,
    database: urlObj.pathname.slice(1),
    ssl: { rejectUnauthorized: true },
  });

  try {
    console.log('Conectando a la base de datos...');
    
    // Limpiar productos existentes
    await connection.execute('DELETE FROM products');
    console.log('Tabla de productos limpiada');

    // Insertar productos
    let insertados = 0;
    for (const producto of productos) {
      try {
        await connection.execute(
          'INSERT INTO products (barcode, name, description, price, unit, hasSerial) VALUES (?, ?, ?, ?, ?, ?)',
          [
            producto.barcode || null,
            producto.name,
            producto.description,
            producto.price,
            producto.unit,
            producto.hasSerial ? 1 : 0,
          ]
        );
        insertados++;
      } catch (error) {
        console.error(`Error insertando producto: ${producto.name}`, error.message);
      }
    }

    console.log(`✅ ${insertados} productos cargados exitosamente`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

seedProducts();
