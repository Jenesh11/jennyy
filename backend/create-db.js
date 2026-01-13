const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres'
});

client.connect()
    .then(() => {
        console.log('✅ Connected to PostgreSQL');
        return client.query('CREATE DATABASE medusa_backend;');
    })
    .then(() => {
        console.log('✅ Database medusa_backend created successfully!');
        return client.end();
    })
    .catch(err => {
        if (err.code === '42P04') {
            console.log('ℹ️  Database medusa_backend already exists');
        } else {
            console.error('❌ Error:', err.message);
        }
        client.end();
    });
