import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const materialId = params.id

    // Check if material exists and user has access
    const { data: material, error: materialError } = await supabase
      .from('materials')
      .select('id, owner_id, shared, school_id')
      .eq('id', materialId)
      .single()

    if (materialError || !material) {
      return NextResponse.json(
        { message: 'Material not found' },
        { status: 404 }
      )
    }

    // Get user profile for permission check
    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    // Check if user can access this material
    const canAccess = material.owner_id === user.id ||
      material.shared === 'public' ||
      (material.shared === 'school' && material.school_id === profile?.school_id)

    if (!canAccess) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    // Check if already favorited
    const { data: existingFavorite } = await supabase
      .from('material_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('material_id', materialId)
      .single()

    if (existingFavorite) {
      return NextResponse.json(
        { message: 'Material already favorited' },
        { status: 400 }
      )
    }

    // Add favorite
    const { error: favoriteError } = await supabase
      .from('material_favorites')
      .insert({
        user_id: user.id,
        material_id: materialId,
        created_at: new Date().toISOString()
      })

    if (favoriteError) {
      console.error('Error adding favorite:', favoriteError)
      return NextResponse.json(
        { message: 'Failed to add favorite' },
        { status: 500 }
      )
    }

    // Update favorite count
    await supabase.rpc('increment_material_favorite_count', {
      material_id: materialId
    })

    return NextResponse.json({
      message: 'Material favorited successfully'
    })

  } catch (error) {
    console.error('Error favoriting material:', error)
    return NextResponse.json(
      { message: 'Failed to favorite material' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const materialId = params.id

    // Check if favorite exists
    const { data: favorite, error: favoriteError } = await supabase
      .from('material_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('material_id', materialId)
      .single()

    if (favoriteError || !favorite) {
      return NextResponse.json(
        { message: 'Favorite not found' },
        { status: 404 }
      )
    }

    // Remove favorite
    const { error: deleteError } = await supabase
      .from('material_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('material_id', materialId)

    if (deleteError) {
      console.error('Error removing favorite:', deleteError)
      return NextResponse.json(
        { message: 'Failed to remove favorite' },
        { status: 500 }
      )
    }

    // Update favorite count
    await supabase.rpc('decrement_material_favorite_count', {
      material_id: materialId
    })

    return NextResponse.json({
      message: 'Material unfavorited successfully'
    })

  } catch (error) {
    console.error('Error unfavoriting material:', error)
    return NextResponse.json(
      { message: 'Failed to unfavorite material' },
      { status: 500 }
    )
  }
}