import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { data: config, isLoading } = trpc.config.get.useQuery();
  const updateConfigMutation = trpc.config.update.useMutation();

  const [formData, setFormData] = useState({
    rif: "",
    businessName: "",
    address: "",
    phone1: "",
    phone2: "",
    email: "",
    website: "",
    ivaRate: "16",
  });

  useEffect(() => {
    if (config) {
      setFormData({
        rif: config.rif || "",
        businessName: config.businessName || "",
        address: config.address || "",
        phone1: config.phone1 || "",
        phone2: config.phone2 || "",
        email: config.email || "",
        website: config.website || "",
        ivaRate: config.ivaRate || "16",
      });
    }
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateConfigMutation.mutateAsync(formData);
      toast.success("Configuración actualizada correctamente");
    } catch (error) {
      toast.error("Error al actualizar la configuración");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1e293b" }}>Cargando configuración...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", background: "linear-gradient(to bottom right, #f8fafc, #f1f5f9)" }}>
      <div style={{ maxWidth: "48rem", marginLeft: "auto", marginRight: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => setLocation("/")}
            style={{ padding: "0.5rem", background: "transparent", border: "1px solid #e2e8f0", borderRadius: "0.375rem", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ArrowLeft style={{ width: "1.25rem", height: "1.25rem" }} />
          </button>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e293b" }}>
              Configuración Empresarial
            </h1>
            <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
              Actualiza los datos de tu empresa
            </p>
          </div>
        </div>

        {/* Form */}
        <Card style={{ padding: "2rem", border: "1px solid #e2e8f0" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "0.5rem" }}>
                RIF
              </label>
              <Input
                type="text"
                name="rif"
                value={formData.rif}
                onChange={handleChange}
                placeholder="Ej: J-12345678-9"
                style={{ width: "100%", padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.375rem", fontSize: "1rem" }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "0.5rem" }}>
                Nombre de la Empresa
              </label>
              <Input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Ej: Mi Empresa S.A."
                style={{ width: "100%", padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.375rem", fontSize: "1rem" }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "0.5rem" }}>
                Dirección
              </label>
              <Input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Ej: Calle Principal 123, Caracas"
                style={{ width: "100%", padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.375rem", fontSize: "1rem" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "0.5rem" }}>
                  Teléfono 1
                </label>
                <Input
                  type="tel"
                  name="phone1"
                  value={formData.phone1}
                  onChange={handleChange}
                  placeholder="Ej: +58 212 1234567"
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.375rem", fontSize: "1rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "0.5rem" }}>
                  Teléfono 2 (Opcional)
                </label>
                <Input
                  type="tel"
                  name="phone2"
                  value={formData.phone2}
                  onChange={handleChange}
                  placeholder="Ej: +58 212 7654321"
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.375rem", fontSize: "1rem" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "0.5rem" }}>
                Email
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ej: contacto@miempresa.com"
                style={{ width: "100%", padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.375rem", fontSize: "1rem" }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "0.5rem" }}>
                Sitio Web
              </label>
              <Input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="Ej: www.miempresa.com"
                style={{ width: "100%", padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.375rem", fontSize: "1rem" }}
              />
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "0.5rem" }}>
                Tasa IVA (%)
              </label>
              <Input
                type="text"
                name="ivaRate"
                value={formData.ivaRate}
                onChange={handleChange}
                placeholder="Ej: 16"
                style={{ width: "100%", padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.375rem", fontSize: "1rem" }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "1rem" }}>
              <Button
                type="submit"
                disabled={updateConfigMutation.isPending}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "rgb(59, 130, 246)", color: "white", padding: "0.75rem 1.5rem", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600", opacity: updateConfigMutation.isPending ? 0.6 : 1 }}
              >
                <Save style={{ width: "1rem", height: "1rem" }} />
                {updateConfigMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Button
                type="button"
                onClick={() => setLocation("/")}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "transparent", color: "#64748b", border: "1px solid #e2e8f0", padding: "0.75rem 1.5rem", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
