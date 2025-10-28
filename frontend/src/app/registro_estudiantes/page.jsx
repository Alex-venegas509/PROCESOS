"use client";

import { useEffect, useState } from "react";
import styles from "./registroEstudiantes.module.css";
import ModalEditar from "../components/ModalEditar";

// función para parsear documentos de forma segura
const parseDocumentos = (ruta_documentos) => {
  if (!ruta_documentos) return [];

  if (Array.isArray(ruta_documentos)) {
    return ruta_documentos; // ya es lista
  }

  if (typeof ruta_documentos === "string") {
    try {
      // si viene como JSON string
      const parsed = JSON.parse(ruta_documentos);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // si es un string plano separado por coma o ;
      return ruta_documentos
        .split(/[,;]+/)
        .map((d) => d.trim())
        .filter(Boolean);
    }
  }

  return []; // cualquier otro tipo
};

export default function RegistroEstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);

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

  const mostrarAlerta = (texto, tipo = "error") => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    setVisible(true);

    setTimeout(() => {
      setVisible(false); // Ocultar después de 2.5s
      setTimeout(() => {
        setMensaje("");
        setTipoMensaje("");
      }, 400); // Tiempo para animación de fade out
    }, 2500);
  };

  // Filtrar estudiantes por cédula y ficha
  const filteredEstudiantes = estudiantes.filter(
    (est) =>
      est.identificacion.toString().includes(search) ||
      est.ficha.toString().includes(search)
  );

  // Eliminar estudiante
  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar este estudiante?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/estudiantes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setEstudiantes((prev) => prev.filter((est) => est.id !== id)); // actualizar sin recargar
        mostrarAlerta("Estudiante eliminado correctamente", "success");
      } else {
        mostrarAlerta("Ocurrió un error al eliminar el estudiante", "error");
      }
    } catch (error) {
      console.error("Error al eliminar estudiante:", error);
      mostrarAlerta("Ocurrió un error al eliminar el estudiante", "error");
    }
  };

  const handleEdit = (est) => {
    setEstudianteSeleccionado(est); // guardamos el estudiante que quiero editar
    setModalOpen(true); // abrimos el modal
  };

  const handleUpdate = (estudianteEditado) => {
    setEstudiantes((prev) =>
      prev.map((est) =>
        est.id === estudianteEditado.id ? estudianteEditado : est
      )
    );
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
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Id</th>
              <th>Foto</th>
              <th>Nombres</th>
              <th>Apellidos</th>
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
            {filteredEstudiantes.length === 0 ? (
              <tr>
                <td colSpan={15} style={{ textAlign: "center", padding: "20px" }}>
                  No hay estudiantes registrados.
                </td>
              </tr>
            ) : (
              filteredEstudiantes.map((est) => (
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
                  <td>{est.apellidos}</td>
                  <td>{est.tipo_identificacion}</td>
                  <td>{est.identificacion}</td>
                  <td>{est.correo}</td>
                  <td>{est.correo_institucional}</td>
                  <td>{est.direccion}</td>
                  <td>{est.celular}</td>
                  <td>{est.telefono}</td>
                  <td>{est.ficha}</td>
                  <td>
                    {[...new Set(est.tipo_documento)]?.map((doc, i) => (
                      <div key={i}>{doc}</div>
                    ))}
                  </td>
                  <td>
                    {parseDocumentos(est.ruta_documentos).length > 0 ? (
                      parseDocumentos(est.ruta_documentos).map((doc, idx) => (
                        <div key={idx}>
                          <a
                            href={`http://localhost:8000/uploads/${doc}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver Documento"
                          >
                            Documento {idx + 1}
                          </a>
                        </div>
                      ))
                    ) : (
                      "Sin documento"
                    )}
                  </td>
                  <td className={styles.actions}>
                    <button
                      onClick={() => handleEdit(est)}
                      className={styles.editBtn}
                    >
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
              ))
            )}
          </tbody>
        </table>
      )}
      {mensaje && (
        <div
          className={`${styles.alerta} ${visible ? styles.visible : styles.oculta
            } ${tipoMensaje === "success" ? styles.success : styles.error
            }`}
        >
          {mensaje}
        </div>
      )}
      {modalOpen && (
        <ModalEditar
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          estudiante={estudianteSeleccionado}
          onUpdate={handleUpdate}   // 👈 se envía al modal
        />
      )}
    </div>
  );
}
