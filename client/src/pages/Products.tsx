import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function Products() {
  const [, setLocation] = useLocation();
  const { data: products, isLoading, refetch } = trpc.products.list.useQuery();
  const createProductMutation = trpc.products.create.useMutation();
  const updateProductMutation = trpc.products.update.useMutation();
  const deleteProductMutation = trpc.products.delete.useMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    barcode: "",
    name: "",
    description: "",
    price: "",
    unit: "",
    hasSerial: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProductMutation.mutateAsync({
          id: editingId,
          ...formData,
          price: formData.price,
        });
        toast.success("Producto actualizado");
      } else {
        await createProductMutation.mutateAsync(formData);
        toast.success("Producto creado");
      }
      setFormData({ barcode: "", name: "", description: "", price: "", unit: "", hasSerial: false });
      setEditingId(null);
      setShowForm(false);
      refetch();
    } catch (error) {
      toast.error("Error al guardar el producto");
      console.error(error);
    }
  };

  const handleEdit = (product: any) => {
    setFormData({
      barcode: product.barcode || "",
      name: product.name,
      description: product.description || "",
      price: product.price,
      unit: product.unit || "",
      hasSerial: product.hasSerial,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        await deleteProductMutation.mutateAsync(id);
        toast.success("Producto eliminado");
        refetch();
      } catch (error) {
        toast.error("Error al eliminar el producto");
        console.error(error);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ barcode: "", name: "", description: "", price: "", unit: "", hasSerial: false });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", background: "linear-gradient(to bottom right, #f8fafc, #f1f5f9)" }}>
      <div style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => setLocation("/")}
              style={{ padding: "0.5rem", background: "transparent", border: "1px solid #e2e8f0", borderRadius: "0.375rem", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <ArrowLeft style={{ width: "1.25rem", height: "1.25rem" }} />
            </button>
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e293b" }}>
                Gestión de Productos
              </h1>
              <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
                Administra el catálogo de productos
              </p>
            </div>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgb(59, 130, 246)", color: "white", padding: "0.75rem 1.5rem", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}
            >
              <Plus style={{ width: "1rem", height: "1rem" }} />
              Nuevo Producto
            </Button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <Card style={{ padding: "2rem", marginBottom: "2rem", border: "1px solid #e2e8f0" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", marginBottom: "1.5rem" }}>
              {editingId ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "0.5rem" }}>
                    Código de Barras
                  </label>
                  <Input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    placeholder="Ej: 7891234567890"
                    style={{ width: "100%", padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.375rem", fontSize: "1rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "0.5rem" }}>
                    Nombre del Producto *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej: Laptop Dell"
                    required
                    style={{ width: "100%", padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.375rem", fontSize: "1rem" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "0.5rem" }}>
                  Descripción
                </label>
                <Input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ej: Laptop Dell Inspiron 15"
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.375rem", fontSize: "1rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "0.5rem" }}>
                    Precio *
                  </label>
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Ej: 1200.00"
                    step="0.01"
                    required
                    style={{ width: "100%", padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.375rem", fontSize: "1rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "0.5rem" }}>
                    Unidad
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.375rem", fontSize: "1rem" }}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Unidad">Unidad</option>
                    <option value="Caja">Caja</option>
                    <option value="Paquete">Paquete</option>
                    <option value="Kg">Kg</option>
                    <option value="Litro">Litro</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  name="hasSerial"
                  checked={formData.hasSerial}
                  onChange={handleChange}
                  style={{ width: "1rem", height: "1rem", cursor: "pointer" }}
                />
                <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#475569", cursor: "pointer" }}>
                  Este producto tiene número de serie
                </label>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <Button
                  type="submit"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "rgb(59, 130, 246)", color: "white", padding: "0.75rem 1.5rem", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600", opacity: createProductMutation.isPending || updateProductMutation.isPending ? 0.6 : 1 }}
                >
                  <Save style={{ width: "1rem", height: "1rem" }} />
                  {createProductMutation.isPending || updateProductMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "transparent", color: "#64748b", border: "1px solid #e2e8f0", padding: "0.75rem 1.5rem", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Products Table */}
        <Card style={{ border: "1px solid #e2e8f0", overflow: "hidden" }}>
          {isLoading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
              Cargando productos...
            </div>
          ) : products?.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
              No hay productos. Crea el primero.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ textAlign: "left", padding: "1rem", fontWeight: "600", color: "#475569", fontSize: "0.875rem" }}>Código</th>
                  <th style={{ textAlign: "left", padding: "1rem", fontWeight: "600", color: "#475569", fontSize: "0.875rem" }}>Nombre</th>
                  <th style={{ textAlign: "left", padding: "1rem", fontWeight: "600", color: "#475569", fontSize: "0.875rem" }}>Descripción</th>
                  <th style={{ textAlign: "right", padding: "1rem", fontWeight: "600", color: "#475569", fontSize: "0.875rem" }}>Precio</th>
                  <th style={{ textAlign: "center", padding: "1rem", fontWeight: "600", color: "#475569", fontSize: "0.875rem" }}>Serial</th>
                  <th style={{ textAlign: "center", padding: "1rem", fontWeight: "600", color: "#475569", fontSize: "0.875rem" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products?.map((product: any) => (
                  <tr key={product.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "1rem", color: "#1e293b", fontSize: "0.875rem" }}>{product.barcode || "-"}</td>
                    <td style={{ padding: "1rem", color: "#1e293b", fontWeight: "600" }}>{product.name}</td>
                    <td style={{ padding: "1rem", color: "#64748b", fontSize: "0.875rem" }}>{product.description || "-"}</td>
                    <td style={{ padding: "1rem", textAlign: "right", color: "#1e293b", fontWeight: "600" }}>${parseFloat(product.price).toFixed(2)}</td>
                    <td style={{ padding: "1rem", textAlign: "center", color: "#1e293b" }}>
                      {product.hasSerial ? "✓" : "-"}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        <button
                          onClick={() => handleEdit(product)}
                          style={{ padding: "0.5rem", background: "transparent", border: "1px solid #e2e8f0", borderRadius: "0.375rem", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}
                          title="Editar"
                        >
                          <Edit2 style={{ width: "1rem", height: "1rem" }} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          style={{ padding: "0.5rem", background: "transparent", border: "1px solid #e2e8f0", borderRadius: "0.375rem", cursor: "pointer", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}
                          title="Eliminar"
                        >
                          <Trash2 style={{ width: "1rem", height: "1rem" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
