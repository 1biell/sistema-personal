import React from "react";
import "../../styles/student.css";



export default function StudentInfo({ student }) {
  if (!student) return <p>Carregando informações...</p>;

  return (
    <div>
      <p><strong>Email:</strong> {student.email}</p>
      <p><strong>Telefone:</strong> {student.phone || "-"}</p>
      <p><strong>Idade:</strong> {student.age || "-"}</p>
      <p><strong>Peso:</strong> {student.weight ? `${student.weight} kg` : "-"}</p>
      <p><strong>Altura:</strong> {student.height ? `${student.height} m` : "-"}</p>
      <p><strong>Objetivo:</strong> {student.goal || "-"}</p>
    </div>
  );
}
