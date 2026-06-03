import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Edit2, ArrowLeft } from "lucide-react";

export default function Clients() {
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    rif: "",
    address: "",
    phone: "",
    email: "",
    contact: "",
  });

  const { data: clients, refetch } = trpc.clients.list.useQuery();
  const createMutation = trpc.clients.create.useMutation();
  const updateMutation = trpc.clients.update.useMutation();
  const deleteMutation = trpc.clients.delete.useMutation();

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Por favor ingresa el nombre del cliente");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          rif: formData.rif || undefined,
          address: formData.address || undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          contact: formData.contact || undefined,
        });
      }
      setFormData({ name: "", rif: "", address: "", phone: "", email: "", contact: "" });
      setEditingId(null);
      setShowForm(false);
      refetch();
    } catch (error) {
      alert("Error al guardar el cliente");
      console.error(error);
    }
  };

  const handleEdit = (client: any) => {
    setFormData({
      name: client.name,
      rif: client.rif || "",
      address: client.address || "",
      phone: client.phone || "",
      email: client.email || "",
      contact: client.contact || "",
    });
    setEditingId(client.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      try {
        await deleteMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        alert("Error al eliminar el cliente");
        console.error(error);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", rif: "", address: "", phone: "", email: "", contact: "" });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", background: "linear-gradient(to bottom right, #f8fafc, #f1f5f9)" }}>
      <div style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto" }}>
        <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e293b" }}>Gestión de Clientes</h1>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Button
              onClick={() => setLocation("/")}
              style={{ background: "transparent", color: "#64748b", border: "1px solid #e2e8f0", padding: "0.5rem 1rem", borderRadius: "0.375rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <ArrowLeft style={{ width: "1rem", height: "1rem" }} />
              Volver
            </Button>
            {!showForm && (
              <Button
                onClick={() => setShowForm(true)}
                style={{ background: "rgb(59, 130, 246)", color: "white", padding: "0.5rem 1rem", borderRadius: "0.375rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", border: "none", fontWeight: "600" }}
              >
                <Plus style={{ width: "1rem", height: "1rem" }} />
                Nuevo Cliente
              </Button>
            )}
          </div>
        </div>

        {showForm && (
          <Card style={{ padding: "1.5rem", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1e293b", marginBottom: "1rem" }}>
              {editingId ? "Editar Cliente" : "Nuevo Cliente"}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#475569", marginBottom: "0.25rem" }}>Nombre *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#475569", marginBottom: "0.25rem" }}>RIF</label>
                <Input
                  value={formData.rif}
                  onChange={(e) => setFormData({ ...formData, rif: e.target.value })}
                  placeholder="J-XXXXXXXXX"
                />
              </div>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#475569", marginBottom: "0.25rem" }}>Dirección</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Dirección"
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#475569", marginBottom: "0.25rem" }}>Teléfono</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Teléfono"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#475569", marginBottom: "0.25rem" }}>Email</label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email"
                />
              </div>
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#475569", marginBottom: "0.25rem" }}>Contacto</label>
              <Input
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="Nombre del contacto"
              />
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <Button
                onClick={handleSubmit}
                style={{ background: "rgb(59, 130, 246)", color: "white", padding: "0.75rem 1.5rem", borderRadius: "0.375rem", cursor: "pointer", border: "none", fontWeight: "600" }}
              >
                {editingId ? "Actualizar" : "Guardar"}
              </Button>
              <Button
                onClick={handleCancel}
                style={{ background: "transparent", color: "#64748b", border: "1px solid #e2e8f0", padding: "0.75rem 1.5rem", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}
              >
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        <Card style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1e293b", marginBottom: "1rem" }}>
            Clientes ({clients?.length || 0})
          </h2>
          {!clients || clients.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
              No hay clientes registrados
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", background: "#f8fafc" }}>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#1e293b" }}>Nombre</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#1e293b" }}>RIF</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#1e293b" }}>Teléfono</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#1e293b" }}>Email</th>
                    <th style={{ padding: "1rem", textAlign: "center", fontWeight: "600", color: "#1e293b" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client: any) => (
                    <tr key={client.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "1rem", color: "#1e293b" }}>{client.name}</td>
                      <td style={{ padding: "1rem", color: "#64748b" }}>{client.rif || "-"}</td>
                      <td style={{ padding: "1rem", color: "#64748b" }}>{client.phone || "-"}</td>
                      <td style={{ padding: "1rem", color: "#64748b" }}>{client.email || "-"}</td>
                      <td style={{ padding: "1rem", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                          <Button
                            onClick={() => handleEdit(client)}
                            style={{ background: "transparent", color: "#3b82f6", border: "1px solid #bfdbfe", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}
                          >
                            <Edit2 style={{ width: "0.875rem", height: "0.875rem" }} />
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDelete(client.id)}
                            style={{ background: "transparent", color: "#ef4444", border: "1px solid #fecaca", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}
                          >
                            <Trash2 style={{ width: "0.875rem", height: "0.875rem" }} />
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
