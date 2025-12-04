import "dotenv/config";
import * as joi from "joi";

interface EnvVars {
    PORT: number;
    DB_HOST: string;
    DB_PORT: number;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    NODE_ENV: string;
    NATS_SERVERS: string;
}

const envsSchema = joi.object({
    PORT: joi.number().required(),
    DB_HOST: joi.string().required(),
    DB_PORT: joi.number().required(),
    DB_USER: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DB_NAME: joi.string().required(),
    NODE_ENV: joi.string().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
})
    .unknown(true);

const { error, value } = envsSchema.validate({
    ...process.env,
    NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value

export const envs = {
    port: envVars.PORT,
    dbhost: envVars.DB_HOST,
    dbport: envVars.DB_PORT,
    dbuser: envVars.DB_USER,
    dbpassword: envVars.DB_PASSWORD,
    dbname: envVars.DB_NAME,
    nodeEnv: envVars.NODE_ENV,
    natsServers: envVars.NATS_SERVERS,
}