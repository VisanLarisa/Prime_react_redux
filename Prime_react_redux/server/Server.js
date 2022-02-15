const express = require ('express')
const bodyParser = require ('body-parser')
const Sequelize = require ('sequelize')
const { DATE } = require('sequelize')
const Op=Sequelize.Op
const cors = require('cors')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'sample.db',
    define: {
      timestamps: false
    }
  })

const Article = sequelize.define('article', {
  title: Sequelize.STRING,
  abstract: Sequelize.STRING,
  date: Sequelize.DATE,   //DATEONLY
  pageCount: Sequelize.INTEGER
})

const Reference = sequelize.define('references', {
    title: Sequelize.STRING,
    date: Sequelize.DATE,
    authors: Sequelize.STRING,
})

Article.hasMany(Reference)

const app = express()
app.use(cors())
app.use(bodyParser.json())

// a fost nevoie sa definesc asta aici, pentru a crea baza de date in cazul in care nu o am deja (la prima rulare)
// sequelize.sync({force: true})   //forteaza 
// .then(()=>console.log('created'))
// .catch((error)=>console.log(error));

app.get('/sync', async (req, res) => {
    try {
      await sequelize.sync({ force: true })
      res.status(201).json({ message: 'created' })
    } catch (e) {
      console.warn(e)
      res.status(500).json({ message: 'server error' })
    }
  })

app.get('/articles', async (req, res) => {
  try {
    const query = {}
    let pageSize = 2
    const allowedFilters = ['title', 'abstract']
    const filterKeys = Object.keys(req.query).filter(e => allowedFilters.indexOf(e) !== -1)
    if (filterKeys.length > 0) {
      query.where = {}
      for (const key of filterKeys) {
        query.where[key] = {
          [Op.like]: `%${req.query[key]}%`
        }
      }
    }

    const sortField = req.query.sortField
    let sortOrder = 'ASC'
    if (req.query.sortOrder && req.query.sortOrder === '-1') {
      sortOrder = 'DESC'
    }

    if (req.query.pageSize) {
      pageSize = parseInt(req.query.pageSize)
    }

    if (sortField) {
      query.order = [[sortField, sortOrder]]
    }

    if (!isNaN(parseInt(req.query.page))) {
      query.limit = pageSize
      query.offset = pageSize * parseInt(req.query.page)
    }

    const records = await Article.findAll(query)
    const count = await Article.count()
    res.status(200).json({ records, count })
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.post('/articles', async (req, res) => {
    try {
      if(req.body.title.length > 5 && req.body.abstract.length >5 )
      {
        if (req.query.bulk && req.query.bulk === 'on') {
          await Article.bulkCreate(req.body)
          res.status(201).json({ message: 'created' })
        } else {
          await Article.create(req.body)
          res.status(201).json({ message: 'created' })
        }
      }
      else{
        res.status(418).json({message: 'too short article title or abstract'})
      }
    } catch (e) {
      console.warn(e)
      res.status(500).json({ message: 'server error' })
    }
  })

  app.get('/articles/:id', async (req, res) => {
    try {
      const article = await Article.findByPk(req.params.id)
      if (article) {
        res.status(200).json(article)
      } else {
        res.status(404).json({ message: 'not found' })
      }
    } catch (e) {
      console.warn(e)
      res.status(500).json({ message: 'server error' })
    }
  })

  app.put('/articles/:id', async (req, res) => {
    try {
      const article = await Article.findByPk(req.params.id)
      if (article) 
        { 
         if(req.body.title.length > 5 && req.body.abstract.length >5 )
          {
            await article.update(req.body, { fields: ['title', 'abstract', 'date', 'pageCount'] })
            res.status(202).json({ message: 'accepted' })
          } 
         else 
          res.status(418).json({message: 'too short title ot abstract'})
        }
        else {
        res.status(404).json({ message: 'not found' })
        }
    
    } catch (e) {
      console.warn(e)
      res.status(500).json({ message: 'server error' })
      }
  })

  app.delete('/articles/:id', async (req, res) => {
    try {
      const article = await Article.findByPk(req.params.id, { include: Reference })
      if (article) {
        await article.destroy()
        res.status(202).json({ message: 'accepted' })
      } else {
        res.status(404).json({ message: 'not found' })
      }
    } catch (e) {
      console.warn(e)
      res.status(500).json({ message: 'server error' })
    }
  })

  
app.get('/articles/:aid/references', async (req, res) => {
    try {
      const article = await Article.findByPk(req.params.aid)
      if (article) {
        const references = await article.getReferences()
  
        res.status(200).json(references)
      } else {
        res.status(404).json({ message: 'not found' })
      }
    } catch (e) {
      console.warn(e)
      res.status(500).json({ message: 'server error' })
    }
  })
  
  app.get('/articles/:aid/references/:rid', async (req, res) => {
    try {
      const article = await Article.findByPk(req.params.aid)
      if (article) {
        const references = await article.getReferences({ where: { id: req.params.rid } })
        res.status(200).json(references.shift())
      } else {
        res.status(404).json({ message: 'not found' })
      }
    } catch (e) {
      console.warn(e)
      res.status(500).json({ message: 'server error' })
    }
  })
  
  app.post('/articles/:aid/references', async (req, res) => {
    try {
      const article = await Article.findByPk(req.params.aid)
      if (article) {
        if(req.body.title.length > 5)
          {
            const reference = req.body
            reference.articleId = article.id
            console.warn(reference)
            await Reference.create(reference)
            res.status(201).json({ message: 'created' })
          }
          else{ console.log('too short!!!')
            res.status(418).json({message: 'too short reference title or author'})}
      } else {
        res.status(404).json({ message: 'not found' })
      }
    } catch (e) {
      console.warn(e)
      res.status(500).json({ message: 'server error' })
    }
  })
  
  app.put('/articles/:aid/references/:rid', async (req, res) => {
    try {
      const article = await Article.findByPk(req.params.aid)
      if (article) {
        const references = await article.getReferences({ where: { id: req.params.rid } })
        const reference = references.shift()
        if (reference) {
          if(req.body.title.length > 5 )
          {
            await reference.update(req.body)  // {, fields: ['', ...]}
            res.status(202).json({ message: 'accepted' })
          } 
          else res.status(418).json({message: 'too short reference title'})
        } else {
          res.status(404).json({ message: 'not found' })
        }
      } else {
        res.status(404).json({ message: 'not found' })
      }
    } catch (e) {
      console.warn(e)
      res.status(500).json({ message: 'server error' })
    }
  })
  
  app.delete('/articles/:aid/references/:rid', async (req, res) => {
    try {
      const article = await Article.findByPk(req.params.aid)
      if (article) {
        const references = await article.getReferences({ where: { id: req.params.rid } })
        const reference = references.shift()
        if (reference) {
          await reference.destroy(req.body)
          res.status(202).json({ message: 'accepted' })
        } else {
          res.status(404).json({ message: 'not found' })
        }
      } else {
        res.status(404).json({ message: 'not found' })
      }
    } catch (e) {
      console.warn(e)
      res.status(500).json({ message: 'server error' })
    }
  })
  
  app.listen(8080)