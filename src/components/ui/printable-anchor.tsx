interface PrintableAnchorProps {
  anclaje: string;
  valor:   string;
}

/**
 * Tarjeta de anclaje imprimible.
 * En pantalla: preview compacto con borde de color.
 * Al imprimir (@media print): ocupa toda la página A6/carta con fondo crema
 * y tipografía en #107671, ocultando el resto de la interfaz.
 */
export default function PrintableAnchor({ anclaje, valor }: PrintableAnchorProps) {
  const cleanAnclaje = anclaje.replace(/^[\u201C\u201D"']+|[\u201C\u201D"']+$/g, "").trim();
  // Remover comillas del texto si ya las trae la BD, para evitar doble comillado

  return (
    <>
      {/* Estilos de impresión embebidos */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .print-card-wrapper { display: flex !important; }
          .print-card-wrapper * { display: block; }
        }
        .print-card-wrapper { display: contents; }
      `}</style>

      {/* Preview en pantalla */}
      <div className="rounded-2xl border-2 border-[#107671]/30 bg-[#107671]/5 px-6 py-6 text-center">
        <p className="text-xs text-[#107671]/50 uppercase tracking-widest mb-4">
          Tu anclaje diario
        </p>
        <blockquote className="text-[#107671] text-lg font-semibold leading-snug mb-4">
          &ldquo;{cleanAnclaje}&rdquo;
        </blockquote>
        <p className="text-xs text-[#107671]/60">
          Valor conectado: <span className="font-medium">{valor}</span>
        </p>
        <p className="text-[10px] text-[#107671]/30 mt-4">Hablate Bien · Carina Barilá</p>
      </div>

      {/* Versión para impresión (oculta en pantalla, visible al imprimir) */}
      <div
        className="print-card-wrapper"
        style={{ display: "none" }}
      >
        <div style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FDFBF7",
          padding: "2rem",
        }}>
          <div style={{
            maxWidth: "360px",
            width: "100%",
            border: "2px solid #107671",
            borderRadius: "16px",
            padding: "2.5rem 2rem",
            textAlign: "center",
            backgroundColor: "#FDFBF7",
          }}>
            <p style={{ fontSize: "10px", color: "#107671", opacity: 0.5, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              Tu anclaje diario
            </p>
            <p style={{ fontSize: "22px", fontWeight: 700, color: "#107671", lineHeight: 1.35, marginBottom: "1.5rem" }}>
              &ldquo;{cleanAnclaje}&rdquo;
            </p>
            <p style={{ fontSize: "12px", color: "#107671", opacity: 0.6 }}>
              Valor conectado: <strong>{valor}</strong>
            </p>
            <p style={{ fontSize: "10px", color: "#107671", opacity: 0.3, marginTop: "2rem" }}>
              Hablate Bien · Carina Barilá
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
