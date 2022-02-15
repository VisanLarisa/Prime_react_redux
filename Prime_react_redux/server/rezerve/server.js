const express = require('express')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const cors = require('cors')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'sample.db',
  define: {
    timestamps: false
  }
})

const Book = sequelize.define('book', {
  title: Sequelize.STRING,
  content: Sequelize.TEXT,
  pageCount: Sequelize.INTEGER
})

const Chapter = sequelize.define('chapter', {
  title: Sequelize.STRING,
  content: Sequelize.TEXT
})

Book.hasMany(Chapter)

const app = express()
app.use(cors())
app.use(bodyParser.json())

//a fost nevoie sa definesc asta aici, pentru a crea baza de date in cazul in care nu o am deja (la prima rulare)
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

app.get('/books', async (req, res) => {
  try {
    const query = {}
    let pageSize = 2
    const allowedFilters = ['title', 'content']
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

    const records = await Book.findAll(query)
    const count = await Book.count()
    res.status(200).json({ records, count })
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.post('/books', async (req, res) => {
  try {
    if (req.query.bulk && req.query.bulk === 'on') {
      await Book.bulkCreate(req.body)
      res.status(201).json({ message: 'created' })
    } else {
      await Book.create(req.body)
      res.status(201).json({ message: 'created' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id)
    if (book) {
      res.status(200).json(book)
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})



app.put('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id)
    if (book) {
      await book.update(req.body, { fields: ['title', 'content', 'pageCount'] })
      res.status(202).json({ message: 'accepted' })
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.delete('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, { include: Chapter })
    if (book) {
      await book.destroy()
      res.status(202).json({ message: 'accepted' })
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})


app.get('/books/:bid/chapters', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.bid)
    if (book) {
      const chapters = await book.getChapters()

      res.status(200).json(chapters)
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.get('/books/:bid/chapters/:cid', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.bid)
    if (book) {
      const chapters = await book.getChapters({ where: { id: req.params.cid } })
      res.status(200).json(chapters.shift())
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.post('/books/:bid/chapters', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.bid)
    if (book) {
      const chapter = req.body
      chapter.bookId = book.id
      console.warn(chapter)
      await Chapter.create(chapter)
      res.status(201).json({ message: 'created' })
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.put('/books/:bid/chapters/:cid', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.bid)
    if (book) {
      const chapters = await book.getChapters({ where: { id: req.params.cid } })
      const chapter = chapters.shift()
      if (chapter) {
        await chapter.update(req.body)
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

app.delete('/books/:bid/chapters/:cid', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.bid)
    if (book) {
      const chapters = await book.getChapters({ where: { id: req.params.cid } })
      const chapter = chapters.shift()
      if (chapter) {
        await chapter.destroy(req.body)
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