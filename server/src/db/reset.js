import fs from 'fs'
import { config } from '../config.js'
import { closeDatabase } from './database.js'

closeDatabase()
if (fs.existsSync(config.databasePath)) {
  fs.unlinkSync(config.databasePath)
  console.log('✓ Removed database:', config.databasePath)
}
console.log('Run: npm run db:seed')
