"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./ModalEditar.module.css";

export default function ModalEditar({ onClose, estudiante, onUpdate }) {
    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [visible, setVisible] = useState(false);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null); // input para documentos (oculto)
    const [selectedFile, setSelectedFile] = useState(null);
    const [documentos, setDocumentos] = useState([
        { id: 1, nombre: "Documento identidad", tipo: "check", activo: false },
        { id: 2, nombre: "Acta Compromiso Aprendiz", tipo: "check", activo: true },
        {
            id: 3,
            nombre: "Soporte Académico",
            tipo: "menu",
            abierto: false,
            opciones: [
                { id: "3-1", nombre: "Operario", activo: false },
                { id: "3-2", nombre: "Técnico", activo: false },
                { id: "3-3", nombre: "Tecnólogo", activo: false },
            ],
        },
        { id: 4, nombre: "Certificado de Salud", tipo: "check", activo: false },
        { id: 5, nombre: "Certificado ICFES (Tecnólogo)", tipo: "check", activo: false },
        {
            id: 6,
            nombre: "Menor de Edad",
            tipo: "menu",
            abierto: false,
            opciones: [
                { id: "6-1", nombre: "Tratamiento Datos", activo: false },
                { id: "6-2", nombre: "Copia documento oficial que acredite la condición del padre o tutor legal", activo: false },
            ],
        },
    ]);

    const [form, setForm] = useState({
        nombre: "",
        correo: "",
        correo_institucional: "",
        celular: "",
        apellidos: "",
        tipo_identificacion: "",
        identificacion: "",
        direccion: "",
        telefono: "",
        ficha: "",
    });

    useEffect(() => {
        if (estudiante) {
            setForm({
                id: estudiante.id,
                nombre: estudiante.nombre || "",
                correo: estudiante.correo || "",
                correo_institucional: estudiante.correo_institucional || "",
                celular: estudiante.celular || "",
                apellidos: estudiante.apellidos || "",
                tipo_identificacion: estudiante.tipo_identificacion || "",
                identificacion: estudiante.identificacion || "",
                direccion: estudiante.direccion || "",
                telefono: estudiante.telefono || "",
                ficha: estudiante.ficha || "",
                foto: estudiante.ruta_foto || null,
                documentos: Array.isArray(estudiante.ruta_documentos)
                    ? estudiante.ruta_documentos
                    : typeof estudiante.ruta_documentos === "string"
                        ? (() => {
                            try {
                                const parsed = JSON.parse(estudiante.ruta_documentos);
                                return Array.isArray(parsed) ? parsed : estudiante.ruta_documentos.split(/[;,]+/);
                            } catch {
                                return estudiante.ruta_documentos.split(/[;,]+/);
                            }
                        })()
                        : [],
                tipo_documento: estudiante.tipo_documento || []
            });

            // sincronizar checks/menus
            setDocumentos(prev =>
                prev.map(doc => {
                    if (doc.tipo === "check") {
                        return {
                            ...doc,
                            activo: estudiante.tipo_documento?.includes(doc.nombre) || false,
                        };
                    }
                    if (doc.tipo === "menu") {
                        return {
                            ...doc,
                            opciones: doc.opciones.map(op => ({
                                ...op,
                                activo: estudiante.tipo_documento?.includes(op.nombre) || false,
                            })),
                        };
                    }
                    return doc;
                })
            );
        }
    }, [estudiante]);

    useEffect(() => {
        // cleanup de preview (si cambia o se desmonta)
        return () => {
            if (preview) {
                try { URL.revokeObjectURL(preview); } catch (e) { /* ignore */ }
            }
            if (selectedFile && selectedFile.isLocal && selectedFile.url) {
                try { URL.revokeObjectURL(selectedFile.url); } catch (e) { /* ignore */ }
            }
        };
    }, [preview, selectedFile]);

    const mostrarAlerta = (texto, tipo = "error") => {
        setMensaje(texto);
        setTipoMensaje(tipo);
        setVisible(true);

        setTimeout(() => {
            setVisible(false);
            setTimeout(() => {
                setMensaje("");
                setTipoMensaje("");
            }, 400);
        }, 2500);
    };

    const handleDownload = async (url, filename) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Error descargando archivo:", error);
        }
    };

    // preview para la foto (id=fileInput) — mantiene preview de imagen de foto
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
        }
    };

    // documentos: los agregamos a form.documentos (no reemplazamos)
    const handleDocsChange = (e) => {
        const selectedFiles = Array.from(e.target.files);

        setForm((prev) => ({
            ...prev,
            documentos: [...(prev.documentos || []), ...selectedFiles],
        }));

        // limpiar input para permitir re-subir el mismo archivo si hace falta
        e.target.value = null;
    };

    const handleUploadClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handlePreview = (fileOrUrl) => {
        if (fileOrUrl instanceof File) {
            setSelectedFile({
                url: URL.createObjectURL(fileOrUrl),
                type: fileOrUrl.type,
                name: fileOrUrl.name,
                isLocal: true,
            });
        } else if (typeof fileOrUrl === "string") {
            const extension = fileOrUrl.split(".").pop().toLowerCase();
            const type = extension === "pdf"
                ? "application/pdf"
                : ["jpg", "jpeg", "png", "gif"].includes(extension)
                    ? "image/" + extension
                    : "text/plain";

            setSelectedFile({
                url: fileOrUrl.startsWith("http") ? fileOrUrl : `http://localhost:8000/uploads/${fileOrUrl}`,
                type,
                name: fileOrUrl.split("/").pop(),
                isLocal: false,
            });
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const closeModal = () => {
        if (selectedFile && selectedFile.isLocal && selectedFile.url) {
            try { URL.revokeObjectURL(selectedFile.url); } catch (e) { }
        }
        setSelectedFile(null);
    };

    const handleEliminarDocumento = async (index, doc) => {
        try {
            if (doc instanceof File) {
                const nuevosDocs = [...form.documentos];
                nuevosDocs.splice(index, 1);
                setForm({ ...form, documentos: nuevosDocs });
                return;
            }

            // delete en backend
            const response = await fetch(
                `http://localhost:8000/api/estudiantes/${form.id}/documentos?filename=${encodeURIComponent(doc)}`,
                { method: "DELETE" }
            );

            if (!response.ok) throw new Error("Error al eliminar en backend");

            const nuevosDocs = form.documentos.filter((_, i) => i !== index);
            setForm({ ...form, documentos: nuevosDocs });

        } catch (error) {
            console.error("Error eliminando documento:", error);
            mostrarAlerta("No se pudo eliminar el documento", "error");
        }
    };

    const toggleCheck = (id) => {
        setDocumentos((prev) =>
            prev.map((doc) => {
                if (doc.id === id) {
                    const actualizado = { ...doc, activo: !doc.activo };

                    setForm((prevForm) => {
                        const nuevosDocs = actualizado.activo
                            ? [...(prevForm.tipo_documento || []), actualizado.nombre]
                            : (prevForm.tipo_documento || []).filter((d) => d !== actualizado.nombre);

                        return { ...prevForm, tipo_documento: nuevosDocs };
                    });

                    return actualizado;
                }
                return doc;
            })
        );
    };

    const toggleMenu = (id) => {
        setDocumentos(prev => prev.map(doc => doc.id === id ? { ...doc, abierto: !doc.abierto } : doc));
    };

    const toggleSubOpcion = (docId, opcionId) => {
        setDocumentos((prev) =>
            prev.map((doc) => {
                if (doc.id === docId) {
                    const opcionesActualizadas = doc.opciones.map((op) =>
                        op.id === opcionId ? { ...op, activo: !op.activo } : op
                    );

                    const opcionSeleccionada = doc.opciones.find((op) => op.id === opcionId);
                    const opcionFinal = { ...opcionSeleccionada, activo: !opcionSeleccionada.activo };

                    setForm((prevForm) => {
                        const nuevosDocs = opcionFinal.activo
                            ? [...(prevForm.tipo_documento || []), opcionFinal.nombre]
                            : (prevForm.tipo_documento || []).filter((d) => d !== opcionFinal.nombre);

                        return { ...prevForm, tipo_documento: nuevosDocs };
                    });

                    return { ...doc, opciones: opcionesActualizadas };
                }
                return doc;
            })
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();

            Object.entries(form).forEach(([key, value]) => {
                if (key !== "documentos" && key !== "foto" && value !== null && value !== undefined) {
                    if (Array.isArray(value)) {
                        value.forEach((item) => formData.append(key, item));
                    } else {
                        formData.append(key, value);
                    }
                }
            });

            // FOTO (input con id="fileInput")
            const fileInput = document.getElementById("fileInput");
            if (fileInput && fileInput.files.length > 0) {
                formData.append("foto", fileInput.files[0]);
            }

            // DOCUMENTOS: enviar archivos nuevos y conservar rutas existentes
            if (Array.isArray(form.documentos)) {
                form.documentos.forEach((doc) => {
                    if (doc instanceof File) {
                        formData.append("documentos", doc);
                    } else if (typeof doc === "string") {
                        formData.append("documentos_existentes", doc);
                    }
                });
            }

            const response = await fetch(`http://localhost:8000/api/estudiantes/${form.id}`, {
                method: "PUT",
                body: formData,
            });

            if (!response.ok) throw new Error("Error al guardar cambios");

            const data = await response.json();

            mostrarAlerta("Estudiante actualizado correctamente", "success");

            const ALERT_DURATION = 2500;
            const FADE_OUT = 400;
            setTimeout(() => {
                if (onUpdate) onUpdate(data);
                onClose();
            }, ALERT_DURATION + FADE_OUT);

        } catch (err) {
            console.error("Error en actualización:", err);
            mostrarAlerta("Error al actualizar estudiante", "error");
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modalForm}>
                <button className={styles.closeButton} onClick={onClose} title="Cerrar">❌</button>
                <h1 className={styles.tituloInicio}><strong>Editar Estudiante</strong></h1>

                <form onSubmit={handleSubmit} className={styles.grid}>
                    <div className={styles.container}>

                        {/* FOTO */}
                        <div className={styles.fotoContainer}>
                            <div className={styles.fotoBox}>
                                {preview ? (
                                    <img src={preview} alt="Preview" className={styles.fotoPreview} />
                                ) : form.foto ? (
                                    <img
                                        src={`http://localhost:8000/uploads/${form.foto}`}
                                        alt="Foto estudiante"
                                        className={styles.fotoPreview}
                                    />
                                ) : (
                                    <span className={styles.fotoText}>FOTO</span>
                                )}
                            </div>

                            <div className={styles.inputContainer}>
                                <label htmlFor="fileInput" className={styles.customButton}>Cargar foto</label>
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className={styles.inputFile}
                                />
                            </div>
                        </div>

                        {/* Inputs principales */}
                        <div className={styles.inputsPrimary}>
                            <div className={styles.nameInputs}>
                                <label className={styles.subtitulo}>Nombres</label>
                                <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required />

                                <label className={styles.subtitulo}>Correo Personal</label>
                                <input type="email" name="correo" value={form.correo} onChange={handleChange} required />

                                <div className={styles.inlineLabels}>
                                    <label className={styles.subtitulo}>Correo Institucional</label>
                                    <label>* Opcional</label>
                                </div>
                                <input type="email" name="correo_institucional" value={form.correo_institucional || ""} onChange={handleChange} />

                                <label className={styles.subtitulo}>Número Celular</label>
                                <input type="text" name="celular" value={form.celular} onChange={handleChange} required />

                                {/* Lista de documentos */}
                                <label className={styles.textGreen}>Tipo de documento</label>
                                <ul className={styles.documentosList}>
                                    {documentos.map((doc) => (
                                        <li key={doc.id} className={styles.documentoItem}>
                                            <div className={styles.documentoHeader}>
                                                <span className={styles.nombre}>{doc.nombre}</span>
                                                {doc.tipo === "check" ? (
                                                    <span
                                                        className={`${styles.icono} ${styles.check} ${doc.activo ? styles.activo : ""}`}
                                                        onClick={() => toggleCheck(doc.id)}
                                                        title="Marcar"
                                                    />
                                                ) : (
                                                    <span
                                                        className={`${styles.icono} ${styles.menu} ${doc.abierto ? styles.activo : ""}`}
                                                        onClick={() => toggleMenu(doc.id)}
                                                        title="Desplegar"
                                                    />
                                                )}
                                            </div>

                                            {doc.tipo === "menu" && doc.abierto && (
                                                <ul className={styles.submenu}>
                                                    {doc.opciones.map((op) => (
                                                        <li key={op.id} className={styles.submenuItem}>
                                                            <span className={styles.nombre}>{op.nombre}</span>
                                                            <span
                                                                className={`${styles.icono} ${styles.check} ${op.activo ? styles.activo : ""}`}
                                                                onClick={() => toggleSubOpcion(doc.id, op.id)}
                                                            />
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Inputs secundarios */}
                        <div className={styles.inputSecundary}>
                            <div className={styles.nameInputs}>
                                <label className={styles.subtitulo}>Apellidos</label>
                                <input type="text" name="apellidos" value={form.apellidos} onChange={handleChange} required />

                                <select name="tipo_identificacion" value={form.tipo_identificacion} onChange={handleChange} required>
                                    <option value="">Seleccione tipo de documento</option>
                                    <option value="CC">Cédula de Ciudadanía</option>
                                    <option value="TI">Tarjeta de Identidad</option>
                                    <option value="CE">Cédula de Extranjería</option>
                                    <option value="PP">Pasaporte</option>
                                </select>

                                <label className={styles.subtitulo}>No. de identificación</label>
                                <input type="text" name="identificacion" value={form.identificacion} onChange={handleChange} required />

                                <label className={styles.subtitulo}>Dirección</label>
                                <input type="text" name="direccion" value={form.direccion} onChange={handleChange} required />

                                <label className={styles.subtitulo}>Número Telefónico</label>
                                <input type="text" name="telefono" value={form.telefono || ""} onChange={handleChange} />

                                <label className={styles.subtitulo}>Ficha Matrícula</label>
                                <input type="number" name="ficha" value={form.ficha} onChange={handleChange} required />

                                <div className={styles.contenedorButton}>
                                    <button type="submit" className={styles.button}>Guardar</button>
                                </div>
                            </div>
                        </div>

                        {/* Documentos */}
                        <div className={styles.docsPrimary}>
                            <input type="file" ref={fileInputRef} onChange={handleDocsChange} multiple style={{ display: "none" }} />

                            <div className={styles.contenedorBoton}>
                                <button type="button" onClick={handleUploadClick} className={styles.boton}>Subir Documento</button>
                            </div>

                            <div className={styles.documentosContainer}>
                                {Array.isArray(form.documentos) && form.documentos.length > 0 && (
                                    <ul className={styles.docsList}>
                                        {form.documentos.map((doc, index) => {
                                            const isFile = doc instanceof File;
                                            const fileName = isFile ? doc.name : doc;
                                            const fileExtension = fileName.split(".").pop().toLowerCase();
                                            const url = isFile
                                                ? URL.createObjectURL(doc)
                                                : `http://localhost:8000/uploads/${doc}`;

                                            return (
                                                <li key={index} className={styles.docItem}>
                                                    <div className={styles.previewBox}>
                                                        {['jpg','jpeg','png','gif'].includes(fileExtension) ? (
                                                            <img src={url} alt={fileName} className={styles.docPreview} />
                                                        ) : fileExtension === 'pdf' ? (
                                                            <embed src={url} type="application/pdf" className={styles.docPreviewPdf} />
                                                        ) : (
                                                            <p className={styles.docTexto}>{fileName}</p>
                                                        )}

                                                        <div className={styles.docActions}>
                                                            <button
                                                                type="button"
                                                                className={styles.previewBtn}
                                                                onClick={() => isFile ? handlePreview(doc) : handlePreview(doc)}
                                                                title="Ver Documento"
                                                            >
                                                                🔍
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={styles.deleteBtn}
                                                                onClick={() => handleEliminarDocumento(index, doc)}
                                                                title="Eliminar"
                                                            >
                                                                ❌
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className={styles.downloadBtn}
                                                        onClick={() => handleDownload(url, fileName.split("/").pop())}
                                                    >
                                                        Descargar
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}

                                {(!form.documentos || form.documentos.length === 0) && (
                                    <div className={styles.texto}>
                                        <p>No hay documentos cargados.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {selectedFile && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        {selectedFile.type && selectedFile.type.startsWith("image/") ? (
                            <img
                                src={selectedFile.url}
                                alt={selectedFile.name}
                                className={styles.modalImage}
                            />
                        ) : selectedFile.type === "application/pdf" ? (
                            <embed
                                src={selectedFile.url}
                                type="application/pdf"
                                className={styles.modalPdf}
                            />
                        ) : (
                            <p>{selectedFile.name}</p>
                        )}

                        <button onClick={closeModal} className={styles.closeBtn}>
                            ❌
                        </button>
                    </div>
                </div>
            )}

            {mensaje && (
                <div className={`${styles.alerta} ${visible ? styles.visible : styles.oculta} ${tipoMensaje === "success" ? styles.success : styles.error}`}>
                    {mensaje}
                </div>
            )}
        </div>
    );
}
