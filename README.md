# Reto técnico Sistema de Agendamiento de Citas Médicas

### Descripción del negocio
Una compañía de seguros necesita desarrollar un sistema de agendamiento de citas médicas
que funcione en múltiples países, inicialmente Perú y Chile

## Descripcion técnica

> ####  Tecnología usada:
> 
> 1.  Node.js
> 2.  Typescript
> 3.  Persistencia DynamoDB
> 4.  API Gateway: Recibe las solicitudes de agendamiento desde el frontend
> 5.  WS Lambda: Procesa y valida los datos de la solicitud inicial y publica un evento de agendamiento en Amazon EventBridge.
> 6.  EventBridge: Gestiona la lógica de enrutamiento
>
>  *Everything* is going according to **plan**.
> 

### Aquí se presenta una arquitectura basada en eventos que puede manejar agendamientos específicos por país utilizando servicios serverless en AWS:

Gracias a la arquitectura en AWS aquí expuesta, el sistema es escalable, confiable y altamente disponible.
Mediante EventBridge la solución es capaz de manejar diferentes lógicas de procesamiento por país (Chile & Perú) y eventualmente otros paises

# Tareas del Reto
## 1. Diseño de Arquitectura 

### Diagrama de la Arquitectura Serveless para Agendamiento de Citas

<img width="914" alt="image" src="https://github.com/user-attachments/assets/5e108269-97d0-402c-b7dd-82afd46ef790">

Breve explicación:

* **S3**: Aloja el Frontend como un sitio web estático. En bucket S3, subimos los archivos de la aplicación frontend (HTML, CSS, JavaScript, etc.), configurando el bucket para funcionar como un sitio web estático.
También configuramos las políticas de permisos del bucket para que los archivos sean accesibles públicamente (o a través de CloudFront), asegurando que solo los archivos estáticos necesarios sean visibles.

* **API Gateway**: Recibe las solicitudes de Cita Medica desde el frontend. Los clientes (en este caso el sistema de Cita Medica web) envían solicitudes de agendamiento a través de API Gateway. API Gateway recibe las solicitudes y las pasa a una función Lambda inicial que valida la entrada y estructura el evento de agendamiento. Luego envía un evento de tipo "CitaMedica" a Amazon EventBridge, el evento contiene información relevante, como el país de origen, fecha y hora de agendamiento, y detalles específicos del usuario.
* **EventBridge** Gestiona la lógica de enrutamiento, enviando el evento de CitaMedica a un Lambda específico de cada país según reglas de país.
> Por ejemplo:
> Para eventos de CitaMedica de Perú, EventBridge envía el evento al Lambda processPeruCitaMedica
> Para eventos de CitaMedica de Chile, EventBridge lo envía al Lambda processChileCitaMedica
 
* **Lambda**: Procesadores específicos por país que manejan la lógica particular de cada región, como validaciones de reglas de negocio, disponibilidad de citas, doctores o asistentes por paises,etc.
* **DynamoDB**: Estos son lambda específicos para cada país pueden escribir el resultado de la CitaMedica en una tabla DynamoDB (**CitasMedicasDynamoDBTable**), Para almacenar y gestionar los detalles de los agendamientos. DynamoDB es ideal para una baja latencia y alta escalabilidad, pero si se requiere SQL, Aurora Serverless puede ser una buena alternativa.  

## 2. Manejo de Datos
- Describir la estructura de datos para almacenar la información de agendamientos

###DynamoDB
**Paciente**

La clase Paciente representa a un paciente en el sistema y contiene la información básica de cada persona:

id (string): Identificador único del paciente.
nombre (string): Nombre completo del paciente.
edad (number): Edad del paciente.
telefono (string): Número de contacto del paciente.
email (string): Dirección de correo electrónico del paciente.

**Medico**

La clase Medico representa a un médico en el sistema, con información de identificación y especialidad:

id (string): Identificador único del médico.
nombre (string): Nombre completo del médico.
especialidad (string): Especialización del médico (ej., "Cardiología", "Pediatría")

**Pais**

La clase Pais almacena la información sobre el país, permitiendo categorizar las citas de acuerdo al país donde se programan:

id (string): Identificador único del país.
nombre (string): Nombre completo del país.
codigo (string): Código ISO o abreviado del país (ej., "PE" para Perú, "MX" para México).

**CitaMedica**

La clase CitaMedica almacena la información específica de cada cita médica y se vincula tanto al Paciente como al Medico y Pais para relacionar los datos de manera completa.

id (string): Identificador único de la cita médica.
nombrePaciente (string): Nombre del paciente que programó la cita.
fecha (Date): Fecha en que se programó la cita.
hora (string): Hora específica de la cita (ej., "10:30 AM").
medicoAsignado (Medico): Referencia al objeto Medico que representa al médico asignado a esta cita.
pais (Pais): Referencia al objeto Pais que indica en qué país se realiza la cita.
estado (enum): Estado actual de la cita, que puede ser:
"pendiente"
"confirmada"
"realizada"
"cancelada"
creadoEn (Date): Fecha en que se creó la cita.

Ejemplo de datos para una cita médica:

<code>
 {
  id: "cita101",
  nombrePaciente: "Juan Pérez",
  fecha: new Date("2024-12-01"),
  hora: "10:30 AM",
  medicoAsignado: { id: "med456", nombre: "Dra. María García", especialidad: "Cardiología" },
  pais: { id: "pais789", nombre: "Perú", codigo: "PE" },
  estado: "pendiente",
  creadoEn: new Date("2024-11-01")
}
</code>
  
## 3. Procesamiento por País
- Detallar cómo se implementaría la lógica específica por país

Una propuesta para la lógica por país podría implementarse mediante:

a. Router de País
Lambda Function principal actúa como router y redirige a funciones Lambda específicas para cada país basándose en el parámetro country del API Gateway.

<code>
 export async function handler(event: any): Promise<any> {
    const country = event.queryStringParameters.country;

    switch (country) {
        case "PE":
            return await processPeru(event);
        case "CL":
            return await processChile(event);
        default:
            throw new Error("País no soportado");
    }
}
</code>

b. Modulo Específico por País
Cada país tiene su propio módulo para encapsular la lógica. Por ejemplo:

Lógica para Perú:
<code>
 export async function processPeru(event: any): Promise<any> {
    try {
        // Paso 1: Validar datos específicos para Perú
        const requestData = event.body;
        validatePeru(requestData);

        // Paso 2: Transformar y guardar los datos en DynamoDB
        const cita = transformCita(requestData, "PE");
        await saveToDynamoDB(cita);

        // Paso 3: Emitir evento a EventBridge
        await emitEvent("CitaCreada", cita);

        // Responder con éxito
        return {
            statusCode: 201,
            body: JSON.stringify(cita),
        };
    } catch (error) {
        console.error("Error procesando la cita para Perú:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error interno del servidor" }),
        };
    }
}

// Función para guardar datos en DynamoDB
async function saveToDynamoDB(item: any): Promise<void> {
    await dynamoDb.put({ TableName: "Citas", Item: item }).promise();
}

// Función para emitir eventos a EventBridge
async function emitEvent(detailType: string, detail: any): Promise<void> {
    await eventBridge.putEvents({
        Entries: [
            {
                Source: "citas-system",
                DetailType: detailType,
                Detail: JSON.stringify(detail),
            },
        ],
    }).promise();
}
</code>

Lógica para Chile:
typescript
Copiar código

<script>
 export async function processChile(event: any): Promise<any> {
    try {
        // Paso 1: Validar datos específicos para Chile
        const requestData = event.body;
        validateChile(requestData);

        // Paso 2: Transformar y guardar los datos en DynamoDB
        const cita = transformCita(requestData, "CL");
        await saveToDynamoDB(cita);

        // Paso 3: Emitir evento a EventBridge
        await emitEvent("CitaCreada", cita);

        // Responder con éxito
        return {
            statusCode: 201,
            body: JSON.stringify(cita),
        };
    } catch (error) {
        console.error("Error procesando la cita para Chile:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error interno del servidor" }),
        };
    }
}

// Función para validar datos específicos de Chile
function validateChile(data: any): void {
    // Implementar validaciones específicas para Chile
    if (!data.rut || !/^[0-9]+-[0-9kK]$/.test(data.rut)) {
        throw new Error("El RUT es inválido.");
    }
    if (!data.fecha || new Date(data.fecha).toString() === "Invalid Date") {
        throw new Error("La fecha proporcionada no es válida.");
    }
    // Agregar más validaciones según sea necesario
}

// Función para guardar datos en DynamoDB
async function saveToDynamoDB(item: any): Promise<void> {
    await dynamoDb.put({ TableName: "Citas", Item: item }).promise();
}

// Función para emitir eventos a EventBridge
async function emitEvent(detailType: string, detail: any): Promise<void> {
    await eventBridge.putEvents({
        Entries: [
            {
                Source: "citas-system",
                DetailType: detailType,
                Detail: JSON.stringify(detail),
            },
        ],
    }).promise();
}
</script>

En chile se maneja RUT

## 4. Escalabilidad y Rendimiento

**Capacidad de Crecimiento y Resiliencia**
Capacidad de Crecimiento:
DynamoDB con capacidad de lectura y escritura adaptable (modo On-Demand).
Lambda con escalado automático según la demanda.
EventBridge para desacoplar la gestión de eventos y su procesamiento.

Resiliencia:
Servicios Serverless (DynamoDB, Lambda, API Gateway) con redundancia nativa.
Replicación global de DynamoDB para cubrir múltiples regiones, si es necesario.

*Expansión a Nuevos Territorios:*

Podríamos incorporar un nuevo opción o módulo adicional para manjear lógica por ejemplo, processNewPais en Lambda.
Incluir reglas específicas en DynamoDB para gestionar los datos del nuevo territorio.



- Identificar posibles cuellos de botella y proponer soluciones
## 5. Seguridad y Cumplimiento
- Proponer medidas para asegurar la protección de datos sensibles
## 6. Monitoreo y Manejo de Errores
- Describir cómo se implementaría el monitoreo del sistema
- Proponer estrategias para el manejo de errores y reintentos
## 7. Código de Muestra
- Proporcionar el código en NodeJs con soporte para Typescript con la solución de
esta problemática.
## 8. Consideraciones Adicionales
- Discutir cómo se manejaría la latencia de respuesta al usuario

# Anexo
## Especificaciones adicionales del proyecto trabajado

El proyecto fue generado con la plantilla `aws-nodejs-typescript` basado en [Serverless framework](https://www.serverless.com/).
Se usó Visual Studio Code y AWS Toolkit

<img width="911" alt="image" src="https://github.com/user-attachments/assets/7c5523a2-2da7-424d-a73a-cd9e8b4fc53f">

más información técnica en https://www.serverless.com/framework/docs/providers/aws/


## Instalación y despliegue

> **Requerimientos**: NodeJS `lts/fermium (v.14.15.0)`. o [nvm](https://github.com/nvm-sh/nvm), ejecutar `nvm use` 

### Con NPM

- Ejecutar `npm i` 
- Ejecutar `npx sls deploy` para desplegar en la infraestructura AWS


La base de código del proyecto se encuentra principalmente dentro de la carpeta src. Esta carpeta está dividida en:

- `functions` - Contiene código base y configuración para sus funciones lambda
- `libs` - que contiene una base de código compartida entre sus lambdas

```
.
├── src
│   ├── lambda              # Carpeta de configuración y código fuente de Lambda
│   │   ├── http
│   │   │   ├── creatCitaMedica.ts     # Código fuente de Lambda `Hola`
│   │   │   ├── deleteCitaMedica.ts       # Configuración de Lambda `Hola` para Serverless
│   │   │   ├── getCitaMedica.ts      # Parámetro de entrada de Lambda `Hola`, si lo hay, para invocación local
│   │   │   └── imageUpload.ts      # Esquema JSON del evento de entrada de Lambda `Hola`
│   │   │
│   │   └── index.ts           # Importación/exportación de todas las configuraciones de Lambdas
│   │
│   └── libs                   # Código compartido de Lambda
│   |   └── apiGateway.ts      # Helpers específicos de API Gateway
│   |   └── handlerResolver.ts # Biblioteca compartida para resolver manejadores de Lambdas
│   |   └── lambda.ts          # Middleware de Lambda
│   |
│   └── models                 # Modelos del proyecto
│   └── repositories           # Patrón de Repositorio de acceso a datos  
│   └── services               # Servicio aplicando principios orientado a servicios.
├── package.json
├── serverless.ts              # Archivo de servicio de Serverless
├── tsconfig.json              # Configuración del compilador Typescript

```

### Otras librerías

- [json-schema-to-ts](https://github.com/ThomasAribart/json-schema-to-ts)

- [middy](https://github.com/middyjs/middy) 
- [@serverless/typescript](https://github.com/serverless/typescript) - Proporciona definiciones de TypeScript actualizadas para su archivo de servicio `serverless.ts`

