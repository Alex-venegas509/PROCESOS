"use client";

import { useEffect, useState } from "react";
import styles from "./registroEstudiantes.module.css";
import RegistroEstudiantes from "../components/RegistroEstudiantes";

export default function RegistroEstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Cargar estudiantes guardados 
  const fetchEstudiantes = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/estudiantes/");
      const data = await res.json();
      setEstudiantes(data);
    } catch (error) {
      console.error("Error al obtener estudiantes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  // Filtrar estudiantes por cédula y ficha
  const filteredEstudiantes = estudiantes.filter((est) =>
    est.identificacion.toString().includes(search) ||
    est.ficha.toString().includes(search)
  );

  // Eliminar estudiante
  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar este estudiante?")) return;
    try {
      await fetch(`http://localhost:8000/api/estudiantes/${id}`, {
        method: "DELETE",
      });
      fetchEstudiantes(); // recargar lista
    } catch (error) {
      console.error("Error al eliminar estudiante:", error);
    }
  };

  // Editar estudiante (puedes hacer que abra un modal con el form)
  const handleEdit = (est) => {
    alert(`Editar estudiante: ${est.nombre} (ID: ${est.id})`);
    // Aquí puedes abrir un modal y reutilizar tu componente RegistroEstudiantes
  };

  return (
    <div className={styles.container}>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Buscar por cédula o ficha"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <hr />

      {/* Listado de estudiantes */}
      <h2 className={styles.title}>Listado de Estudiantes</h2>

      {loading ? (
        <p>Cargando...</p>
      ) : filteredEstudiantes.length === 0 ? (
        <p>No hay estudiantes registrados.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Id</th>
              <th>Foto</th>
              <th>Nombre</th>
              <th>Tipo Identificación</th>
              <th>Identificación</th>
              <th>Correo</th>
              <th>Correo Institucional</th>
              <th>Dirección</th>
              <th>Celular</th>
              <th>Teléfono</th>
              <th>Ficha</th>
              <th>Tipo Documentos</th>
              <th>Documentos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEstudiantes.map((est) => (
              <tr key={est.id}>
                <td>{est.id}</td>
                <td>
                  {est.ruta_foto ? (
                    <img
                      src={`http://localhost:8000/uploads/${est.ruta_foto}`}
                      alt="Foto estudiante"
                      width="60"
                    />
                  ) : (
                    "Sin foto"
                  )}
                </td>
                {/* DATOS */}
                <td>{est.nombre}</td>
                <td>{est.tipo_identificacion}</td>
                <td>{est.identificacion}</td>
                <td>{est.correo}</td>
                <td>{est.correo_institucional}</td>
                <td>{est.direccion}</td>
                <td>{est.celular}</td>
                <td>{est.telefono}</td>
                <td>{est.ficha}</td>
                <td>{est.tipo_documento}</td>

                {/* DOCUMENTOS */}
                <td>
                  {est.ruta_documentos ? (
                    est.ruta_documentos.split(";").map((doc, idx) => (
                      <div key={idx}>
                        <a
                          href={`http://localhost:8000/uploads/${doc}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Documento {idx + 1}
                        </a>
                      </div>
                    ))
                  ) : (
                    "Sin documento"
                  )}
                </td>

                {/* ACCIONES */}
                <td className={styles.actions}>
                  <button onClick={() => handleEdit(est)} className={styles.editBtn}>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(est.id)}
                    className={styles.deleteBtn}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
