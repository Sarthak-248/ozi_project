const { defineConfig } = require('vite')

module.exports = async () => {
  const pluginImport = await import('@vitejs/plugin-react')
  const react = pluginImport.default || pluginImport
  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          secure: false
        }
      }
    }
  })
}
