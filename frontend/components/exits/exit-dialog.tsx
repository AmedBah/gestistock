"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { useMockData } from "@/hooks/use-mock-data"
import { Textarea } from "@/components/ui/textarea"
import { X, Plus } from "lucide-react"
import type { ExitForm, ExitItem } from "@/types/exit-form"
import type { Product } from "@/types/product"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const exitItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, "Le produit est requis"),
  quantity: z.coerce.number().positive("La quantité doit être positive").int("La quantité doit être un nombre entier"),
})

const exitFormSchema = z.object({
  reference: z.string().min(1, "La référence est requise"),
  date: z.string().min(1, "La date est requise"),
  destination: z.string().min(1, "La destination est requise"),
  reason: z.string().min(1, "La raison est requise"),
  notes: z.string().optional(),
  items: z.array(exitItemSchema).min(1, "Au moins un produit est requis"),
})

interface ExitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExitDialog({ open, onOpenChange }: ExitDialogProps) {
  const { products, addExitForm } = useMockData()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof exitFormSchema>>({
    resolver: zodResolver(exitFormSchema),
    defaultValues: {
      reference: `BS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
      date: new Date().toISOString().split("T")[0],
      destination: "",
      reason: "",
      notes: "",
      items: [
        {
          id: uuidv4(),
          productId: "",
          quantity: 1,
        },
      ],
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        reference: `BS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
        date: new Date().toISOString().split("T")[0],
        destination: "",
        reason: "",
        notes: "",
        items: [
          {
            id: uuidv4(),
            productId: "",
            quantity: 1,
          },
        ],
      })
    }
  }, [open, form])

  const addItem = () => {
    const currentItems = form.getValues().items || []
    form.setValue("items", [
      ...currentItems,
      {
        id: uuidv4(),
        productId: "",
        quantity: 1,
      },
    ])
  }

  const removeItem = (index: number) => {
    const currentItems = form.getValues().items || []
    if (currentItems.length > 1) {
      form.setValue(
        "items",
        currentItems.filter((_, i) => i !== index),
      )
    }
  }

  const getProductById = (productId: string): Product | undefined => {
    return products.find((product) => product.id === productId)
  }

  const getMaxQuantity = (productId: string): number => {
    const product = getProductById(productId)
    return product ? product.quantity : 0
  }

  const onSubmit = async (values: z.infer<typeof exitFormSchema>) => {
    setIsSubmitting(true)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const exitItems: ExitItem[] = values.items.map((item) => {
        const product = getProductById(item.productId)
        if (!product) throw new Error("Produit non trouvé")

        return {
          id: item.id || uuidv4(),
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
        }
      })

      const exitForm: ExitForm = {
        id: uuidv4(),
        reference: values.reference,
        date: values.date,
        destination: values.destination,
        reason: values.reason,
        notes: values.notes || "",
        status: "completed",
        items: exitItems,
      }

      addExitForm(exitForm)
      onOpenChange(false)
    } catch (error) {
      console.error("Error submitting exit form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Nouveau bon de sortie</DialogTitle>
          <DialogDescription>Créez un nouveau bon de sortie pour enregistrer une sortie de stock.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Référence</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input placeholder="Client, département, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raison</FormLabel>
                    <FormControl>
                      <Input placeholder="Vente, utilisation interne, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium">Produits</h3>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-1 h-4 w-4" />
                  Ajouter un produit
                </Button>
              </div>

              <div className="space-y-4">
                {form.getValues().items.map((_, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 rounded-md border p-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <FormItem className="col-span-8">
                          <FormLabel className="sr-only">Produit</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un produit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products
                                .filter((product) => product.quantity > 0)
                                .map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} ({product.reference}) - Stock: {product.quantity}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <FormLabel className="sr-only">Quantité</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max={
                                form.getValues().items[index]?.productId
                                  ? getMaxQuantity(form.getValues().items[index].productId)
                                  : 1
                              }
                              placeholder="Qté"
                              {...field}
                            />
                          </FormControl>
                          {form.getValues().items[index]?.productId && (
                            <p className="text-xs text-muted-foreground">
                              Max: {getMaxQuantity(form.getValues().items[index].productId)}
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="col-span-1 flex items-center justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={form.getValues().items.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {form.formState.errors.items?.message && (
                <p className="mt-2 text-sm text-destructive">{form.formState.errors.items.message}</p>
              )}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notes ou commentaires sur cette sortie..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
