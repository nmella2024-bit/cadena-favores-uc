# Guía de Configuración de Seguridad DNS

Esta guía detalla los pasos necesarios para asegurar tu dominio y correos electrónicos mediante DNSSEC, DMARC, DKIM y SPF. Estas configuraciones deben realizarse en el panel de control de tu proveedor de dominio (ej. Namecheap, GoDaddy, Cloudflare) o DNS.

## 1. DNSSEC (Domain Name System Security Extensions)
**Objetivo:** Proteger contra ataques de suplantación de DNS (DNS spoofing).

**Instrucciones:**
1.  Ingresa al panel de control de tu registrador de dominio.
2.  Busca la sección "DNSSEC" o "Seguridad del Dominio".
3.  Activa la opción **DNSSEC**.
4.  Si usas un proveedor de DNS externo (como Cloudflare o Vercel), es posible que debas copiar los registros DS (Delegation Signer) proporcionados por ellos y pegarlos en tu registrador.

## 2. SPF (Sender Policy Framework)
**Objetivo:** Especificar qué servidores de correo están autorizados para enviar emails en nombre de tu dominio.

**Registro TXT a agregar:**
*   **Host/Nombre:** `@` (o dejar en blanco)
*   **Valor:** `v=spf1 include:_spf.google.com ~all`
    *   *Nota:* Si usas otro proveedor de correo además de Google Workspace (ej. SendGrid, Mailgun), debes incluir sus mecanismos (ej. `include:sendgrid.net`).

## 3. DKIM (DomainKeys Identified Mail)
**Objetivo:** Firmar digitalmente tus correos para verificar que no han sido alterados.

**Instrucciones (para Google Workspace):**
1.  Ve a la [Consola de Administración de Google](https://admin.google.com).
2.  Navega a **Apps > Google Workspace > Gmail > Autenticar correo electrónico**.
3.  Selecciona tu dominio y haz clic en **Generar nuevo registro**.
4.  Copia el nombre del host (generalmente `google._domainkey`) y el valor TXT generado.
5.  En tu proveedor de DNS, crea un nuevo registro TXT con esos datos.
6.  Vuelve a la consola de Google y haz clic en **Iniciar autenticación**.

## 4. DMARC (Domain-based Message Authentication, Reporting, and Conformance)
**Objetivo:** Indicar a los servidores de correo qué hacer si un email falla las verificaciones SPF o DKIM.

**Registro TXT a agregar:**
*   **Host/Nombre:** `_dmarc`
*   **Valor:** `v=DMARC1; p=quarantine; rua=mailto:seguridad@tudominio.com`

**Explicación de parámetros:**
*   `p=quarantine`: Envía los correos sospechosos a Spam. (Usa `p=reject` para máxima seguridad una vez verifiques que todo funciona bien).
*   `rua=mailto:...`: Dirección donde recibirás reportes agregados sobre la actividad de tu correo.

## Resumen de Registros DNS

| Tipo | Host | Valor (Ejemplo) |
| :--- | :--- | :--- |
| TXT | @ | `v=spf1 include:_spf.google.com ~all` |
| TXT | google._domainkey | `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQE...` |
| TXT | _dmarc | `v=DMARC1; p=quarantine; rua=mailto:admin@red-uc-eeuu.web.app` |

> [!IMPORTANT]
> Los cambios de DNS pueden tardar hasta 48 horas en propagarse globalmente.
