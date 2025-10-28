"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function LoginPage() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  const mostrarAlerta = (contenido, tipo = "error") => {
    setMensaje(contenido);
    setTipoMensaje(tipo);
    setVisible(true);

    setTimeout(() => {
      setVisible(false); // Ocultar después de 2.5s
      setTimeout(() => {
        setMensaje(null);
        setTipoMensaje("");
      }, 400); // Tiempo para animación de fade out
    }, 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(e);

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

      mostrarAlerta(
        <>
          Iniciando Sesión <div className={styles.loader}></div>
        </>,
        "success"
      );

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

  return (
    <div className={styles.pageContainer}>
      <div className={styles.loginContainer}>
        <form onSubmit={handleSubmit}>
          <div className={styles.imagesContainer}>
            <img src="/sena.png" alt="Logo" />
          </div>

          <label className={styles.titulo}><strong>Usuario</strong></label>
          <input
            type="email"
            placeholder="Correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
          />

          <label className={styles.titulo}><strong>Contraseña</strong></label>
          <div className={styles.passwordWrapper}>
            <input
              type={mostrarPass ? "text" : "password"}
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
              className={styles.passwordInput}
            />
            <FontAwesomeIcon
              icon={mostrarPass ? faEyeSlash : faEye}
              className={styles.eyeIcon}
              onClick={() => setMostrarPass(!mostrarPass)}
            />
          </div>

          <button type="submit">Iniciar sesión</button>

          <div className={styles.enlacesAcciones}>
            <a href="/recuperar_contrasena">¿Olvidé Contraseña?</a>
            <span>|</span>
            <a href="/registro">Registrarse</a>
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
