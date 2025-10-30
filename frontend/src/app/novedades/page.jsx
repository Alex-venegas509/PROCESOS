"use client";
import Image from "next/image";
import { useState } from "react";
import styles from "./novedades.module.css";

export default function NovedadesPage() {
  const [cedula, setCedula] = useState("");
  const [ficha, setFicha] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [file, setFile] = useState(null);
  const [documentos, setDocumentos] = useState([]);

  const handleBuscar = async () => {
    if (!cedula) return alert("Ingrese una cédula para buscar");
    const res = await fetch(`http://localhost:8000/novedades/${cedula}`);
    const data = await res.json();
    setDocumentos(data);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !tipoDocumento) {
      alert("Debe seleccionar un archivo y un tipo de documento");
      return;
    }

    const formData = new FormData();
    formData.append("cedula", cedula);
    formData.append("ficha", ficha);
    formData.append("tipo_documento", tipoDocumento);
    formData.append("file", file);

    const res = await fetch("http://localhost:8000/novedades/", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("Documento subido correctamente");
      setFile(null);
      setTipoDocumento("");
      handleBuscar();
    } else {
      alert("Error al subir el documento");
    }
  };

  return (
    <div className={styles.container}>
      {/* Barra verde institucional */}
      <header className={styles.topBar}>
        <div className={styles.logoContainer}>
          <Image
            src="/public/sena.png"
            alt="Logo SENA"
            width={65}
            height={65}
            className={styles.logo}
          />
          <div className={styles.headerText}>
            <h3>Centro de Materiales y Ensayos</h3>
            <p>Regional Distrito Capital</p>
          </div>
        </div>
      </header>

      {/* Títulos */}
      <h2 className={styles.title}>EXPEDIENTES DE APRENDICES</h2>
      <h3 className={styles.subtitle}>Novedades</h3>

      {/* Sección de búsqueda */}
      <div className={styles.busqueda}>
        <div>
          <label>NO. de identificación</label>
          <input
            type="text"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
          />
        </div>
        <div>
          <label>NO. de Ficha</label>
          <input
            type="text"
            value={ficha}
            onChange={(e) => setFicha(e.target.value)}
          />
        </div>
        <button onClick={handleBuscar}>Buscar</button>
      </div>

      {/* Subir documento */}
      <form onSubmit={handleUpload} className={styles.form}>
        <h3>Subir Documento</h3>

        <label>Tipo de documento</label>
        <select
          value={tipoDocumento}
          onChange={(e) => setTipoDocumento(e.target.value)}
        >
          <option value="">Seleccione...</option>
          <option value="Juicios Evaluativos">Juicios Evaluativos</option>
          <option value="Acta de seguimiento">Acta de seguimiento</option>
          <option value="Formato de Novedades">Formato de Novedades</option>
          <option value="Citación a Comité">Citación a Comité</option>
          <option value="Acta de Reunión">Acta de Reunión</option>
        </select>

        <div className={styles.uploadBox}>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button type="submit">Subir</button>
        </div>
      </form>

      {/* Documentos cargados */}
      <div className={styles.docs}>
        <h4>Documentos cargados</h4>
        <ul>
          {documentos.map((doc) => (
            <li key={doc.id}>
              <a href={`http://localhost:8000/${doc.ruta_archivo}`} target="_blank">
                {doc.nombre_archivo}
              </a>{" "}
              - {doc.tipo_documento}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
