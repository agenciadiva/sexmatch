import { Resend } from "resend";
import { buildResultsEmail } from "../src/utils/emailTemplate.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido",
    });
  }

  try {
    const { email, results } = req.body ?? {};

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        error: "Falta ingresar un email válido",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        error: "El email ingresado no es válido",
      });
    }

    if (!results || typeof results !== "object") {
      return res.status(400).json({
        error: "No se encontraron los resultados",
      });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("Falta configurar RESEND_API_KEY");

      return res.status(500).json({
        error: "El servicio de correo no está configurado",
      });
    }

    const html = buildResultsEmail(results);

    const { data, error } = await resend.emails.send({
      from: "Matches <resultados@matches.com.ar>",
      to: [normalizedEmail],
      subject: "Tus resultados de Matches 💜",
      html,
    });

    if (error) {
      console.error("Error de Resend:", error);

      return res.status(500).json({
        error: "No pudimos enviar el correo",
      });
    }

    return res.status(200).json({
      success: true,
      emailId: data?.id,
    });
  } catch (error) {
    console.error("Error al enviar resultados:", error);

    return res.status(500).json({
      error: "Ocurrió un error al enviar el correo",
    });
  }
}