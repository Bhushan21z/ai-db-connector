import pkg from 'pg';
const { Client } = pkg;
// ============================================
// CONFIGURATION - REPLACE WITH YOUR VALUES
// ============================================
const SUPABASE_URL = 'https://idmtbsuidlyhvfvezshx.supabase.co';  // e.g., https://abcdefgh.supabase.co
const SUPABASE_PASSWORD = 'Bhushan21z@new';            // Your database password

// ============================================
// TEST SCRIPT
// ============================================

async function testSupabaseConnection() {
    console.log('🔄 Testing Supabase PostgreSQL connection...\n');

    // Extract project reference from URL
    const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
    console.log(`📌 Project Reference: ${projectRef}`);

    // Construct PostgreSQL connection string
    const connectionString = `postgresql://postgres:${SUPABASE_PASSWORD}@db.${projectRef}.supabase.co:5432/postgres`;
    console.log(`📌 Connection String: postgresql://postgres:****@db.${projectRef}.supabase.co:5432/postgres\n`);

    const client = new Client({ connectionString });

    try {
        // Test connection
        console.log('⏳ Connecting to database...');
        await client.connect();
        console.log('✅ Successfully connected to Supabase!\n');

        // Test query - Get all users from users table
        console.log('⏳ Querying users table...');
        const result = await client.query('SELECT * FROM users LIMIT 10');

        console.log(`✅ Query successful! Found ${result.rows.length} user(s)\n`);
        console.log('📊 Users data:');
        console.log(JSON.stringify(result.rows, null, 2));

        // Show table columns
        console.log('\n📋 Table columns:');
        if (result.fields && result.fields.length > 0) {
            result.fields.forEach(field => {
                console.log(`  - ${field.name} (${field.dataTypeID})`);
            });
        }

    } catch (error) {
        console.error('❌ Error occurred:');
        console.error(`   Error Code: ${error.code}`);
        console.error(`   Message: ${error.message}`);

        // Provide helpful hints based on error
        if (error.code === 'ENOTFOUND') {
            console.error('\n💡 Hint: Check if your SUPABASE_URL is correct');
        } else if (error.code === '28P01') {
            console.error('\n💡 Hint: Invalid password. Check your database password');
        } else if (error.code === '42P01') {
            console.error('\n💡 Hint: Table "users" does not exist. Check your table name');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Hint: Connection refused. Check your project reference');
        }

    } finally {
        // Close connection
        await client.end();
        console.log('\n🔌 Connection closed');
    }
}

// Run the test
testSupabaseConnection();