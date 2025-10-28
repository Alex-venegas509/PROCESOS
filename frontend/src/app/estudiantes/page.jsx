"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./estudiantes.module.css";
import RegistroEstudiantes from "../registro_estudiantes/page";
import EtapaProductiva from "../productiva/page";
import RegistrosProductiva from "../registro_etapaProductiva/page";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Registros() {
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [visible, setVisible] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [direction, setDirection] = useState(0);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const router = useRouter();
  const [documentos, setDocumentos] = useState([
    { id: 1, nombre: "Documento identidad", tipo: "check", activo: false },
    { id: 2, nombre: "Acta Compromiso Aprendiz", tipo: "check", activo: false },
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
    apellidos: "",
    tipo_identificacion: "",
    identificacion: "",
    correo: "",
    correo_institucional: "",
    celular: "",
    telefono: "",
    direccion: "",
    ficha: "",
    tipo_documento: documentos.filter((doc) => doc.activo).map((doc) => doc.nombre),
  });

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

  useEffect(() => {
    setForm((prevForm) => ({
      ...prevForm,
      tipo_documento: documentos.filter((doc) => doc.activo).map((doc) => doc.nombre),
    }));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/"); // redirige a page.jsx
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDocsChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click(); // abre el explorador de archivos
  };

  const closeModal = () => {
    setSelectedFile(null);
  };

  const handlePreview = (files) => {
    setSelectedFile(files);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDelete = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0
    }),
  };

  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return; // Si ya está activo, no hace nada
    setDirection(newTab > activeTab ? 1 : -1); // 1 derecha, -1 izquierda
    setActiveTab(newTab);
  };

  const tabTitles = [
    {
      titulo3: "DOCUMENTOS DE ESTUDIANTES",
      titulo4: "Información de Documentos",
    },
    {
      titulo3: "REGISTROS DE ESTUDIANTES",
      titulo4: "Información de Registros",
    },
    {
      titulo3: "ETAPA PRODUCTIVA",
      titulo4: "Información de Etapa Productiva",
    },
    {
      titulo3: "REGISTROS DE ETAPA PRODUCTIVA",
      titulo4: "Información de Etapa Productiva"
    },
  ];

  const toggleCheck = (id) => {
    setDocumentos((prev) =>
      prev.map((doc) => {
        if (doc.id === id) {
          const actualizado = { ...doc, activo: !doc.activo };

          // sincronizar con form.tipo_documento
          setForm((prevForm) => {
            const nuevosDocs = actualizado.activo
              ? [...prevForm.tipo_documento, actualizado.nombre]
              : prevForm.tipo_documento.filter((d) => d !== actualizado.nombre);

            return { ...prevForm, tipo_documento: nuevosDocs };
          });

          return actualizado;
        }
        return doc;
      })
    );
  };

  const toggleMenu = (id) => {
    setDocumentos(prev =>
      prev.map(doc => doc.id === id ? { ...doc, abierto: !doc.abierto } : doc)
    );
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

          // sincronizar con form.tipo_documento
          setForm((prevForm) => {
            const nuevosDocs = opcionFinal.activo
              ? [...prevForm.tipo_documento, opcionFinal.nombre]
              : prevForm.tipo_documento.filter((d) => d !== opcionFinal.nombre);

            return { ...prevForm, tipo_documento: nuevosDocs };
          });

          return { ...doc, opciones: opcionesActualizadas };
        }
        return doc;
      })
    );
  };

  const pushSubmit = async (e) => {
    e.preventDefault();

    if (!form.identificacion || form.identificacion.length < 5) {
      mostrarAlerta("La identificación debe tener al menos 5 caracteres", "error");
      return;
    }

    if (!form.correo.includes("@")) {
      mostrarAlerta("El correo debe ser válido", "error");
      return;
    }

    if (!form.nombre) {
      mostrarAlerta("El nombre es obligatorio", "error");
      return;
    }

    try {
      // Paso 1: guardar los datos del estudiante
      const res = await fetch("http://localhost:8000/api/estudiantes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        let mensajeError = "Error al registrar estudiante";

        if (Array.isArray(data.detail)) {
          mensajeError = data.detail.map(err => err.msg).join(", ");
        } else if (typeof data.detail === "object" && data.detail?.msg) {
          mensajeError = data.detail.msg;
        } else if (typeof data.detail === "string") {
          mensajeError = data.detail;
        }

        mostrarAlerta(mensajeError, "error");
        return;
      }

      // Estudiante creado, obtenemos su ID
      const idEstudiante = data.id;

      // Paso 2: subir foto y documentos
      const formData = new FormData();

      // Foto
      const fotoInput = document.getElementById("fileInput");
      if (fotoInput.files[0]) {
        formData.append("foto", fotoInput.files[0]);
      }

      // Documentos
      files.forEach((doc, i) => {
        formData.append("documentos", doc, doc.name || `doc_${i}`);
      });

      const uploadRes = await fetch(
        `http://localhost:8000/api/estudiantes/${idEstudiante}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        let mensajeError = "Error al subir archivos";

        if (Array.isArray(uploadData.detail)) {
          mensajeError = uploadData.detail.map(err => err.msg).join(", ");
        } else if (typeof uploadData.detail === "object" && uploadData.detail?.msg) {
          mensajeError = uploadData.detail.msg;
        } else if (typeof uploadData.detail === "string") {
          mensajeError = uploadData.detail;
        }

        mostrarAlerta(mensajeError, "error");
        return;
      }

      mostrarAlerta("Estudiante registrado correctamente", "success");

      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err) {
      mostrarAlerta("Error en el servidor", "error");
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <div className={styles.left}>
          <img src="/sena.png" alt="Logo" className={styles.logo} />
          <div className={styles.titulosContainer}>
            <label className={styles.titulo}><strong>Centro de Materiales y Ensayos</strong></label>
            <label className={styles.titulo2}><strong>Regional Distrito Capital</strong></label>
          </div>
        </div>

        <div className={styles.right}>
          <Image
            src="/icons/cerrar-sesion.png"
            alt="Cerrar sesión"
            width={24}
            height={24}
            title="Cerrar sesión"
            onClick={handleLogout}
          />
        </div>

        <div className={styles.titulosContainer2}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
            >
              <div>
                <label className={styles.titulo3}>
                  <strong>{tabTitles[activeTab].titulo3}</strong>
                </label>
              </div>
              <div>
                <label className={styles.titulo4}>
                  <strong>{tabTitles[activeTab].titulo4}</strong>
                </label>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 0 ? styles.activeTab : ""}`}
            onClick={() => handleTabChange(0)}
          >
            Documentos <br /> Estudiantes
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 1 ? styles.activeTab : ""}`}
            onClick={() => handleTabChange(1)}
          >
            Registros <br /> Estudiantes
          </button>

          <button
            type="button"
            className={`${styles.tab} ${activeTab === 2 ? styles.activeTab : ""}`}
            onClick={() => handleTabChange(2)}
          >
            Etapa <br /> Productiva
          </button>

          <button
            type="button"
            className={`${styles.tab} ${activeTab === 3 ? styles.activeTab : ""}`}
            onClick={() => handleTabChange(3)}
          >
            Registros <br /> Etapa <br /> Productiva
          </button>
        </div>
      </div>

      {/* Contenido dinámico */}
      <div className={styles.content}>
        <AnimatePresence mode="wait" custom={direction}>
          {activeTab === 0 && (
            <motion.div
              key="documentos"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6 }}
            >
              {/* FORMULARIO DOCUMENTOS */}
              <form onSubmit={pushSubmit} className={styles.formInner}>
                {/* Este wrapper es CLAVE para tu organización en fila */}
                <div className={styles.container}>
                  {/* FOTO */}
                  <div className={styles.fotoContainer}>
                    <div className={styles.fotoBox}>
                      {preview ? (
                        <img src={preview} alt="Preview" className={styles.fotoPreview} />
                      ) : (
                        <span className={styles.fotoText}>FOTO</span>
                      )}
                    </div>

                    <div className={styles.inputContainer}>
                      <label htmlFor="fileInput" className={styles.customButton}>
                        Cargar foto
                      </label>
                      <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className={styles.inputFile}
                      />
                    </div>
                  </div>

                  {/* DATOS PRINCIPALES */}
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
                      <input type="email" name="correo_institucional" value={form.correo_institucional} onChange={handleChange} />

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

                  {/* DATOS SECUNDARIOS */}
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
                      <input type="text" name="telefono" value={form.telefono} onChange={handleChange} />

                      <label className={styles.subtitulo}>Ficha Matrícula</label>
                      <input type="number" name="ficha" value={form.ficha} onChange={handleChange} required />

                      <div className={styles.contenedorButton}>
                        <button type="submit" className={styles.button}>
                          Guardar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* DOCUMENTOS */}
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
                                  <button type="button" title="Ver Documento" className={styles.previewBtn} onClick={() => handlePreview(file)}>🔍</button>
                                  <button type="button" title="Eliminar" className={styles.deleteBtn} onClick={() => handleDelete(index)}>❌</button>
                                </div>
                              </div>

                              <a href={URL.createObjectURL(file)} download={file.name} className={styles.downloadBtn}>
                                Descargar
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className={styles.texto}>
                          <p>No hay documentos cargados.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>{/* 🔚 styles.container */}
              </form>
            </motion.div>
          )}

          {activeTab === 1 && (
            <motion.div
              key="registros"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6 }}
            >
              <RegistroEstudiantes />
            </motion.div>
          )}

          {activeTab === 2 && (
            <motion.div
              key="EtapaProductiva"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6 }}
            >
              <EtapaProductiva />
            </motion.div>
          )}

          {activeTab === 3 && (
            <motion.div
              key="RegistrosProductiva"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6 }}
            >
              <RegistrosProductiva />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL PREVIEW */}
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
  );
}

