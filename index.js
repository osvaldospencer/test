const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const sqlite = require('sqlite')
const dbConnection = sqlite.open(path.resolve(__dirname,'banco.sqlite'), { Promise })

const port = process.env.PORT || 3000

app.set('views', path.join(__dirname, 'views'))

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname,'public')))
app.use(bodyParser.urlencoded({extended: true}))

app.get('/', async(req, res) => {
    //res.send('home')
    const db = await dbConnection
    const categoriasDb = await db.all('select * from categorias;')
    const vagas = await db.all('select * from vagas;')
    const categorias = categoriasDb.map(cat => {
        return {
            ...cat,
            vagas: vagas.filter( vaga => vaga.idcategoria === cat.id)
        }
    })
    //res.status(200).send({categorias})
    //res.send('home',{categorias})
    res.render('home', {categorias})
    
    
})


/*
app.get('/vaga', async (req, res) =>{
    //res.send('home')
    const db = await dbConnection
    const vag = db.get('select * from vagas', { Promise })
    console.log('vag-> ' + db.get('SELECT * FROM vagas', { Promise }))
    res.render('vaga', {vag: vag

    })
})
*/
app.get('/vaga/:id', async(req, res) =>{
   // console.log('id=' +req.params.id)
    const db = await dbConnection
    const vaga = await db.get('select * from vagas where id = ' +req.params.id)
    res.render('vaga',{
        vaga
    })
})
app.get('/admin', async(req, res) =>{
    res.render('admin/home')
})
app.get('/admin/vagas', async(req, res) => {
    const db = await dbConnection
    const vagas = await db.all('select * from vagas;')
    
    res.render('admin/vagas',{
        vagas
    })
})

app.get('/admin/vagas/delete/:id', async(req, res) => {
    const db = await dbConnection
    await db.run('delete from vagas where id = '+req.params.id)
    
    res.redirect('/admin/vagas')
})
app.get('/admin/vagas/nova-vaga', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias;') 
    console.log(categorias)   
    res.render('admin/nova-vaga', { categorias })
})

app.post('/admin/vagas/nova-vaga', async(req, res) => {
    const db = await dbConnection
    //await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);')
    //await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY,   idcategoria INTEGER, titulo TEXT, descricao TEXT);')
   
    const {titulo, descricao, categoria} = req.body
   
    await db.run(`insert into vagas (idcategoria, titulo, descricao) values(${categoria},'${ titulo }','${ descricao}');`)
    
    res.redirect('/admin/vagas')
})

app.get('/admin/vagas/editar/:id', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias;')
    const vagas = await db.get('select * from vagas where id = ' + req.params.id)

    console.log(categorias)   
    res.render('admin/editar-vaga', {categorias, vagas })
})

app.post('/admin/vagas/editar/:id', async(req, res) => {
    const db = await dbConnection
    //await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);')
    //await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY,   idcategoria INTEGER, titulo TEXT, descricao TEXT);')
   
    const {titulo, descricao, categoria} = req.body
    const { id } = req.params
   
    await db.run(`update vagas set categoria = ${categoria},,'${ titulo }','${ descricao}' where id = ${ id }`)
    
    res.redirect('/admin/vagas')
})



const init = async() => {
    const db = await dbConnection
    await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);')
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY,   idcategoria INTEGER, titulo TEXT, descricao TEXT);')
   
    //const categoria = 'Marketing team';
    //await db.run(`insert into categorias (categoria) values('${ categoria }');`)
    //const vaga = 'Marketing digital';    
    //const desc = 'procura'
    //await db.run(`insert into vagas (idcategoria, titulo, descricao) values(2,'${ vaga }','${ desc}');`)

}
init();

app.listen(port, (err) => {
    if(err){
        console.log('erro')
    }else{
        console.log('Servidor a rodar')
    }
})
