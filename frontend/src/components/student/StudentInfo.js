import React from "react";
import "../../styles/student.css";

export default function StudentInfo({ student }) {
  if (!student) return <p>Carregando informações...</p>;

  return (
    <div>
      <div className="card mb-3">
        <div className="card-body">
          <h6 className="mb-2">Informações do Personal</h6>
          {student.personal ? (
            <>
              <div><strong>{student.personal.name}</strong></div>
              <div className="text-muted" style={{fontSize:12}}>{student.personal.email}</div>
            </>
          ) : (
            <div className="text-muted" style={{fontSize:12}}>Não disponível</div>
          )}
        </div>
      </div>

      <p><strong>Email:</strong> {student.email}</p>
      <p><strong>Telefone:</strong> {student.phone || "-"}</p>
      <p><strong>Idade:</strong> {student.age || "-"}</p>
      <p><strong>Peso:</strong> {student.weight ? `${student.weight} kg` : "-"}</p>
      <p><strong>Altura:</strong> {student.height ? `${student.height} m` : "-"}</p>
      <p><strong>Objetivo:</strong> {student.goal || "-"}</p>
    </div>
  );
}
