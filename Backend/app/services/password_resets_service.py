# app/services/email_service.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "laboratoriocme2025@gmail.com"
SMTP_PASSWORD = "lymyaqcjdzmkowor"  # Contraseña de aplicación de Gmail

def enviar_correo(para: str, asunto: str, cuerpo: str):
    try:
        # Configuración del mensaje
        msg = MIMEMultipart()
        msg["From"] = SMTP_USER
        msg["To"] = para
        msg["Subject"] = asunto

        msg.attach(MIMEText(cuerpo, "html"))

        # Conexión SMTP
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, para, msg.as_string())
        server.quit()

        print("Correo enviado correctamente")
        return True

    except Exception as e:
        print(f"Error al enviar correo: {e}")
        return False
