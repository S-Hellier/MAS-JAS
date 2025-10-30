const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deleteAllUsers() {
  try {
    console.log('🗑️  Deleting all users...');

    // First, get count of users
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Found ${userCount} users`);

    if (userCount === 0) {
      console.log('✅ No users to delete');
      return;
    }

    // Delete all users (this will cascade delete pantry_items)
    const { error, count } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using a dummy condition)

    if (error) {
      console.error('❌ Error deleting users:', error);
      process.exit(1);
    }

    console.log(`✅ Successfully deleted all users`);
    console.log('📝 Note: All associated pantry items were also deleted (cascade)');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

deleteAllUsers();
