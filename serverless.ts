import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "citamedicas-serverless",
  frameworkVersion: "3",

  plugins: ["serverless-esbuild"],

  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "sa-east-1",
    profile: "serverlessUser",
    stage: "dev",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      CITAS_TABLE: "Citas-${self:provider.stage}",
    },

    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Scan",
          "s3:ListBucket",
          "s3:GetObject",
          "s3:PutObject",
        ],
        Resource: [
          { "Fn::GetAtt": ["CitasMedicasDynamoDBTable", "Arn"] },
          "arn:aws:s3:::serverless-s3-operations-bucket-gui",
        ],
      },
    ],
  },

  // Import the functions via paths
  functions: {
    // Create
    createCitaMedica: {
      name: "create-cita-medica",
      handler: "src/lambda/http/createCitaMedica.handler",
      events: [
        {
          http: {
            method: "POST",
            path: "citas-medicas",
          },
        },
      ],
    },

    // Read
    getCitaMedica: {
      name: "get-cita-medica",
      handler: "src/lambda/http/getCitaMedica.handler",
      events: [
        {
          http: {
            method: "GET",
            path: "citas-medicas/{id}",
          },
        },
      ],
    },

    // Update
    updateCitaMedica: {
      name: "update-cita-medica",
      handler: "src/lambda/http/updateCitaMedica.handler",
      events: [
        {
          http: {
            method: "PATCH",
            path: "citas-medicas/{id}",
          },
        },
      ],
    },

    // Delete
    deleteCitaMedica: {
      name: "delete-cita-medica",
      handler: "src/lambda/http/deleteCitaMedica.handler",
      events: [
        {
          http: {
            method: "DELETE",
            path: "citas-medicas/{id}",
          },
        },
      ],
    },

    // Image Upload (optional, retained for reference)
    imageUpload: {
      name: "image-upload",
      handler: "src/lambda/imageUpload.handler",
      events: [
        {
          http: {
            method: "PUT",
            path: "image-upload",
          },
        },
      ],
    },
  },

  package: { individually: true },

  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },

  resources: {
    Resources: {
      CitasMedicasDynamoDBTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:provider.environment.CITAS_MEDICAS_TABLE}",
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },

      S3OperationsBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: "serverless-s3-operations-bucket-gui",
          AccessControl: "Private",
          CorsConfiguration: {
            AllowedMethods: ["GET", "PUT", "POST"],
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;