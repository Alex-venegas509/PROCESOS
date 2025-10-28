"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./ModalEditarProductiva.module.css";

export default function EtapaProductiva({ onClose, productiva, onUpdate }) {
    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [visible, setVisible] = useState(false);
    const fileInputRef = useRef(null); // input para documentos (oculto)
    const [selectedFile, setSelectedFile] = useState(null);
    const [buscarCedula, setBuscarCedula] = useState("");
    const [buscarFicha, setBuscarFicha] = useState("");
    const [resultados, setResultados] = useState([]);
    const [files, setFiles] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);

    const [documentos, setDocumentos] = useState([
        { id: 1, nombre: "Cognitiva", tipo: "check", activo: false },
        { id: 2, nombre: "Física", tipo: "check", activo: false },
        { id: 4, nombre: "Auditiva", tipo: "check", activo: false },
        { id: 5, nombre: "Visual", tipo: "check", activo: false },
        { id: 6, nombre: "Lenguaje o Comunicación", tipo: "check", activo: false },
    ]);

    const [documento, setDocumento] = useState([
        { id: 7, nombre: "Carta de Presentación", tipo: "check", activo: false },
    ]);

    const [form, setForm] = useState({
        identificacion: "",
        ficha: "",
        discapacidad: "",
        cual_discapacidad: "",
        tipo_documento: "",
        documentos: []
    });

    useEffect(() => {
        if (productiva) {
            // 1️⃣ Parsear campo 'cual_discapacidad' correctamente
            const cualArray = Array.isArray(productiva.cual_discapacidad)
                ? productiva.cual_discapacidad
                : typeof productiva.cual_discapacidad === "string"
                    ? productiva.cual_discapacidad.split(/[,;]+/).map(s => s.trim())
                    : [];

            // 2️⃣ Parsear documentos
            const docsArray = Array.isArray(productiva.ruta_documentos)
                ? productiva.ruta_documentos
                : typeof productiva.ruta_documentos === "string"
                    ? (() => {
                        try {
                            const parsed = JSON.parse(productiva.ruta_documentos);
                            return Array.isArray(parsed) ? parsed : productiva.ruta_documentos.split(/[;,]+/);
                        } catch {
                            return productiva.ruta_documentos.split(/[;,]+/);
                        }
                    })()
                    : [];

            // 3️⃣ Actualizar el form
            setForm({
                id: productiva.id,
                identificacion: productiva.identificacion || "",
                ficha: productiva.ficha || "",
                discapacidad: productiva.discapacidad || "",
                cual_discapacidad: cualArray,
                tipo_documento: productiva.tipo_documento || [],
                documentos: docsArray
            });

            // 4️⃣ Activar los checks de discapacidad
            setDocumentos(prev =>
                prev.map(doc => ({
                    ...doc,
                    activo: cualArray.includes(doc.nombre)
                }))
            );

            // 5️⃣ Activar los checks de tipo de documento
            setDocumento(prev =>
                prev.map(doc => ({
                    ...doc,
                    activo: productiva.tipo_documento?.includes(doc.nombre)
                }))
            );

            // 6️⃣ Mostrar documentos existentes
            setFiles(docsArray);
        }
    }, [productiva]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/estudiantes/")
            .then((res) => res.json())
            .then((data) => setEstudiantes(data))
            .catch((err) => console.error("Error cargando estudiantes:", err));
    }, []);

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

    const handleDownload = async (file) => {
        try {
            let url = "";
            let filename = "";

            if (file instanceof File) {
                url = URL.createObjectURL(file);
                filename = file.name;
            } else if (typeof file === "string") {
                url = `http://localhost:8000/uploads/${file}`;
                filename = file.split("/").pop();
            } else {
                throw new Error("Tipo de archivo desconocido");
            }

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

    const handleBuscar = () => {
        const cedula = buscarCedula.trim().toLowerCase();
        const ficha = buscarFicha.trim().toLowerCase();

        const filtrados = estudiantes.filter((est) => {
            const matchCedula =
                cedula === "" ||
                est.identificacion?.toString().toLowerCase().includes(cedula);
            const matchFicha =
                ficha === "" ||
                est.ficha?.toString().toLowerCase().includes(ficha);
            return matchCedula && matchFicha;
        });

        setResultados(filtrados);

        // Si hay al menos un resultado, actualizamos el form
        if (filtrados.length > 0) {
            const est = filtrados[0]; // tomamos el primer resultado o el seleccionado
            setForm((prev) => ({
                ...prev,
                identificacion: est.identificacion || "",
                ficha: est.ficha || "",
            }));
        } else {
            // Si no hay resultados, opcionalmente puedes limpiar
            setForm((prev) => ({
                ...prev,
                identificacion: "",
                ficha: "",
            }));
        }
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
                `http://localhost:8000/api/productiva/${form.id}/documentos?filename=${encodeURIComponent(doc)}`,
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
        // Verifica si el ID pertenece a la lista de discapacidad
        const isDiscapacidad = documentos.some((doc) => doc.id === id);

        if (isDiscapacidad) {
            setDocumentos((prevDocs) => {
                const updatedDocs = prevDocs.map((doc) =>
                    doc.id === id ? { ...doc, activo: !doc.activo } : doc
                );

                // Actualizamos también el form.cual_discapacidad
                const seleccionados = updatedDocs
                    .filter((doc) => doc.activo)
                    .map((doc) => doc.nombre);

                setForm((prev) => ({
                    ...prev,
                    cual_discapacidad: seleccionados,
                }));

                return updatedDocs;
            });
        } else {
            // Si no está en discapacidad, pertenece a tipo_documento
            setDocumento((prevDocs) => {
                const updatedDocs = prevDocs.map((doc) =>
                    doc.id === id ? { ...doc, activo: !doc.activo } : doc
                );

                // Actualizamos también form.tipo_documento
                const seleccionados = updatedDocs
                    .filter((doc) => doc.activo)
                    .map((doc) => doc.nombre);

                setForm((prev) => ({
                    ...prev,
                    tipo_documento: seleccionados,
                }));

                return updatedDocs;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();

            Object.entries(form).forEach(([key, value]) => {
                if (key !== "documentos" && key !== null && value !== undefined) {
                    if (Array.isArray(value)) {
                        value.forEach((item) => formData.append(key, item));
                    } else {
                        formData.append(key, value);
                    }
                }
            });

            const fileInput = document.getElementById("fileInput");
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

            const response = await fetch(`http://localhost:8000/api/productiva/${form.id}`, {
                method: "PUT",
                body: formData,
            });

            if (!response.ok) throw new Error("Error al guardar cambios");

            const data = await response.json();

            mostrarAlerta("Etapa productiva actualizado correctamente", "success");

            const ALERT_DURATION = 2500;
            const FADE_OUT = 400;
            setTimeout(() => {
                if (onUpdate) onUpdate(data);
                onClose();
            }, ALERT_DURATION + FADE_OUT);

        } catch (err) {
            console.error("Error en actualización:", err);
            mostrarAlerta("Error al actualizar etapa productiva", "error");
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modalForm}>
                <button className={styles.closeButton} onClick={onClose} title="Cerrar">❌</button>
                <h1 className={styles.tituloInicio}><strong>Editar Etapa Productiva</strong></h1>

                <form onSubmit={handleSubmit} className={styles.formProductiva}>
                    <div className={styles.containerProductiva}>
                        <div className={styles.leftColumn}>
                            <div className={styles.buscadorInputs}>
                                <label className={styles.subtitulo}>No. de identificación</label>
                                <input
                                    type="text"
                                    placeholder="Buscar por cedula"
                                    value={buscarCedula}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setBuscarCedula(value);
                                        if (value === "" && buscarFicha === "") {
                                            setResultados([]); // 🔹 Limpia resultados si ambos campos están vacíos
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault(); // evita que dispare handleSubmit
                                            handleBuscar();
                                        }
                                    }}
                                    className={styles.searchInput}
                                />
                                <br />
                                <label className={styles.subtitulo}>No. de ficha</label>
                                <input
                                    type="text"
                                    placeholder="Buscar por ficha"
                                    value={buscarFicha}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setBuscarFicha(value);
                                        if (value === "" && buscarCedula === "") {
                                            setResultados([]); // 🔹 Limpia resultados si ambos campos están vacíos
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault(); // evita que dispare handleSubmit
                                            handleBuscar();
                                        }
                                    }}
                                    className={styles.searchInput}
                                />

                                <button type="button" className={styles.buscarBtn} id="buscador" onClick={handleBuscar}>Buscar</button>


                                <div className={styles.preguntaDiscapacidad}>
                                    <label className={styles.labelPregunta}>
                                        ¿El aprendiz presenta alguna condición de discapacidad?
                                    </label>

                                    <div className={styles.opciones}>
                                        <label>
                                            <input
                                                type="radio"
                                                name="discapacidad"
                                                value="si"                     // Valor fijo para esta opción
                                                checked={form.discapacidad === "si"}   // Se marca si coincide
                                                onChange={handleChange}
                                                className={styles.radio}
                                                title="Seleccionar"
                                                required
                                            />
                                            <span>SI</span>
                                        </label>

                                        <label>
                                            <input
                                                type="radio"
                                                name="discapacidad"
                                                value="no"                     // Valor fijo para esta opción
                                                checked={form.discapacidad === "no"}   // Se marca si coincide
                                                onChange={handleChange}
                                                className={styles.radio}
                                                title="Seleccionar"
                                                required
                                            />
                                            <span>NO</span>
                                        </label>
                                    </div>
                                </div>
                                <div className={styles.question}>
                                    <label>
                                        ¿Cual?
                                    </label>
                                </div>

                                <ul className={styles.documentosList}>
                                    {documentos.map((doc) => (
                                        <li key={doc.id} className={styles.documentoItem}>
                                            <div className={styles.documentoHeader}>
                                                <span className={styles.nombre}>{doc.nombre}</span>
                                                <span
                                                    className={`${styles.icono} ${styles.check} ${doc.activo ? styles.activo : ""}`}
                                                    onClick={() => toggleCheck(doc.id)}
                                                    title="Marcar"
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className={styles.centerColumn}>
                            <div className={styles.resultados}>
                                {resultados.length > 0 ? (
                                    resultados.map((est) => (
                                        <div key={est.id} className={styles.resultadoItem}>
                                            <p><strong>No. de identificación:</strong> &nbsp;&nbsp; {est.identificacion}</p>
                                            <p><strong>No. de ficha:</strong> &nbsp;&nbsp; {est.ficha}</p>
                                        </div>
                                    ))
                                ) : productiva ? (
                                    <div className={styles.resultadoItem}>
                                        <p><strong>No. de identificación:</strong> &nbsp;&nbsp; {productiva.identificacion}</p>
                                        <p><strong>No. de ficha:</strong> &nbsp;&nbsp; {productiva.ficha}</p>
                                    </div>
                                ) : (
                                    <p><strong>No hay información.</strong></p>
                                )}
                            </div>

                            <label className={styles.text}>Tipo de documento</label>

                            <ul className={styles.selectDocument}>
                                {documento.map((doc) => (
                                    <li key={doc.id}>
                                        <div className={styles.containerDocument}>
                                            <span>{doc.nombre}</span>
                                            <span
                                                className={`${styles.icono} ${styles.check} ${doc.activo ? styles.activo : ""}`}
                                                onClick={() => toggleCheck(doc.id)}
                                                title="Marcar"
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className={styles.contenedorButton}>
                                <button type="submit" className={styles.button}>
                                    Guardar
                                </button>
                            </div>
                        </div>

                        <div className={styles.rightColumn}>
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
                                                            {['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension) ? (
                                                                <img src={url} alt={fileName} className={styles.docPreview} />
                                                            ) : fileExtension === 'pdf' ? (
                                                                <embed src={url} type="application/pdf" className={styles.docPreviewPdf} />
                                                            ) : (
                                                                <p className={styles.docTexto}>{fileName}</p>
                                                            )}

                                                            <div className={styles.docActions}>
                                                                <button
                                                                    type="button"
                                                                    className={styles.deleteBtn}
                                                                    onClick={() => handleEliminarDocumento(index, doc)}
                                                                    title="Eliminar"
                                                                >
                                                                    ❌
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className={styles.previewBtn}
                                                                    onClick={() => isFile ? handlePreview(doc) : handlePreview(doc)}
                                                                    title="Ver Documento"
                                                                >
                                                                    🔍
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
                    </div>
                </form>
            </div>
            {selectedFile && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        {selectedFile.type.startsWith("image/") ? (
                            <img src={selectedFile.url} alt="Vista ampliada" />
                        ) : selectedFile.type === "application/pdf" ? (
                            <embed src={selectedFile.url} type="application/pdf" className={styles.modalPdf} />
                        ) : (
                            <p>{selectedFile.name}</p>
                        )}
                        <button onClick={closeModal} className={styles.closeBtn}>❌</button>
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
