// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { sampleMaterials } from '@/data/sample-materials'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if materials already exist for this user
    const { data: existingMaterials, error: checkError } = await supabase
      .from('materials')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)

    if (checkError) {
      console.error('Error checking existing materials:', checkError)
      return NextResponse.json(
        { message: 'Failed to check existing data' },
        { status: 500 }
      )
    }

    if (existingMaterials && existingMaterials.length > 0) {
      return NextResponse.json({
        message: 'Sample materials already exist',
        count: existingMaterials.length
      })
    }

    // Get user profile for school information
    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    // Insert sample materials
    const materialsToInsert = sampleMaterials.map(material => ({
      ...material,
      owner_id: user.id,
      school_id: profile?.school_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      download_count: Math.floor(Math.random() * 50) + 10, // Random downloads 10-60
      favorite_count: Math.floor(Math.random() * 15) + 2,  // Random favorites 2-17
      view_count: Math.floor(Math.random() * 100) + 20     // Random views 20-120
    }))

    const { data: insertedMaterials, error: insertError } = await supabase
      .from('materials')
      .insert(materialsToInsert)
      .select('id, type, title')

    if (insertError) {
      console.error('Error inserting sample materials:', insertError)
      return NextResponse.json(
        { message: 'Failed to insert sample data', error: insertError.message },
        { status: 500 }
      )
    }

    // Generate some sample favorites for demo
    await generateSampleFavorites(supabase, user.id, insertedMaterials)

    return NextResponse.json({
      message: 'Sample materials inserted successfully',
      materials_count: insertedMaterials?.length || 0,
      materials_by_type: insertedMaterials?.reduce((acc, material) => {
        acc[material.type] = (acc[material.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    })

  } catch (error) {
    console.error('Error seeding materials:', error)
    return NextResponse.json(
      { message: 'Failed to seed materials' },
      { status: 500 }
    )
  }
}

async function generateSampleFavorites(supabase: any, userId: string, materials: any[]) {
  try {
    // Randomly favorite 2-3 materials
    const materialsToFavorite = materials.slice(0, Math.floor(Math.random() * 2) + 2)

    const favorites = materialsToFavorite.map(material => ({
      user_id: userId,
      material_id: material.id,
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Random time in last 7 days
    }))

    if (favorites.length > 0) {
      const { error: favoritesError } = await supabase
        .from('material_favorites')
        .insert(favorites)

      if (favoritesError) {
        console.error('Error inserting sample favorites:', favoritesError)
      } else {
        console.log(`Inserted ${favorites.length} sample favorites`)
      }
    }

  } catch (error) {
    console.error('Error generating sample favorites:', error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all user's materials
    const { error: materialsError } = await supabase
      .from('materials')
      .delete()
      .eq('owner_id', user.id)

    if (materialsError) {
      console.error('Error deleting materials:', materialsError)
      return NextResponse.json(
        { message: 'Failed to delete materials' },
        { status: 500 }
      )
    }

    // Delete user's favorites (should cascade automatically, but just in case)
    await supabase
      .from('material_favorites')
      .delete()
      .eq('user_id', user.id)

    return NextResponse.json({
      message: 'Sample materials cleared successfully'
    })

  } catch (error) {
    console.error('Error clearing sample materials:', error)
    return NextResponse.json(
      { message: 'Failed to clear sample materials' },
      { status: 500 }
    )
  }
}