export default {
  dbURL: process.env.MONGO_URL || 'mongodb+srv://oshra:VlLHpBiUh57USRWt@cluster0.bfg8w.mongodb.net/bugs?retryWrites=true&w=majority',
  dbName : process.env.DB_NAME || 'bugs'
}
