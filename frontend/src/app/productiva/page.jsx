"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./productiva.module.css";

export default function EtapaProductiva() {
    // ------------------- ESTADOS -------------------
    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [visible, setVisible] = useState(false);
    const fileInputRef = useRef(null);

    const [buscarCedula, setBuscarCedula] = useState("");
    const [buscarFicha, setBuscarFicha] = useState("");
    const [estudiantes, setEstudiantes] = useState([]);
    const [resultados, setResultados] = useState([]);
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

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

    // ------------------- FUNCIONES DE ALERTA -------------------
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

    // ------------------- CARGA DE ESTUDIANTES -------------------
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/estudiantes/")
            .then((res) => res.json())
            .then((data) => setEstudiantes(data))
            .catch((err) => console.error("Error cargando estudiantes:", err));
    }, []);

    // ------------------- MANEJO DE DOCUMENTOS -------------------
    const handleDocsChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles((prev) => [...prev, ...selectedFiles]);
    };

    const handleUploadClick = () => fileInputRef.current.click();
    const closeModal = () => setSelectedFile(null);
    const handlePreview = (files) => setSelectedFile(files);
    const handleDelete = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));

    // ------------------- CHECKBOXES -------------------
    const toggleCheck = (id) => {
        let updated = false;

        setDocumentos((prevDocs) =>
            prevDocs.map((doc) => {
                if (doc.id === id) {
                    updated = true;
                    return { ...doc, activo: !doc.activo };
                }
                return doc;
            })
        );

        if (!updated) {
            setDocumento((prevDocs) =>
                prevDocs.map((doc) =>
                    doc.id === id ? { ...doc, activo: !doc.activo } : doc
                )
            );
        }
    };

    // ------------------- BÚSQUEDA -------------------
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
    };

    // ------------------- ENVÍO A FASTAPI -------------------
    const pushSubmit = async (e) => {
        e.preventDefault();

        if (resultados.length === 0) {
            mostrarAlerta("Debes seleccionar un estudiante válido", "error");
            return;
        }

        const discapacidad = document.querySelector('input[name="discapacidad"]:checked')?.value || "";

        // Crear el cuerpo que el backend espera (según ProductivaBase)
        const formToSend = {
            identificacion: resultados[0]?.identificacion || "",
            ficha: parseInt(resultados[0]?.ficha || 0),
            discapacidad,
            cual_discapacidad: documentos.filter((doc) => doc.activo).map((doc) => doc.nombre),
            tipo_documento: documento.filter((doc) => doc.activo).map((doc) => doc.nombre),
        };

        try {
            // Paso 1: registrar datos del estudiante
            const res = await fetch("http://localhost:8000/api/productiva/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formToSend),
            });

            const data = await res.json();

            if (!res.ok) {
                let mensajeError = "Error al registrar etapa productiva";

                if (Array.isArray(data.detail)) {
                    mensajeError = data.detail.map((err) => err.msg).join(", ");
                } else if (typeof data.detail === "object" && data.detail?.msg) {
                    mensajeError = data.detail.msg;
                } else if (typeof data.detail === "string") {
                    mensajeError = data.detail;
                }

                mostrarAlerta(mensajeError, "error");
                return;
            }

            const idProductiva = data.id;

            // Paso 2: subir archivos
            const formData = new FormData();
            files.forEach((doc, i) => {
                formData.append("documentos", doc, doc.name || `doc_${i}`);
            });

            const uploadRes = await fetch(
                `http://localhost:8000/api/productiva/${idProductiva}/upload`,
                { method: "POST", body: formData }
            );

            const uploadData = await uploadRes.json();

            if (!uploadRes.ok) {
                let mensajeError = "Error al subir archivos";

                if (Array.isArray(uploadData.detail)) {
                    mensajeError = uploadData.detail.map((err) => err.msg).join(", ");
                } else if (typeof uploadData.detail === "object" && uploadData.detail?.msg) {
                    mensajeError = uploadData.detail.msg;
                } else if (typeof uploadData.detail === "string") {
                    mensajeError = uploadData.detail;
                }

                mostrarAlerta(mensajeError, "error");
                return;
            }

            mostrarAlerta("Etapa productiva registrado correctamente", "success");

            setTimeout(() => { window.location.reload(); }, 2000);

        } catch (err) {
            mostrarAlerta("Error en el servidor", "error");
        }
    };

    return (
        <form onSubmit={pushSubmit} className={styles.formProductiva}>
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
                            onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
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
                            onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
                            className={styles.searchInput}
                        />

                        <button className={styles.buscarBtn} id="buscador" onClick={handleBuscar}>Buscar</button>


                        <div className={styles.preguntaDiscapacidad}>
                            <label className={styles.labelPregunta}>
                                ¿El aprendiz presenta alguna condición de discapacidad?
                            </label>

                            <div className={styles.opciones}>
                                <label>
                                    <input
                                        type="radio"
                                        name="discapacidad"
                                        value="si"
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
                                        value="no"
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
                    </div>
                </div>

                <div className={styles.centerColumn}>
                    <div className={styles.resultados}>
                        {resultados.length === 0 ? (
                            <p><strong>No hay información.</strong></p>
                        ) : (
                            resultados.map((est) => (
                                <div key={est.id} className={styles.resultadoItem}>
                                    <p><strong>No. de identificación:</strong> &nbsp;&nbsp; {est.identificacion}</p>
                                    <p><strong>No. de ficha:</strong> &nbsp;&nbsp; {est.ficha}</p>
                                </div>
                            ))
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
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleDocsChange}
                            multiple
                            style={{ display: "none" }}
                        />

                        <div className={styles.contenedorBoton}>
                            <button type="button" onClick={handleUploadClick} className={styles.boton}>
                                Subir Documento
                            </button>
                        </div>

                        <div className={styles.documentosContainer}>
                            {files.length > 0 ? (
                                <ul>
                                    {files.map((file, index) => (
                                        <li key={index} className={styles.docItem}>
                                            <div className={styles.previewBox}>
                                                {file.type.startsWith("image/") ? (
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`Vista previa ${index + 1}`}
                                                        className={styles.docPreview}
                                                    />
                                                ) : file.type === "application/pdf" ? (
                                                    <embed
                                                        src={URL.createObjectURL(file)}
                                                        type="application/pdf"
                                                        className={styles.docPreviewPdf}
                                                    />
                                                ) : (
                                                    <p className={styles.docTexto}>{file.name}</p>
                                                )}

                                                <div className={styles.docActions}>
                                                    <button type="button" title="Eliminar" className={styles.deleteBtn} onClick={() => handleDelete(index)}>❌</button>
                                                    <button type="button" title="Ver Documento" className={styles.previewBtn} onClick={() => handlePreview(file)}>🔍</button>
                                                </div>
                                            </div>

                                            <a href={URL.createObjectURL(file)} download={file.name} className={styles.downloadBtn}>
                                                Descargar
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className={styles.sindocument}>
                                    <p>No hay documentos cargados.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {selectedFile && (
                    <div className={styles.modalOverlay} onClick={closeModal}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            {selectedFile.type.startsWith("image/") ? (
                                <img src={URL.createObjectURL(selectedFile)} alt="Vista ampliada" />
                            ) : selectedFile.type === "application/pdf" ? (
                                <embed src={URL.createObjectURL(selectedFile)} type="application/pdf" className={styles.modalPdf} />
                            ) : (
                                <p>{selectedFile.name}</p>
                            )}
                            <button onClick={closeModal} className={styles.closeBtn} title="Cerrar">❌</button>
                        </div>
                    </div>
                )}

                {mensaje && (
                    <div className={`${styles.alerta} ${visible ? styles.visible : styles.oculta} ${tipoMensaje === "success" ? styles.success : styles.error}`}>
                        {mensaje}
                    </div>
                )}
            </div>
        </form>
    );
}
