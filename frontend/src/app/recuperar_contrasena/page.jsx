"use client"; 

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./solicitarRecuperacion.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function HeaderLogin() {
  const [contrasena, setContrasena] = useState("");
  const [emailRecuperar, setEmailRecuperar] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false);
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [visible, setVisible] = useState(false);
  const [correo, setCorreo] = useState("");
  const router = useRouter();

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

  // 🔹 Login
  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:8000/api/login/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    correo,
    contrasena
  })
});

    const data = await res.json();

    if (!res.ok || !data.success) {
      mostrarAlerta("Correo o contraseña no coinciden", "error");
      return;
    }

    mostrarAlerta("Ingreso correcto", "success");

    // Guardar token
    localStorage.setItem("token", data.access_token);

    // Redirección después de 2s (para que se vea la alerta)
    setTimeout(() => {
      switch (data.tipo) {
        case "estudiante":
          router.push("/estudiantes");
          break;
        case "novedades":
          router.push("/vista-novedades");
          break;
        case "instructor":
          router.push("/vista-instructor");
          break;
        case "productiva":
          router.push("/vista-productiva");
          break;
        case "certificacion":
          router.push("/vista-certificacion");
          break;
        case "seguimiento":
          router.push("/vista-seguimiento");
          break;
        default:
          router.push("/");
      }
    }, 2000);
    
  } catch (error) {
    mostrarAlerta("Error de conexión con el servidor", "error");
  }
};

  // 🔹 Recuperar contraseña
  const handleRecuperar = async (e) => {
  e.preventDefault();

  if (!emailRecuperar) {
    mostrarAlerta("El correo no puede estar vacío", "error");
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:8000/api/password/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: emailRecuperar }),
    });

    const data = await res.json();
    console.log("Respuesta backend:", data);

    if (res.ok && data.success) {
      mostrarAlerta("Se envió un enlace a tu correo", "success");
      setEmailRecuperar("");
    } else {
      const mensajes = Array.isArray(data.detail)
        ? data.detail.map((err) => err.msg).join(", ")
        : data.detail || data.message || "Error desconocido";

      mostrarAlerta(mensajes, "error");
    }
  } catch (error) {
    mostrarAlerta("Error del servidor", "error");
    console.error(error);
  }
};

  return (
  <>
    <div className={styles.header}>
      <div className={styles.left}>
        <img src="/sena.png" alt="Logo" />
      </div>

      <div className={styles.right}>
        <form onSubmit={handleSubmit} className={styles.formInline}>
          <div className={styles.passwordWrapper}>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="Correo electrónico"
              required
            />
            <input
              type={mostrarPass ? "text" : "password"}
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
            <FontAwesomeIcon
              icon={mostrarPass ? faEyeSlash : faEye}
              className={styles.eyeIcon}
              onClick={() => setMostrarPass(!mostrarPass)}
            />
          </div>
          <button type="submit" className={styles.buttonIngreso}>Iniciar Sesión</button>
        </form>
      </div>
    </div> 

    <div className={styles.formRecuperacionContainer}>
      <form onSubmit={handleRecuperar} className={styles.formRecuperacion}>
        <h2>Recuperar Contraseña</h2>
        <hr />
        <label htmlFor="email">Ingresa tu correo electrónico para recuperar tu contraseña</label>
        <input
          type="email"
          id="email"
          value={emailRecuperar}
          onChange={(e) => setEmailRecuperar(e.target.value)}
          placeholder="Correo electrónico"
          required
        />
        <button type="submit">Enviar enlace</button>
      </form>
    </div>
        <div className={`${styles.alerta} ${visible ? styles.visible : ""} ${tipoMensaje === "success" ? styles.success : styles.error}`}>
          {mensaje}
        </div>
    </>
  );
}
