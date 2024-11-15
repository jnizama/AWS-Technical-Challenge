# Reto técnico Sistema de Agendamiento de Citas Médicas

### Descripción del negocio
Una compañía de seguros necesita desarrollar un sistema de agendamiento de citas médicas
que funcione en múltiples países, inicialmente Perú y Chile

## Serverless - AWS - Node.js -  Typescript - persistencia DynamoDB - AWS API Gateway - WS Lambda

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

