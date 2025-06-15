import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash, Image as ImageIcon } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

interface Puppy {
  id: string
  name: string
  litter_letter: string
  weight_at_birth: number | null
  mom_color: string | null
  dad_color: string | null
}

interface Props {
  puppy: Puppy
  onEdit: (p: Puppy) => void
  onDelete: (id: string) => void
}

export const PuppyCard = ({ puppy, onEdit, onDelete }: Props) => {
  const [thumb, setThumb] = useState<string | null>(null)

  useEffect(() => {
    const fetchThumb = async () => {
      const { data, error } = await (supabase as any)
        .from('puppy_images')
        .select('image_url,is_thumbnail')
        .eq('puppy_id', puppy.id)
        .order('is_thumbnail', { ascending: false })
        .order('sort_order', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (!error && data) setThumb(data.image_url)
    }
    fetchThumb()
  }, [puppy.id])

  return (
    <Card className="p-4 flex flex-col gap-3 shadow-lg">
      {/* Thumbnail */}
      {thumb ? (
        <div className="aspect-video rounded-md overflow-hidden bg-gray-100">
          <img src={thumb} alt={puppy.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-video rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
          <ImageIcon className="h-8 w-8" />
        </div>
      )}

      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold">
          {puppy.name} <Badge>{puppy.litter_letter}</Badge>
        </h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(puppy)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(puppy.id)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {puppy.weight_at_birth && (
        <p className="text-sm text-gray-600">Waga przy urodzeniu: {puppy.weight_at_birth} kg</p>
      )}
      {(puppy.mom_color || puppy.dad_color) && (
        <div className="text-xs text-gray-500">
          {puppy.mom_color && <span>Kolor matki: {puppy.mom_color} </span>}
          {puppy.dad_color && <span>Kolor ojca: {puppy.dad_color}</span>}
        </div>
      )}
    </Card>
  )
} 