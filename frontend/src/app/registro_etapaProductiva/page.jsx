"use client";

import { useEffect, useState } from "react";
import styles from "./registroEtapaProductiva.module.css";
import ModalEditarProductiva from "../components/ModalEditarProductiva"

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

export default function RegistrosProductiva() {
    const [productiva, setProductiva] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [visible, setVisible] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [productivaSeleccionado, setProductivaSeleccionado] = useState(null);

    // Cargar estudiantes guardados
    const fetchEtapaProductiva = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/productiva/");
            const data = await res.json();
            setProductiva(data);
        } catch (error) {
            console.error("Error al obtener etapa productiva:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEtapaProductiva();
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
    const filteredProductiva = productiva.filter(
        (est) =>
            est.identificacion.toString().includes(search) ||
            est.ficha.toString().includes(search)
    );

    // Eliminar estudiante
    const handleDelete = async (id) => {
        if (!confirm("¿Seguro que quieres eliminar está etapa productiva?")) return;
        try {
            const res = await fetch(`http://localhost:8000/api/productiva/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setProductiva((prev) => prev.filter((est) => est.id !== id)); // actualizar sin recargar
                mostrarAlerta("Etapa productiva eliminado correctamente", "success");
            } else {
                mostrarAlerta("Ocurrió un error al eliminar la etapa productiva", "error");
            }
        } catch (error) {
            console.error("Error al eliminar etapa productiva:", error);
            mostrarAlerta("Ocurrió un error al eliminar la etapa productiva", "error");
        }
    };

    const handleEdit = (est) => {
        setProductivaSeleccionado(est); // guardamos el estudiante que quiero editar
        setModalOpen(true); // abrimos el modal
    };

    const handleUpdate = (productivaEditado) => {
        setProductiva((prev) =>
            prev.map((est) =>
                est.id === productivaEditado.id ? productivaEditado : est
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
            <h2 className={styles.title}>Listado de Etapa Productiva</h2>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Identificación</th>
                            <th>Ficha</th>
                            <th>Tiene Discapacidad</th>
                            <th>Cual Discapacidad</th>
                            <th>Tipo Documento</th>
                            <th>Documentos</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProductiva.length === 0 ? (
                            <tr>
                                <td colSpan={8} className={styles.records}>
                                    No hay estudiantes registrados.
                                </td>
                            </tr>
                        ) : (
                            filteredProductiva.map((est) => (
                                <tr key={est.id}>
                                    <td>{est.id}</td>
                                    <td>{est.identificacion}</td>
                                    <td>{est.ficha}</td>
                                    <td>{est.discapacidad}</td>
                                    <td>
                                        {String(est.cual_discapacidad)
                                            .split(/(?=[A-Z])/)
                                            .map((part, i) => (
                                                <div key={i}>{part.trim()}</div>
                                            ))}
                                    </td>
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
                <ModalEditarProductiva
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    productiva={productivaSeleccionado}
                    onUpdate={handleUpdate}   // 👈 se envía al modal
                />
            )}
        </div>
    );
}
