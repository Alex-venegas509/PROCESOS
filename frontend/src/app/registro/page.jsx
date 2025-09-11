"use client";

import { useState } from "react";
import styles from "./registro.module.css";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function RegistroPage() {
  const router = useRouter();
  const [mostrarPass, setMostrarPass] = useState(false);
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [visible, setVisible] = useState(false);
  const [mostrarConfirmPass, setMostrarConfirmPass] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    cedula: "",
    contrasena: "",
    confirmarContrasena: "",
    correo: "",
    confirmarCorreo: "",
    tipo: "",
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (form.contrasena !== form.confirmarContrasena || form.correo !== form.confirmarCorreo) {
    mostrarAlerta("Los correos o contraseñas no coinciden.");
    return;
  }

  // Validar contraseña segura
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!passwordRegex.test(form.contrasena)) {
    mostrarAlerta("La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un símbolo especial.");
    return;
  }

  try {
    const res = await fetch("http://localhost:8000/api/usuarios/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.nombre,
        apellido: form.apellido,
        documento: form.documento,
        cedula: parseInt(form.cedula),
        contrasena: form.contrasena,
        correo: form.correo,
        tipo: form.tipo,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      mostrarAlerta("Usuario creado correctamente", "success");
      setTimeout(() => router.push("/"), 2000);
    } else {
      mostrarAlerta(data.detail || data.message || "Error al registrar usuario", "error");
    }
  } catch (error) {
    mostrarAlerta("No se pudo conectar con el servidor", "error");
    console.error("Error en el registro:", error);
  }
};

  return (
  <div className={styles.pageContainer}>
    <div className={styles.container}>
        <div className={styles.imagesContainer}>
          <img src="/sena.png" alt="Logo" />
        </div>
      <label className={styles.titulo}><strong>Registro</strong></label>

      <form onSubmit={handleSubmit}>
        <input type="text" name="nombre" placeholder="Nombre" onChange={handleChange} required />
        <input type="text" name="apellido" placeholder="Apellido" onChange={handleChange} required />
        <select name="documento" onChange={handleChange} required>
            <option value="">Seleccione tipo de documento</option>
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="TI">Tarjeta de Identidad</option>
            <option value="CE">Cédula de Extranjería</option>
            <option value="PP">Pasaporte</option>
        </select>
        <input type="number" name="cedula" placeholder="Cédula" onChange={handleChange} required />
        <input type="email" name="correo" placeholder="Correo" onChange={handleChange} required />
        <input type="email" name="confirmarCorreo" placeholder="Confirmar correo" onChange={handleChange} required />
        <div className={styles.passwordWrapper}>
        <input
            type={mostrarPass ? "text" : "password"}
            placeholder="Contraseña"
            name="contrasena"
            value={form.contrasena}
            onChange={handleChange}
            className={styles.passwordInput}
        />
        <FontAwesomeIcon
            icon={mostrarPass ? faEyeSlash : faEye}
            className={styles.eyeIcon}
            onClick={() => setMostrarPass(!mostrarPass)}
        />
        </div>

        <div className={styles.passwordWrapper}>
        <input
            type={mostrarConfirmPass ? "text" : "password"}
            placeholder="Confirmar contraseña"
            name="confirmarContrasena"
            value={form.confirmarContrasena}
            onChange={handleChange}
            className={styles.passwordInput}
        />
        <FontAwesomeIcon
            icon={mostrarConfirmPass ? faEyeSlash : faEye}
            className={styles.eyeIcon}
            onClick={() => setMostrarConfirmPass(!mostrarConfirmPass)}
        />
        </div>
        <select name="tipo" onChange={handleChange} required>
            <option value="">Seleccione tipo de rol</option>
            <option value="estudiante">Información del estudiante</option>
            <option value="novedades">Novedades</option>
            <option value="instructor">Instructor</option>
            <option value="productiva">Etapa productiva</option>
            <option value="certificacion">Egreso/certificación</option>
            <option value="seguimiento">Seguimiento de etapa productiva</option>
        </select>

        <div className={styles.btnContainer}>
          <button type="submit" className={styles.btnRegistrar}>Registrar</button>
          <button type="button" className={styles.btnVolver} onClick={() => router.push("/")}>Volver</button>
        </div>
      </form>
      {mensaje && (
        <div className={`${styles.alerta} ${visible ? styles.visible : styles.oculta} ${tipoMensaje === "success" ? styles.success : styles.error}`}>
          {mensaje}
        </div>
      )}
    </div>
    </div>
  );
}
