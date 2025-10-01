import { test as cleanup } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { testUsers } from './fixtures/auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

cleanup('cleanup test database', async () => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('Cleaning up test database...')

  try {
    // Get test user IDs
    const { data: testProfiles } = await supabase
      .from('profiles')
      .select('id')
      .in('email', Object.values(testUsers).map(u => u.email))

    if (testProfiles && testProfiles.length > 0) {
      const testUserIds = testProfiles.map(p => p.id)

      // Clean up test data in correct order (respecting foreign key constraints)
      console.log('Deleting submissions...')
      await supabase.from('submissions').delete().in('assignment_id',
        supabase.from('assignments').select('id').in('class_id',
          supabase.from('classes').select('id').in('owner_id', testUserIds)
        )
      )

      console.log('Deleting writings...')
      await supabase.from('writings').delete().in('user_id', testUserIds)

      console.log('Deleting assignments...')
      await supabase.from('assignments').delete().in('class_id',
        supabase.from('classes').select('id').in('owner_id', testUserIds)
      )

      console.log('Deleting students...')
      await supabase.from('students').delete().in('class_id',
        supabase.from('classes').select('id').in('owner_id', testUserIds)
      )

      console.log('Deleting material favorites...')
      await supabase.from('material_favorites').delete().in('user_id', testUserIds)

      console.log('Deleting classes...')
      await supabase.from('classes').delete().in('owner_id', testUserIds)

      console.log('Deleting materials...')
      await supabase.from('materials').delete().in('owner_id', testUserIds)

      console.log('Deleting items...')
      await supabase.from('items').delete().in('owner_id', testUserIds)

      console.log('Deleting learning analytics...')
      await supabase.from('learning_analytics').delete().in('class_id',
        supabase.from('classes').select('id').in('owner_id', testUserIds)
      )

      // Delete auth users (this should cascade to profiles)
      console.log('Deleting auth users...')
      for (const userId of testUserIds) {
        const { error } = await supabase.auth.admin.deleteUser(userId)
        if (error && !error.message.includes('not found')) {
          console.warn(`Error deleting user ${userId}:`, error.message)
        }
      }
    }

    console.log('Test database cleanup completed successfully')
  } catch (error) {
    console.error('Error during cleanup:', error)
    // Don't fail the cleanup - log and continue
  }
})