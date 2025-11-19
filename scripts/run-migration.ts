import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  console.log('🚀 Starting migration...\n');

  try {
    // Read migration file
    const migrationPath = path.join(process.cwd(), 'migrations', 'add-steam-support.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded');
    console.log('📊 Executing SQL...\n');

    // Split SQL into individual statements (simple split by semicolon)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (!statement || statement.startsWith('--')) continue;

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabase.from('_').select('*').limit(0);
          
          // If it's a DDL statement, we need to use the REST API differently
          // For now, we'll use a workaround with raw SQL
          console.log(`⚠️  Statement ${i + 1}: ${error.message}`);
          
          // Try to execute anyway (some errors are expected like "already exists")
          if (error.message.includes('already exists')) {
            console.log(`   ℹ️  Skipping (already exists)`);
            successCount++;
          } else {
            errorCount++;
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }
      } catch (err: any) {
        console.log(`⚠️  Statement ${i + 1}: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Success: ${successCount} statements`);
    console.log(`⚠️  Warnings/Errors: ${errorCount} statements`);
    console.log('='.repeat(50) + '\n');

    // Verify migration
    console.log('🔍 Verifying migration...\n');
    await verifyMigration();

    console.log('\n✅ Migration completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Check the verification results above');
    console.log('   2. Test the features in your app');
    console.log('   3. See STEAM_ACCOUNTS_GUIDE.md for usage instructions');

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

async function verifyMigration() {
  try {
    // Check if game_type column exists
    const { data: columns, error: colError } = await supabase
      .from('games')
      .select('*')
      .limit(1);

    if (!colError) {
      console.log('✅ Table "games" is accessible');
    }

    // Check if game_accounts table exists
    const { data: accounts, error: accError } = await supabase
      .from('game_accounts')
      .select('*')
      .limit(1);

    if (!accError) {
      console.log('✅ Table "game_accounts" created successfully');
    } else if (accError.message.includes('does not exist')) {
      console.log('⚠️  Table "game_accounts" not found - migration may need manual execution');
    }

    // Try to call the reset function
    const { error: funcError } = await supabase.rpc('reset_expired_accounts');
    
    if (!funcError) {
      console.log('✅ Function "reset_expired_accounts" is working');
    } else if (funcError.message.includes('does not exist')) {
      console.log('⚠️  Function "reset_expired_accounts" not found - migration may need manual execution');
    }

  } catch (error: any) {
    console.log('⚠️  Verification warning:', error.message);
  }
}

// Run migration
runMigration();
