import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: Joi.number().default(3000),

  // Database
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().default('postgres'),
  DB_PASSWORD: Joi.string().allow('').default('postgres'),
  DB_NAME: Joi.string().default('rental_db'),
  DB_SYNCHRONIZE: Joi.boolean().truthy('true').falsy('false').default(false),
  DB_LOGGING: Joi.boolean().truthy('true').falsy('false').default(false),

  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // Security
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),
  ENCRYPTION_KEY: Joi.string().length(32).optional().allow(''),

  // M-Pesa (optional at this stage)
  MPESA_CONSUMER_KEY: Joi.string().optional().allow(''),
  MPESA_CONSUMER_SECRET: Joi.string().optional().allow(''),
  MPESA_PASSKEY: Joi.string().optional().allow(''),
  MPESA_SHORTCODE: Joi.string().optional().allow(''),
  MPESA_CALLBACK_URL: Joi.string().uri().optional().allow(''),
  MPESA_INITIATOR_NAME: Joi.string().optional().allow(''),
  MPESA_SECURITY_CREDENTIAL: Joi.string().optional().allow(''),
});
