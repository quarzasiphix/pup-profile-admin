import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash } from "lucide-react"

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

export const PuppyCard = ({ puppy, onEdit, onDelete }: Props) => (
  <Card className="p-4 flex flex-col gap-2 shadow-lg">
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