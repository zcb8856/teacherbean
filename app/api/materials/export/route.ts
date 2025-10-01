// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { z } from 'zod'
import JSZip from 'jszip'

const exportSchema = z.object({
  material_ids: z.array(z.string().uuid()).min(1),
  format: z.enum(['json', 'zip']).default('zip'),
  include_metadata: z.boolean().default(true)
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const { material_ids, format, include_metadata } = exportSchema.parse(body)

    // Fetch materials that user has access to
    const { data: materials, error: materialsError } = await supabase
      .from('materials')
      .select(`
        *,
        profiles!materials_owner_id_fkey (
          display_name,
          school_name
        )
      `)
      .in('id', material_ids)

    if (materialsError) {
      console.error('Error fetching materials:', materialsError)
      return NextResponse.json(
        { message: 'Failed to fetch materials' },
        { status: 500 }
      )
    }

    if (!materials || materials.length === 0) {
      return NextResponse.json(
        { message: 'No accessible materials found' },
        { status: 404 }
      )
    }

    // Get user profile for permission check
    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    // Filter materials based on permissions
    const accessibleMaterials = materials.filter(material => {
      return material.owner_id === user.id ||
        material.shared === 'public' ||
        (material.shared === 'school' && material.school_id === profile?.school_id)
    })

    if (accessibleMaterials.length === 0) {
      return NextResponse.json(
        { message: 'No accessible materials found' },
        { status: 403 }
      )
    }

    // Prepare export data
    const exportData = accessibleMaterials.map(material => {
      const baseData = {
        id: material.id,
        type: material.type,
        title: material.title,
        description: material.description,
        content_json: material.content_json,
        tags: material.tags,
        cefr_level: material.cefr_level,
        estimated_duration: material.estimated_duration,
        created_at: material.created_at,
        updated_at: material.updated_at
      }

      if (include_metadata) {
        return {
          ...baseData,
          metadata: {
            owner_name: material.profiles?.display_name || 'Anonymous',
            school_name: material.profiles?.school_name || 'Unknown School',
            shared: material.shared,
            download_count: material.download_count || 0,
            favorite_count: material.favorite_count || 0,
            view_count: material.view_count || 0
          }
        }
      }

      return baseData
    })

    if (format === 'json') {
      // Return JSON response
      return NextResponse.json({
        materials: exportData,
        export_info: {
          total_materials: exportData.length,
          export_date: new Date().toISOString(),
          exported_by: user.id,
          format: 'json'
        }
      })
    }

    // Create ZIP file
    const zip = new JSZip()

    // Add individual material files
    exportData.forEach((material, index) => {
      const fileName = `${String(index + 1).padStart(2, '0')}_${material.title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_')}.json`
      zip.file(fileName, JSON.stringify(material, null, 2))
    })

    // Add manifest file
    const manifest = {
      export_info: {
        total_materials: exportData.length,
        export_date: new Date().toISOString(),
        exported_by: user.id,
        format: 'zip'
      },
      materials_index: exportData.map((material, index) => ({
        index: index + 1,
        id: material.id,
        title: material.title,
        type: material.type,
        file_name: `${String(index + 1).padStart(2, '0')}_${material.title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_')}.json`
      }))
    }

    zip.file('manifest.json', JSON.stringify(manifest, null, 2))

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    // Update download counts
    for (const material of accessibleMaterials) {
      await supabase.rpc('increment_material_download_count', {
        material_id: material.id
      })
    }

    // Return ZIP file
    const fileName = `materials_export_${new Date().toISOString().split('T')[0]}.zip`

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': zipBuffer.length.toString()
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error exporting materials:', error)
    return NextResponse.json(
      { message: 'Failed to export materials' },
      { status: 500 }
    )
  }
}