import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Plus, FileText, Settings, Package, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: notes, isLoading: notesLoading } = trpc.notes.list.useQuery(
    { limit: 5, offset: 0 }
  );

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", background: "linear-gradient(to bottom right, #f8fafc, #f1f5f9)" }}>
      <div style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: "bold", color: "#1e293b", marginBottom: "0.5rem" }}>
            Sistema de Notas de Entrega
          </h1>
          <p style={{ color: "#64748b" }}>
            Gestiona y emite tus notas de entrega de forma ágil y profesional
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
          <Card style={{ padding: "1.5rem", cursor: "pointer", transition: "all 200ms" }}
            onClick={() => setLocation("/notes/new")}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)"}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontWeight: "600", color: "#1e293b", marginBottom: "0.25rem" }}>
                  Nueva Nota
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                  Crear una nota de entrega
                </p>
              </div>
              <Plus style={{ width: "1.25rem", height: "1.25rem", color: "rgb(59, 130, 246)" }} />
            </div>
          </Card>

          <Card style={{ padding: "1.5rem", cursor: "pointer", transition: "all 200ms" }}
            onClick={() => setLocation("/notes")}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)"}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontWeight: "600", color: "#1e293b", marginBottom: "0.25rem" }}>
                  Mis Notas
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                  Ver todas las notas emitidas
                </p>
              </div>
              <FileText style={{ width: "1.25rem", height: "1.25rem", color: "rgb(59, 130, 246)" }} />
            </div>
          </Card>

          <Card style={{ padding: "1.5rem", cursor: "pointer", transition: "all 200ms" }}
            onClick={() => setLocation("/products")}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)"}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontWeight: "600", color: "#1e293b", marginBottom: "0.25rem" }}>
                  Productos
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                  Gestionar catálogo
                </p>
              </div>
              <Package style={{ width: "1.25rem", height: "1.25rem", color: "rgb(59, 130, 246)" }} />
            </div>
          </Card>

          <Card style={{ padding: "1.5rem", cursor: "pointer", transition: "all 200ms" }}
            onClick={() => setLocation("/clients")}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)"}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontWeight: "600", color: "#1e293b", marginBottom: "0.25rem" }}>
                  Clientes
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                  Gestionar clientes
                </p>
              </div>
              <Users style={{ width: "1.25rem", height: "1.25rem", color: "rgb(59, 130, 246)" }} />
            </div>
          </Card>

          <Card style={{ padding: "1.5rem", cursor: "pointer", transition: "all 200ms" }}
            onClick={() => setLocation("/settings")}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)"}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontWeight: "600", color: "#1e293b", marginBottom: "0.25rem" }}>
                  Configuración
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                  Datos de tu empresa
                </p>
              </div>
              <Settings style={{ width: "1.25rem", height: "1.25rem", color: "rgb(59, 130, 246)" }} />
            </div>
          </Card>
        </div>

        {/* Recent Notes */}
        <div>
          <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#1e293b", marginBottom: "1.5rem" }}>
            Notas Recientes
          </h2>
          
          {notesLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[1, 2, 3].map((i) => (
                <Card key={i} style={{ padding: "1rem" }}>
                  <Skeleton style={{ height: "1.5rem", width: "33%", marginBottom: "0.5rem" }} />
                  <Skeleton style={{ height: "1rem", width: "66%" }} />
                </Card>
              ))}
            </div>
          ) : notes?.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {notes?.map((note) => (
                <Card
                  key={note.id}
                  style={{ padding: "1rem", cursor: "pointer", transition: "all 200ms" }}
                  onClick={() => setLocation(`/notes/${note.id}`)}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)"}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: "600", color: "#1e293b" }}>
                        Nota #{note.noteNumber}
                      </h3>
                      <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                        {note.clientName} • {format(new Date(note.noteDate as any), "d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontWeight: "600", color: "#1e293b" }}>
                        ${parseFloat(note.total as any).toFixed(2)}
                      </p>
                      <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                        {String(note.noteDate)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card style={{ padding: "2rem", textAlign: "center" }}>
              <FileText style={{ width: "3rem", height: "3rem", color: "rgba(100, 116, 139, 0.3)", marginLeft: "auto", marginRight: "auto", marginBottom: "1rem" }} />
              <p style={{ color: "#64748b", marginBottom: "1rem" }}>
                No hay notas emitidas aún
              </p>
              <Button
                onClick={() => setLocation("/notes/new")}
                style={{ background: "rgb(59, 130, 246)", color: "white", padding: "0.5rem 1rem", fontSize: "0.875rem", fontWeight: "600", border: "none", borderRadius: "0.375rem", cursor: "pointer" }}
              >
                Crear Primera Nota
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
