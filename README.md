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

* **API Gateway**: Recibe las solicitudes de agendamiento desde el frontend. Los clientes (en este caso el sistema de agendamiento web) envían solicitudes de agendamiento a través de API Gateway. API Gateway recibe las solicitudes y las pasa a una función Lambda inicial que valida la entrada y estructura el evento de agendamiento. Luego envía un evento de tipo "agendamiento" a Amazon EventBridge, el evento contiene información relevante, como el país de origen, fecha y hora de agendamiento, y detalles específicos del usuario.
* **EventBridge** Gestiona la lógica de enrutamiento, enviando el evento de agendamiento a un Lambda específico de cada país según reglas de país.
> Por ejemplo:
> Para eventos de agendamiento de Perú, EventBridge envía el evento al Lambda processPeruAgendamiento.
> Para eventos de agendamiento de Chile, EventBridge lo envía al Lambda processPeruAgendamiento
 
* **Lambda**: Procesadores específicos por país que manejan la lógica particular de cada región, como validaciones de reglas de negocio, disponibilidad de citas, doctores o asistentes por paises,etc.
* **DynamoDB**: Estos son lambda específicos para cada país pueden escribir el resultado del agendamiento en una tabla DynamoDB, Para almacenar y gestionar los detalles de los agendamientos. DynamoDB es ideal para una baja latencia y alta escalabilidad, pero si se requiere SQL, Aurora Serverless puede ser una buena alternativa.  

## 2. Manejo de Datos
- Describir la estructura de datos para almacenar la información de
agendamientos
## 3. Procesamiento por País
- Detallar cómo se implementaría la lógica específica por país
- Describir cómo se podría agregar un nuevo país al sistema
## 4. Escalabilidad y Rendimiento
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



Este proyecto fue generado con la plantilla `aws-nodejs-typescript` basado en [Serverless framework](https://www.serverless.com/).

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

