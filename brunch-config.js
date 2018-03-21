module.exports = {
  files: {
    javascripts: {
      joinTo: 'app.js'
    },
  },
  modules: {
    autoRequire: {
      'app.js': ['main']
    }
  },
  plugins: {
    vue: {
      extractCSS: true,
      out: './public/components.css'
    }
  }  
}