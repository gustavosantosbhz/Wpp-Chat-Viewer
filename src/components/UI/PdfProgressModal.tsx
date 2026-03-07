// Modal de progresso para exportação PDF

interface PdfProgressModalProps {
  isOpen: boolean;
  currentPage: number;
  totalPages: number;
}

export function PdfProgressModal({ isOpen, currentPage, totalPages }: PdfProgressModalProps) {
  if (!isOpen) return null;

  const percent = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-icon">📄</div>
        <h2 className="modal-title">Gerando PDF</h2>
        <p className="modal-text">
          Processando página {currentPage} de {totalPages}...
        </p>
        <div className="modal-progress-bar-container">
          <div className="modal-progress-bar" style={{ width: `${percent}%` }} />
        </div>
        <p className="modal-percent">{percent}%</p>
      </div>
    </div>
  );
}
