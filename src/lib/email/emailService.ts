import nodemailer from 'nodemailer';

// Configuração do transporter (Microsoft 365/Outlook Corporativo)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.office365.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true para 465, false para 587 (TLS)
  auth: {
    user: process.env.EMAIL_USER || 'robo@yanksolutions.com.br',
    pass: process.env.EMAIL_PASSWORD || 'Y@nkR2020',
  },
  tls: {
    rejectUnauthorized: false, // Permite certificados auto-assinados
  },
  requireTLS: true, // Força uso de TLS
});

// Verificar conexão (opcional, útil para debug)
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Servidor de email conectado');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar servidor de email:', error);
    return false;
  }
}

// Interface para envio de email
export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Função principal de envio
export async function sendEmail(params: SendEmailParams) {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      const errorMsg = 'Configuração de email não encontrada. Verifique as variáveis EMAIL_USER e EMAIL_PASSWORD no .env.local';
      console.error('❌', errorMsg);
      return { success: false, error: new Error(errorMsg) };
    }

    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Yank Solutions'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text || params.html.replace(/<[^>]*>/g, ''), // Fallback para texto puro
    });

    console.log('✅ Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Erro ao enviar email:', error);
    
    // Mensagens de erro mais específicas
    let errorMessage = 'Erro ao enviar email';
    if (error.code === 'EAUTH') {
      errorMessage = 'Erro de autenticação. Verifique usuário e senha no .env.local';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Erro de conexão com servidor SMTP. Verifique EMAIL_HOST e EMAIL_PORT';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { success: false, error: new Error(errorMessage) };
  }
}

// Template de email de recuperação de senha
export function getPasswordResetEmailTemplate(resetLink: string, userName: string) {
  return {
    subject: 'Recuperação de Senha - BU RPA',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c19b2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2c19b2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #fbbf24; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Yank Solutions - BU RPA</h1>
          </div>
          <div class="content">
            <h2>Olá${userName ? `, ${userName}` : ''}!</h2>
            <p>Você solicitou a recuperação de senha da sua conta.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <p style="text-align: center;">
              <a href="${resetLink}" class="button">Redefinir Senha</a>
            </p>
            <div class="warning">
              <strong>⚠️ Atenção:</strong>
              <ul>
                <li>Este link expira em <strong>1 hora</strong></li>
                <li>Se você não solicitou esta recuperação, ignore este email</li>
                <li>Nunca compartilhe este link com ninguém</li>
              </ul>
            </div>
            <p>Se o botão não funcionar, copie e cole este link no navegador:</p>
            <p style="word-break: break-all; color: #666; font-size: 12px;">${resetLink}</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Yank Solutions. Todos os direitos reservados.</p>
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Olá${userName ? `, ${userName}` : ''}!

Você solicitou a recuperação de senha da sua conta BU RPA.

Clique no link abaixo para criar uma nova senha:

${resetLink}

ATENÇÃO:
- Este link expira em 1 hora
- Se você não solicitou esta recuperação, ignore este email
- Nunca compartilhe este link com ninguém

---
© ${new Date().getFullYear()} Yank Solutions
Este é um email automático, não responda.
    `
  };
}

// Template genérico (para futuros usos)
export function getGenericEmailTemplate(title: string, message: string, buttonText?: string, buttonLink?: string) {
  return {
    subject: title,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c19b2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2c19b2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Yank Solutions - BU RPA</h1>
          </div>
          <div class="content">
            <h2>${title}</h2>
            <p>${message}</p>
            ${buttonText && buttonLink ? `
              <p style="text-align: center;">
                <a href="${buttonLink}" class="button">${buttonText}</a>
              </p>
            ` : ''}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Yank Solutions. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

