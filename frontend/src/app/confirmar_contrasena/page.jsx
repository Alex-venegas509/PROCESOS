"use client";
import { useState, useEffect } from "react";
import styles from "./confirmacion.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // <- se obtiene de la URL
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [visible, setVisible] = useState(false);
  const [mostrarPass1, setMostrarPass1] = useState(false);
  const [mostrarPass2, setMostrarPass2] = useState(false);
  const [tokenValido, setTokenValido] = useState(false);

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

  // Validar token al cargar la página
  useEffect(() => {
    if (!token) {
      mostrarAlerta("Token no encontrado en el enlace.");
      return;
    }

    const validarToken = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/password/validate?token=${token}`);
        if (!res.ok) {
          mostrarAlerta("El enlace de recuperación expiró o es inválido.");
          setTokenValido(false);
        } else {
          setTokenValido(true);
        }
      } catch (err) {
        mostrarAlerta("Error validando el enlace.");
      }
    };

    validarToken();
  }, [token]);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (password !== confirmar) {
    mostrarAlerta("Las contraseñas no coinciden");
    return;
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!passwordRegex.test(password)) {
    mostrarAlerta(
      "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un símbolo especial."
    );
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:8000/api/password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarAlerta(data.detail || "Error al actualizar contraseña", "error");
      return;
    }

    // Si llega aquí es porque fue exitoso
    setPassword("");
    setConfirmar("");
    mostrarAlerta("Contraseña actualizada correctamente", "success");

    // Opcional: redirigir al login después de unos segundos
    setTimeout(() => {
    }, 2500);
  } catch (err) {
    mostrarAlerta("Error en el servidor");
  }
};

  return (
    <>
      <div className={styles.header}>
        <div className={styles.left}>
          <img src="/sena.png" alt="Logo" className={styles.logo} />
        </div>
      </div>

      <div className={styles.formRecuperacionContainer}>
        {tokenValido ? (
          <form onSubmit={handleSubmit} className={styles.formRecuperacion}>
            <h2>Ingrese la nueva contraseña</h2>
            <hr />

            <label>Nueva contraseña</label>
            <div className={styles.passwordWrapper}>
              <input
                type={mostrarPass1 ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputs}
                placeholder="Contraseña"
                required
              />
              <FontAwesomeIcon
                icon={mostrarPass1 ? faEyeSlash : faEye}
                className={styles.eyeIcon}
                onClick={() => setMostrarPass1(!mostrarPass1)}
              />
            </div>

            <label>Confirmar contraseña</label>
            <div className={styles.passwordWrapper}>
              <input
                type={mostrarPass2 ? "text" : "password"}
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                className={styles.inputs}
                placeholder="Contraseña"
                required
              />
              <FontAwesomeIcon
                icon={mostrarPass2 ? faEyeSlash : faEye}
                className={styles.eyeIcon}
                onClick={() => setMostrarPass2(!mostrarPass2)}
              />
            </div>

            <button type="submit">Actualizar</button>
          </form>
        ) : (
          <div className={styles.formRecuperacion}>
            <h2>El enlace ya no es válido</h2>
            <p>Solicita nuevamente la recuperación de contraseña.</p>
          </div>
        )}
      </div>

      <div className={`${styles.alerta} ${visible ? styles.visible : ""} ${tipoMensaje === "success" ? styles.success : styles.error}`}>
          {mensaje}
        </div>
    </>
  );
}
