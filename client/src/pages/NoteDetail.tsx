import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
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
    alert("Descarga de PDF - Próximamente");
  };

  const subtotal = parseFloat(note.subtotal as any || "0");
  const ivaAmount = parseFloat(note.ivaAmount as any || "0");
  const total = parseFloat(note.total as any || "0");

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", background: "linear-gradient(to bottom right, #f8fafc, #f1f5f9)" }}>
      <div style={{ maxWidth: "900px", marginLeft: "auto", marginRight: "auto" }}>
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
              onClick={() => setLocation(`/notes/${noteId}/edit`)}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "transparent", color: "#64748b", border: "1px solid #e2e8f0", padding: "0.75rem 1.5rem", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}
            >
              ✎ Editar
            </Button>
            <Button
              onClick={() => {
                if (confirm("¿Estás seguro de que deseas eliminar esta nota?")) {
                  trpc.notes.delete.useMutation().mutate(noteId, {
                    onSuccess: () => setLocation("/notes")
                  });
                }
              }}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "transparent", color: "#ef4444", border: "1px solid #fecaca", padding: "0.75rem 1.5rem", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}
            >
              🗑 Eliminar
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
        <div ref={printRef} style={{ background: "white", padding: "2.5rem", fontFamily: "Arial, sans-serif", fontSize: "11px", lineHeight: "1.4" }}>
          {/* Company Header */}
          {config && (
            <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid #333" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem", alignItems: "start" }}>
                <div>
                  {/* Logo placeholder */}
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "#003366", marginBottom: "0.5rem" }}>LOGO</div>
                </div>
                <div style={{ fontSize: "10px", lineHeight: "1.6" }}>
                  <div><strong>R.I.F:</strong> {config.rif}</div>
                  <div><strong>Dirección Fiscal:</strong> {config.address}</div>
                  <div><strong>Teléfonos:</strong> {config.phone1}{config.phone2 ? ` / ${config.phone2}` : ""}</div>
                  <div><strong>E-mail:</strong> {config.email}</div>
                  <div><strong>Website:</strong> {config.website}</div>
                </div>
              </div>
            </div>
          )}

          {/* Title and Note Number */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", marginBottom: "1.5rem", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <h1 style={{ fontSize: "16px", fontWeight: "bold", color: "#000", margin: "0" }}>NOTA DE ENTREGA</h1>
            </div>
            <div style={{ textAlign: "center", border: "2px solid #333", padding: "0.5rem" }}>
              <div style={{ fontSize: "12px", fontWeight: "bold" }}>Nº {note.noteNumber}</div>
            </div>
          </div>

          {/* Client Data Section */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              {/* Left Column */}
              <div>
                <div style={{ fontWeight: "bold", marginBottom: "0.5rem", fontSize: "11px" }}>Datos del Cliente</div>
                <div style={{ marginBottom: "0.3rem", fontSize: "10px" }}>
                  <strong>Nombre o Razón Social:</strong> {note.clientName}
                </div>
                <div style={{ marginBottom: "0.3rem", fontSize: "10px" }}>
                  <strong>R.I.F:</strong> {note.clientRif || ""}
                </div>
                <div style={{ fontSize: "10px" }}>
                  <strong>Dirección:</strong> {note.clientAddress || ""}
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div style={{ border: "1px solid #333", padding: "0.5rem", textAlign: "center" }}>
                    <div style={{ fontSize: "9px", color: "#666" }}>Cliente</div>
                    <div style={{ fontSize: "14px", fontWeight: "bold" }}>{note.noteNumber}</div>
                  </div>
                  <div style={{ border: "1px solid #333", padding: "0.5rem", textAlign: "center" }}>
                    <div style={{ fontSize: "9px", color: "#666" }}>Fecha</div>
                    <div style={{ fontSize: "12px", fontWeight: "bold" }}>
                      {format(new Date(note.noteDate as any), "dd-MM-yyyy")}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: "10px", marginBottom: "0.3rem" }}>
                  <strong>Atención:</strong> {note.clientContact || ""}
                </div>
                <div style={{ fontSize: "10px" }}>
                  <strong>Teléfonos de Contacto:</strong> {note.clientPhone || ""}
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div style={{ marginBottom: "1.5rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #333", marginBottom: "0.5rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#003366", color: "white" }}>
                  <th style={{ border: "1px solid #333", padding: "0.4rem", textAlign: "center", fontSize: "10px", fontWeight: "bold", width: "5%" }}>#</th>
                  <th style={{ border: "1px solid #333", padding: "0.4rem", textAlign: "left", fontSize: "10px", fontWeight: "bold", width: "15%" }}>Código</th>
                  <th style={{ border: "1px solid #333", padding: "0.4rem", textAlign: "left", fontSize: "10px", fontWeight: "bold", width: "40%" }}>Descripción</th>
                  <th style={{ border: "1px solid #333", padding: "0.4rem", textAlign: "center", fontSize: "10px", fontWeight: "bold", width: "10%" }}>Cant.</th>
                  <th style={{ border: "1px solid #333", padding: "0.4rem", textAlign: "right", fontSize: "10px", fontWeight: "bold", width: "15%" }}>Precio Unit.</th>
                  <th style={{ border: "1px solid #333", padding: "0.4rem", textAlign: "right", fontSize: "10px", fontWeight: "bold", width: "15%" }}>Total.</th>
                </tr>
              </thead>
              <tbody>
                {lines?.map((line: any, index: number) => (
                  <tr key={line.id} style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }}>
                    <td style={{ border: "1px solid #ccc", padding: "0.4rem", textAlign: "center", fontSize: "10px" }}>{index + 1}</td>
                    <td style={{ border: "1px solid #ccc", padding: "0.4rem", fontSize: "10px" }}>{line.product?.barcode}</td>
                    <td style={{ border: "1px solid #ccc", padding: "0.4rem", fontSize: "10px" }}>
                      {line.product?.name}
                      {line.serials?.length > 0 && (
                        <div style={{ fontSize: "9px", color: "#666", marginTop: "0.2rem" }}>
                          Seriales: {line.serials.map((s: any) => s.serial).join(" ")}
                        </div>
                      )}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "0.4rem", textAlign: "center", fontSize: "10px" }}>{line.quantity}</td>
                    <td style={{ border: "1px solid #ccc", padding: "0.4rem", textAlign: "right", fontSize: "10px" }}>${parseFloat(line.unitPrice).toFixed(2)}</td>
                    <td style={{ border: "1px solid #ccc", padding: "0.4rem", textAlign: "right", fontSize: "10px", fontWeight: "bold" }}>${parseFloat(line.lineTotal).toFixed(2)}</td>
                  </tr>
                ))}
                {/* Empty rows for handwriting */}
                {[...Array(Math.max(0, 8 - (lines?.length || 0)))].map((_, i) => (
                  <tr key={`empty-${i}`} style={{ backgroundColor: i % 2 === 0 ? "#f9f9f9" : "white" }}>
                    <td style={{ border: "1px solid #ccc", padding: "0.4rem", height: "1.5rem" }}></td>
                    <td style={{ border: "1px solid #ccc", padding: "0.4rem" }}></td>
                    <td style={{ border: "1px solid #ccc", padding: "0.4rem" }}></td>
                    <td style={{ border: "1px solid #ccc", padding: "0.4rem" }}></td>
                    <td style={{ border: "1px solid #ccc", padding: "0.4rem" }}></td>
                    <td style={{ border: "1px solid #ccc", padding: "0.4rem" }}></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Observations Section */}
          <div style={{ marginBottom: "1.5rem", border: "1px solid #333", padding: "0.5rem", minHeight: "2rem" }}>
            <div style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "0.3rem" }}>Observaciones:</div>
            <div style={{ fontSize: "10px", minHeight: "1.2rem" }}></div>
          </div>

          {/* Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "2rem" }}>
            <div style={{ width: "250px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "10px", textAlign: "right" }}>SUB-TOTAL</span>
                <span style={{ fontSize: "10px", fontWeight: "bold", minWidth: "80px", textAlign: "right" }}>${subtotal.toFixed(2)}</span>
              </div>
              {note.applyIVA && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "10px", textAlign: "right" }}>IVA</span>
                  <span style={{ fontSize: "10px", fontWeight: "bold", minWidth: "80px", textAlign: "right" }}>${ivaAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", borderTop: "2px solid #333", paddingTop: "0.5rem" }}>
                <span style={{ fontSize: "11px", fontWeight: "bold", textAlign: "right" }}>TOTAL NETO</span>
                <span style={{ fontSize: "12px", fontWeight: "bold", minWidth: "80px", textAlign: "right" }}>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid #ccc" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ minHeight: "3rem", borderBottom: "1px solid #333", marginBottom: "0.3rem" }}></div>
              <div style={{ fontSize: "10px", fontWeight: "bold" }}>Entregado por</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ minHeight: "3rem", borderBottom: "1px solid #333", marginBottom: "0.3rem" }}></div>
              <div style={{ fontSize: "10px", fontWeight: "bold" }}>Recibido conforme</div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          div[style*="minHeight: 100vh"] {
            display: none;
          }
          div[style*="maxWidth: 80rem"] {
            max-width: 100%;
          }
          div[style*="maxWidth: 900px"] {
            max-width: 100%;
            padding: 0;
            margin: 0;
          }
          div[style*="marginBottom: 2rem"] {
            display: none;
          }
          div[style*="background: linear-gradient"] {
            background: white !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
