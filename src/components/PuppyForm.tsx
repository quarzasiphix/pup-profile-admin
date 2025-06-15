import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Baby, Weight, BadgeCheck } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ImageUpload } from "@/components/ImageUpload"
import { ThumbnailSelector } from "@/components/ThumbnailSelector"

interface Puppy {
  id: string
  name: string
  weight_at_birth: number | null
  mom: string | null
  dad: string | null
  mom_color: string | null
  dad_color: string | null
  litter_letter: string
}

interface PuppyFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  puppy?: Puppy | null
  onSuccess: () => void
}

export const PuppyForm = ({ open, onOpenChange, puppy, onSuccess }: PuppyFormProps) => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [parents, setParents] = useState<{ id: string; name: string; gender: string }[]>([])
  const [images, setImages] = useState<Array<{id:string;image_url:string;image_name:string|null;sort_order:number|null;is_thumbnail:boolean;}>>([])
  const [imageUploading, setImageUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    litter_letter: "",
    weight_at_birth: "",
    mom: "",
    mom_color: "",
    dad: "",
    dad_color: "",
  })

  useEffect(() => {
    const fetchParents = async () => {
      const { data, error } = await supabase
        .from("dogs")
        .select("id,name,gender")
        .eq("is_active", true)
      if (!error) setParents(data as any)
    }
    fetchParents()
  }, [])

  useEffect(() => {
    if (puppy) {
      setFormData({
        name: puppy.name,
        litter_letter: puppy.litter_letter,
        weight_at_birth: puppy.weight_at_birth?.toString() ?? "",
        mom: puppy.mom ?? "",
        mom_color: puppy.mom_color ?? "",
        dad: puppy.dad ?? "",
        dad_color: puppy.dad_color ?? "",
      })
      fetchImages(puppy.id)
    } else {
      setFormData({
        name: "",
        litter_letter: "",
        weight_at_birth: "",
        mom: "",
        mom_color: "",
        dad: "",
        dad_color: "",
      })
      setImages([])
    }
  }, [puppy, open])

  const fetchImages = async (id: string) => {
    const { data, error } = await (supabase as any)
      .from("puppy_images")
      .select("*")
      .eq("puppy_id", id)
      .order("sort_order", { ascending: true })
    if (!error) setImages(data)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.litter_letter || formData.litter_letter.length !== 1) {
      toast({ title: "Błąd", description: "Podaj jedną literę miotu", variant: "destructive" })
      return
    }
    if (!formData.name.toUpperCase().startsWith(formData.litter_letter.toUpperCase())) {
      toast({ title: "Błąd", description: "Imię musi zaczynać się na literę miotu", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const payload: any = {
        name: formData.name,
        litter_letter: formData.litter_letter.toUpperCase(),
        weight_at_birth: formData.weight_at_birth ? parseFloat(formData.weight_at_birth) : null,
        mom: formData.mom || null,
        dad: formData.dad || null,
        mom_color: formData.mom_color || null,
        dad_color: formData.dad_color || null,
      }
      if (puppy) {
        const { error } = await (supabase as any).from("puppies").update(payload).eq("id", puppy.id)
        if (error) throw error
      } else {
        const { error, data: inserted } = await (supabase as any).from("puppies").insert(payload).select('*').single()
        if (error) throw error
        const newId = inserted.id
        if (images.length) {
          const inserts = images.map((img, idx) => ({
            puppy_id: newId,
            image_url: img.image_url,
            image_name: img.image_name,
            original_name: img.image_name,
            sort_order: idx,
            is_thumbnail: img.is_thumbnail,
          }))
          await (supabase as any).from("puppy_images").insert(inserts)
        }
      }
      toast({ title: "Sukces", description: "Zapisano szczenię" })
      onSuccess()
    } catch (err) {
      toast({ title: "Błąd", description: "Nie udało się zapisać", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const maleDogs = parents.filter((p) => p.gender === "male")
  const femaleDogs = parents.filter((p) => p.gender === "female")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-auto inset-0 w-screen h-screen max-w-none max-h-none translate-x-0 translate-y-0 rounded-none border-0 p-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[95vw] sm:max-w-xl sm:h-[95vh] sm:max-h-[95vh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center">{puppy ? "Edytuj szczenię" : "Dodaj szczenię"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <Label className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <BadgeCheck className="h-4 w-4" /> Litera miotu
              </Label>
              <Input
                value={formData.litter_letter}
                maxLength={1}
                onChange={(e) => handleChange("litter_letter", e.target.value.toUpperCase())}
                className="mt-2 h-10 sm:h-12 text-base sm:text-lg"
                placeholder="A"
                required
              />
            </div>

            <div>
              <Label className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Baby className="h-4 w-4" /> Imię szczenięcia
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="mt-2 h-10 sm:h-12 text-base sm:text-lg"
                placeholder="Veronica Dolly"
                required
              />
            </div>

            <div>
              <Label className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Weight className="h-4 w-4" /> Waga przy urodzeniu (kg)
              </Label>
              <Input
                type="number"
                step="0.01"
                value={formData.weight_at_birth}
                onChange={(e) => handleChange("weight_at_birth", e.target.value)}
                className="mt-2 h-10 sm:h-12 text-base sm:text-lg"
                placeholder="0.25"
              />
            </div>

            <div>
              <Label className="text-base sm:text-lg font-semibold">Matka</Label>
              <Select value={formData.mom} onValueChange={(v) => handleChange("mom", v)}>
                <SelectTrigger className="mt-2 h-10 sm:h-12 text-base sm:text-lg"><SelectValue placeholder="Wybierz" /></SelectTrigger>
                <SelectContent>
                  {femaleDogs.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-base sm:text-lg font-semibold">Kolor matki</Label>
              <Input
                value={formData.mom_color}
                onChange={(e) => handleChange("mom_color", e.target.value)}
                className="mt-2 h-10 sm:h-12 text-base sm:text-lg"
                placeholder="cream"
              />
            </div>

            <div>
              <Label className="text-base sm:text-lg font-semibold">Ojciec</Label>
              <Select value={formData.dad} onValueChange={(v) => handleChange("dad", v)}>
                <SelectTrigger className="mt-2 h-10 sm:h-12 text-base sm:text-lg"><SelectValue placeholder="Wybierz" /></SelectTrigger>
                <SelectContent>
                  {maleDogs.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-base sm:text-lg font-semibold">Kolor ojca</Label>
              <Input
                value={formData.dad_color}
                onChange={(e) => handleChange("dad_color", e.target.value)}
                className="mt-2 h-10 sm:h-12 text-base sm:text-lg"
                placeholder="białe"
              />
            </div>
          </div>

          <ImageUpload
            puppyId={puppy?.id}
            images={images}
            onImagesChange={setImages}
            maxImages={5}
            onUploadingChange={setImageUploading}
          />

          {images.length > 0 && (
            <ThumbnailSelector
              images={images}
              onThumbnailChange={(imageId) =>
                setImages((prev) => prev.map((img) => ({ ...img, is_thumbnail: img.id === imageId })))}
            />
          )}

          <div className="sticky bottom-0 -mx-4 sm:-mx-6 bg-background border-t p-4 sm:p-6 flex flex-col sm:flex-row gap-4 z-10">
            <Button type="submit" disabled={loading || imageUploading} className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-semibold">
              {loading ? "Zapisywanie…" : puppy ? "💾 Zaktualizuj Szczenię" : "✨ Dodaj Szczenię"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg">
              ❌ Anuluj
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 