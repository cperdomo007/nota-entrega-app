import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Printer, Download, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRef } from "react";

export default function NoteDetail() {
  const [match, params] = useRoute("/notes/:id");
  const [, setLocation] = useLocation();
  const printRef = useRef<HTMLDivElement>(null);
  const noteId = parseInt(params?.id as string);

  const { data: note, isLoading } = trpc.notes.getById.useQuery(
    noteId,
    { enabled: !!noteId }
  );

  const { data: lines } = trpc.noteLines.getByNoteId.useQuery(
    noteId,
    { enabled: !!noteId }
  );

  const { data: config } = trpc.config.get.useQuery();

  if (!match) return null;

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1e293b" }}>Cargando nota...</div>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1e293b", marginBottom: "1rem" }}>Nota no encontrada</div>
          <Button
            onClick={() => setLocation("/")}
            style={{ background: "rgb(59, 130, 246)", color: "white", padding: "0.75rem 1.5rem", border: "none", borderRadius: "0.375rem", cursor: "pointer" }}
          >
            ← Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In a real implementation, this would use a PDF library
    alert("Descarga de PDF - Próximamente");
  };

  const subtotal = parseFloat(note.subtotal as any || "0");
  const ivaAmount = parseFloat(note.ivaAmount as any || "0");
  const total = parseFloat(note.total as any || "0");

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", background: "linear-gradient(to bottom right, #f8fafc, #f1f5f9)" }}>
      <div style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e293b" }}>
              Nota de Entrega #{note.noteNumber}
            </h1>
            <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
              {format(new Date(note.noteDate as any), "d 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Button
              onClick={handlePrint}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgb(59, 130, 246)", color: "white", padding: "0.75rem 1.5rem", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}
            >
              <Printer style={{ width: "1rem", height: "1rem" }} />
              Imprimir
            </Button>
            <Button
              onClick={handleDownloadPDF}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "transparent", color: "#64748b", border: "1px solid #e2e8f0", padding: "0.75rem 1.5rem", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}
            >
              <Download style={{ width: "1rem", height: "1rem" }} />
              PDF
            </Button>
            <Button
              onClick={() => setLocation("/")}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "transparent", color: "#64748b", border: "1px solid #e2e8f0", padding: "0.75rem 1.5rem", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}
            >
              <ArrowLeft style={{ width: "1rem", height: "1rem" }} />
              Volver
            </Button>
          </div>
        </div>

        {/* Print Content */}
        <div ref={printRef} style={{ background: "white", padding: "2rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
          {/* Company Header */}
          {config && (
            <div style={{ marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "2px solid #e2e8f0" }}>
              <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#1e293b", marginBottom: "0.5rem" }}>
                NOTA DE ENTREGA
              </h1>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.25rem" }}>RIF:</div>
                  <div style={{ fontWeight: "600", color: "#1e293b" }}>{config.rif}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.25rem" }}>Teléfono:</div>
                  <div style={{ fontWeight: "600", color: "#1e293b" }}>{config.phone1}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.25rem" }}>Dirección:</div>
                  <div style={{ fontWeight: "600", color: "#1e293b" }}>{config.address}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.25rem" }}>Email:</div>
                  <div style={{ fontWeight: "600", color: "#1e293b" }}>{config.email}</div>
                </div>
              </div>
            </div>
          )}

          {/* Note Info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
            <div>
              <h2 style={{ fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                Datos de la Nota
              </h2>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ color: "#64748b" }}>Número:</span>
                <span style={{ fontWeight: "600", color: "#1e293b" }}>{note.noteNumber}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Fecha:</span>
                <span style={{ fontWeight: "600", color: "#1e293b" }}>
                  {format(new Date(note.noteDate as any), "dd/MM/yyyy")}
                </span>
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                Datos del Cliente
              </h2>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ color: "#64748b" }}>Nombre:</span>
                <span style={{ fontWeight: "600", color: "#1e293b" }}>{note.clientName}</span>
              </div>
              {note.clientRif && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "#64748b" }}>RIF:</span>
                  <span style={{ fontWeight: "600", color: "#1e293b" }}>{note.clientRif}</span>
                </div>
              )}
              {note.clientAddress && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "#64748b" }}>Dirección:</span>
                  <span style={{ fontWeight: "600", color: "#1e293b" }}>{note.clientAddress}</span>
                </div>
              )}
              {note.clientPhone && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "#64748b" }}>Teléfono:</span>
                  <span style={{ fontWeight: "600", color: "#1e293b" }}>{note.clientPhone}</span>
                </div>
              )}
              {note.clientContact && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Contacto:</span>
                  <span style={{ fontWeight: "600", color: "#1e293b" }}>{note.clientContact}</span>
                </div>
              )}
            </div>
          </div>

          {/* Products Table */}
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "1rem", textTransform: "uppercase" }}>
              Productos
            </h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600", color: "#475569", fontSize: "0.875rem" }}>Código</th>
                  <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600", color: "#475569", fontSize: "0.875rem" }}>Descripción</th>
                  <th style={{ textAlign: "center", padding: "0.75rem", fontWeight: "600", color: "#475569", fontSize: "0.875rem" }}>Cantidad</th>
                  <th style={{ textAlign: "right", padding: "0.75rem", fontWeight: "600", color: "#475569", fontSize: "0.875rem" }}>P. Unitario</th>
                  <th style={{ textAlign: "right", padding: "0.75rem", fontWeight: "600", color: "#475569", fontSize: "0.875rem" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {lines?.map((line: any) => (
                  <tr key={line.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "0.75rem", color: "#1e293b" }}>{line.product?.barcode}</td>
                    <td style={{ padding: "0.75rem", color: "#1e293b" }}>{line.product?.name}</td>
                    <td style={{ padding: "0.75rem", textAlign: "center", color: "#1e293b" }}>{line.quantity}</td>
                    <td style={{ padding: "0.75rem", textAlign: "right", color: "#1e293b" }}>${parseFloat(line.unitPrice).toFixed(2)}</td>
                    <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: "600", color: "#1e293b" }}>${parseFloat(line.lineTotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Serials */}
            {lines?.some((line: any) => line.serials?.length > 0) && (
              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "0.75rem" }}>Seriales:</h3>
                {lines?.map((line: any) => (
                  line.serials?.length > 0 && (
                    <div key={line.id} style={{ marginBottom: "0.5rem", fontSize: "0.875rem", color: "#64748b" }}>
                      <strong>{line.product?.name}:</strong> {line.serials.map((s: any) => s.serial).join(", ")}
                    </div>
                  )
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "2rem" }}>
            <div style={{ width: "300px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: "1px solid #e2e8f0" }}>
                <span style={{ color: "#64748b" }}>Subtotal:</span>
                <span style={{ fontWeight: "600", color: "#1e293b" }}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "2px solid #e2e8f0" }}>
                <span style={{ color: "#64748b" }}>IVA (16%):</span>
                <span style={{ fontWeight: "600", color: "#1e293b" }}>${ivaAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1e293b" }}>Total Neto:</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "rgb(59, 130, 246)" }}>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid #e2e8f0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ height: "60px", marginBottom: "0.5rem", borderBottom: "1px solid #1e293b" }}></div>
                <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#1e293b" }}>Entregado por</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ height: "60px", marginBottom: "0.5rem", borderBottom: "1px solid #1e293b" }}></div>
                <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#1e293b" }}>Recibido conforme</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          div[style*="background: linear-gradient"] {
            background: white !important;
          }
          button {
            display: none !important;
          }
          div:has(> button) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
