import "reflect-metadata"
import { DataSource } from "typeorm"
import dotenv from "dotenv"
import path from "path"

dotenv.config()

const isProd = process.env.NODE_ENV === "production" || process.env.RENDER === "true"

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: !isProd, // Cuidado: em produção isso deve ser false para não apagar dados!
    logging: !isProd,
    
    // 🛠️ O SEGREDO ESTÁ AQUI: Só usa SSL se for ambiente de produção
    ssl: isProd ? { rejectUnauthorized: false } : false,
    
    entities: [path.join(__dirname, "../entities/*.{js,ts}")],
    migrations: [path.join(__dirname, "../migrations/*.{js,ts}")],
})

export default AppDataSource