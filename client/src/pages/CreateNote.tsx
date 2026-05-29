import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, X } from "lucide-react";
import { format } from "date-fns";

interface LineItem {
  id?: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product?: any;
  serials: string[];
}

export default function CreateNote() {
  const [, setLocation] = useLocation();
  const [noteNumber, setNoteNumber] = useState("");
  const [noteDate, setNoteDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [clientName, setClientName] = useState("");
  const [clientRif, setClientRif] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [lines, setLines] = useState<LineItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [editingSerials, setEditingSerials] = useState<number | null>(null);
  const [serialInput, setSerialInput] = useState("");

  const { data: nextNumber } = trpc.notes.getNextNumber.useQuery();
  const { data: config } = trpc.config.get.useQuery();
  const { data: products } = trpc.products.list.useQuery();
  const createNoteMutation = trpc.notes.create.useMutation();
  const createLinesMutation = trpc.noteLines.create.useMutation();
  const createSerialsMutation = trpc.serials.create.useMutation();
  const updateNoteMutation = trpc.notes.update.useMutation();

  useEffect(() => {
    if (nextNumber) {
      setNoteNumber(nextNumber);
    }
  }, [nextNumber]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      // Simulated search - in production this would call the API
      const filtered = products?.filter((p: any) => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.barcode && p.barcode.includes(query))
      ) || [];
      setSearchResults(filtered);
      setShowSearch(true);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  };



  const addProduct = (product: any) => {
    const newLine: LineItem = {
      productId: product.id,
      quantity: 1,
      unitPrice: parseFloat(product.price),
      lineTotal: parseFloat(product.price),
      product,
      serials: [],
    };
    setLines([...lines, newLine]);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  const updateLine = (index: number, updates: Partial<LineItem>) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], ...updates };
    if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
      newLines[index].lineTotal = newLines[index].quantity * newLines[index].unitPrice;
    }
    setLines(newLines);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const addSerial = (lineIndex: number, serial: string) => {
    if (serial.trim()) {
      const newLines = [...lines];
      newLines[lineIndex].serials.push(serial);
      setLines(newLines);
      setSerialInput("");
    }
  };

  const removeSerial = (lineIndex: number, serialIndex: number) => {
    const newLines = [...lines];
    newLines[lineIndex].serials.splice(serialIndex, 1);
    setLines(newLines);
  };

  const calculateTotals = () => {
    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const ivaRate = config?.ivaRate ? parseFloat(config.ivaRate) : 16;
    const ivaAmount = subtotal * (ivaRate / 100);
    const total = subtotal + ivaAmount;
    return { subtotal, ivaAmount, total, ivaRate };
  };

  const handleSave = async () => {
    if (!clientName.trim() || lines.length === 0) {
      alert("Por favor completa los datos del cliente y agrega al menos un producto");
      return;
    }

    try {
      const { subtotal, ivaAmount, total } = calculateTotals();

      // Create note
      const noteResult = await createNoteMutation.mutateAsync({
        noteNumber: noteNumber || "1",
        noteDate,
        clientName,
        clientRif: clientRif || undefined,
        clientAddress: clientAddress || undefined,
        clientPhone: clientPhone || undefined,
        clientContact: clientContact || undefined,
      });

      const noteId = (noteResult as any).insertId || 1;

      // Create lines and serials
      for (const line of lines) {
        const lineResult = await createLinesMutation.mutateAsync({
          noteId,
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          lineTotal: line.lineTotal,
        });

        const lineId = (lineResult as any).insertId || 1;

        // Create serials
        for (const serial of line.serials) {
          await createSerialsMutation.mutateAsync({
            lineId,
            serial,
          });
        }
      }

      // Update note with totals
      await updateNoteMutation.mutateAsync({
        id: noteId,
        subtotal: subtotal.toString(),
        ivaAmount: ivaAmount.toString(),
        total: total.toString(),
      });

      setLocation(`/notes/${noteId}`);
    } catch (error) {
      console.error("Error creating note:", error);
      alert("Error al crear la nota");
    }
  };

  const { subtotal, ivaAmount, total } = calculateTotals();

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", background: "linear-gradient(to bottom right, #f8fafc, #f1f5f9)" }}>
      <div style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto" }}>
        <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e293b" }}>Nueva Nota de Entrega</h1>
          <Button
            onClick={() => setLocation("/")}
            style={{ background: "transparent", color: "#64748b", border: "1px solid #e2e8f0", padding: "0.5rem 1rem", borderRadius: "0.375rem", cursor: "pointer" }}
          >
            ← Volver
          </Button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
          {/* Left Column - Form */}
          <div>
            <Card style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1e293b", marginBottom: "1rem" }}>Datos de la Nota</h2>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#475569", marginBottom: "0.25rem" }}>Número</label>
                <Input value={noteNumber} disabled style={{ background: "#f1f5f9" }} />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#475569", marginBottom: "0.25rem" }}>Fecha</label>
                <Input type="date" value={noteDate} onChange={(e) => setNoteDate(e.target.value)} />
              </div>
            </Card>

            <Card style={{ padding: "1.5rem" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1e293b", marginBottom: "1rem" }}>Datos del Cliente</h2>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#475569", marginBottom: "0.25rem" }}>Nombre/Razón Social *</label>
                <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nombre del cliente" />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#475569", marginBottom: "0.25rem" }}>RIF</label>
                <Input value={clientRif} onChange={(e) => setClientRif(e.target.value)} placeholder="J-XXXXXXXXX" />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#475569", marginBottom: "0.25rem" }}>Dirección</label>
                <Input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="Dirección" />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#475569", marginBottom: "0.25rem" }}>Teléfono</label>
                <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="Teléfono" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#475569", marginBottom: "0.25rem" }}>Contacto</label>
                <Input value={clientContact} onChange={(e) => setClientContact(e.target.value)} placeholder="Nombre del contacto" />
              </div>
            </Card>
          </div>

          {/* Right Column - Totals */}
          <div>
            <Card style={{ padding: "1.5rem", position: "sticky", top: "2rem" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1e293b", marginBottom: "1.5rem" }}>Resumen</h2>
              <div style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "#64748b" }}>Subtotal:</span>
                  <span style={{ fontWeight: "600", color: "#1e293b" }}>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>IVA (16%):</span>
                  <span style={{ fontWeight: "600", color: "#1e293b" }}>${ivaAmount.toFixed(2)}</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1e293b" }}>Total Neto:</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "rgb(59, 130, 246)" }}>${total.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Button
                  onClick={handleSave}
                  style={{ flex: 1, background: "rgb(59, 130, 246)", color: "white", padding: "0.75rem", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}
                >
                  Guardar Nota
                </Button>
                <Button
                  onClick={() => setLocation("/")}
                  style={{ flex: 1, background: "transparent", color: "#64748b", border: "1px solid #e2e8f0", padding: "0.75rem", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}
                >
                  Cancelar
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Products Section */}
        <Card style={{ padding: "1.5rem", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1e293b", marginBottom: "1rem" }}>Productos</h2>
          
          <div style={{ marginBottom: "1.5rem", position: "relative" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#475569", marginBottom: "0.25rem" }}>Buscar Producto (Código o Nombre)</label>
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Escanea o escribe el código de barras..."
              style={{ fontSize: "1rem" }}
            />
            {showSearch && searchResults.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", border: "1px solid #e2e8f0", borderRadius: "0.375rem", marginTop: "0.5rem", zIndex: 10, maxHeight: "300px", overflowY: "auto", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => addProduct(product)}
                    style={{ padding: "0.75rem 1rem", cursor: "pointer", borderBottom: "1px solid #e2e8f0", transition: "background 200ms" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ fontWeight: "600", color: "#1e293b" }}>{product.name}</div>
                    <div style={{ fontSize: "0.875rem", color: "#64748b" }}>{product.barcode} - ${parseFloat(product.price).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {lines.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
              Agrega productos para comenzar
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600", color: "#475569", fontSize: "0.875rem" }}>Producto</th>
                    <th style={{ textAlign: "center", padding: "0.75rem", fontWeight: "600", color: "#475569", fontSize: "0.875rem" }}>Cant.</th>
                    <th style={{ textAlign: "right", padding: "0.75rem", fontWeight: "600", color: "#475569", fontSize: "0.875rem" }}>P. Unit.</th>
                    <th style={{ textAlign: "right", padding: "0.75rem", fontWeight: "600", color: "#475569", fontSize: "0.875rem" }}>Subtotal</th>
                    <th style={{ textAlign: "center", padding: "0.75rem", fontWeight: "600", color: "#475569", fontSize: "0.875rem" }}>Seriales</th>
                    <th style={{ textAlign: "center", padding: "0.75rem" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "0.75rem" }}>
                        <div style={{ fontWeight: "500", color: "#1e293b" }}>{line.product?.name}</div>
                        <div style={{ fontSize: "0.875rem", color: "#64748b" }}>{line.product?.barcode}</div>
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                        <Input
                          type="number"
                          value={line.quantity}
                          onChange={(e) => updateLine(index, { quantity: parseInt(e.target.value) || 1 })}
                          style={{ width: "60px", textAlign: "center" }}
                        />
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "right" }}>
                        <Input
                          type="number"
                          value={line.unitPrice}
                          onChange={(e) => updateLine(index, { unitPrice: parseFloat(e.target.value) || 0 })}
                          step="0.01"
                          style={{ width: "100px", textAlign: "right" }}
                        />
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: "600", color: "#1e293b" }}>
                        ${line.lineTotal.toFixed(2)}
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                        {line.product?.hasSerial ? (
                          <Button
                            onClick={() => setEditingSerials(editingSerials === index ? null : index)}
                            style={{ background: line.serials.length > 0 ? "rgb(34, 197, 94)" : "transparent", color: line.serials.length > 0 ? "white" : "#64748b", border: "1px solid #e2e8f0", padding: "0.25rem 0.75rem", borderRadius: "0.25rem", fontSize: "0.875rem", cursor: "pointer" }}
                          >
                            {line.serials.length} serial{line.serials.length !== 1 ? "es" : ""}
                          </Button>
                        ) : (
                          <span style={{ fontSize: "0.875rem", color: "#94a3b8" }}>N/A</span>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                        <Button
                          onClick={() => removeLine(index)}
                          style={{ background: "transparent", color: "#ef4444", border: "none", padding: "0.25rem", cursor: "pointer" }}
                        >
                          <Trash2 style={{ width: "1rem", height: "1rem" }} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Serials Editor */}
              {editingSerials !== null && (
                <div style={{ marginTop: "1rem", padding: "1rem", background: "#f8fafc", borderRadius: "0.375rem", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <h3 style={{ fontWeight: "600", color: "#1e293b" }}>Seriales para {lines[editingSerials].product?.name}</h3>
                    <Button
                      onClick={() => setEditingSerials(null)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      <X style={{ width: "1.25rem", height: "1.25rem", color: "#64748b" }} />
                    </Button>
                  </div>

                  {lines[editingSerials].serials.length > 0 && (
                    <div style={{ marginBottom: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {lines[editingSerials].serials.map((serial, serialIndex) => (
                        <div
                          key={serialIndex}
                          style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "white", padding: "0.5rem 0.75rem", borderRadius: "0.25rem", border: "1px solid #e2e8f0" }}
                        >
                          <span style={{ fontSize: "0.875rem", color: "#1e293b" }}>{serial}</span>
                          <Button
                            onClick={() => removeSerial(editingSerials, serialIndex)}
                            style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", color: "#ef4444" }}
                          >
                            <X style={{ width: "1rem", height: "1rem" }} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Input
                      value={serialInput}
                      onChange={(e) => setSerialInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addSerial(editingSerials, serialInput);
                        }
                      }}
                      placeholder="Ingresa un serial y presiona Enter"
                      style={{ flex: 1 }}
                    />
                    <Button
                      onClick={() => addSerial(editingSerials, serialInput)}
                      style={{ background: "rgb(59, 130, 246)", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}
                    >
                      <Plus style={{ width: "1rem", height: "1rem" }} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
