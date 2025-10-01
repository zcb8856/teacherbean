// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface RouteParams {
  params: {
    id: string
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Delete item
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)
      .eq('owner_id', session.user.id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { message: 'Failed to delete item' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Item deleted successfully' })

  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { message: 'Failed to delete item' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Get single item
    const { data: item, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .eq('owner_id', session.user.id)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)

  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      { message: 'Failed to fetch item' },
      { status: 500 }
    )
  }
}