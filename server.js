const express = require('express')
const app = express()
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const Joi = require('joi');
const session = require('express-session')
const Plan = require('./models/plan')

// > et <
//mongoose connection 
mongoose.connect('mongodb://localhost:27017/fdl-manage')
    .then(console.log('Connected to mongoDB '))
    .catch(error => console.log(error))



//moteur de template et middlewares
app.set('view engine', 'ejs')
const options = {
    dotfiles: 'ignore',
    extensions: ['htm', 'html'],
    index: false,
}
app.use(express.static('views', options))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(session({
    secret: 'defal_manage',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use(require('./middlewares/flash'))

//routes
app.get('/', function(req, res) {
    res.render('template');
});

app.get('/addPlan', function(req, res) {
    res.render('addPlan');
});


app.post('/addPlan', async function(req, res) {

    if (validatePlan(req.body).error) {
        req.flash('error', validatePlan(req.body).error.details[0].message)
        res.redirect('/addPlan')
    } else {
        const options = req.body.options
        await Plan.create({
            name: req.body.name,
            price: req.body.price,
            options: options.split(',')
        });

        req.flash('success', `Plan ${req.body.name} created successfully!!`)
        res.redirect('/addPlan')

    }
});


app.get('/seePlan', async function(req, res) {
    const plans = await Plan.find({});
    res.render('plans', { plans });
});


app.get('/editPlan/:id', async function(req, res) {
    if (!validateObjectId(req.params.id)) {
        res.status = 404
        res.send('Not found')
        return
    }
    const plan = await Plan.findById(req.params.id);
    res.render('editPlan', { plan });

});


app.post('/editPlan/:id', async function(req, res) {
    if (!validateObjectId(req.params.id)) {
        res.status = 404
        res.send('Not found')
        return
    }
    if (validatePlan(req.body).error) {
        req.flash('error', validatePlan(req.body).error.details[0].message)
        res.redirect('/editPlan/' + req.params.id)
        return
    } else {
        const options = req.body.options

        await Plan.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            price: req.body.price,
            options: options.split(',')
        })

        req.flash('success', `Plan ${req.body.name} updated successfully!!`)
        res.redirect('/seePlan')
    }

});

app.get('/deletePlan/:id', async function(req, res) {
    if (!validateObjectId(req.params.id)) {
        res.status = 404
        res.send('Not found')
        return
    }
    await Plan.findByIdAndRemove(req.params.id)
    res.redirect('/seePlan')
})

function validateObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id)
}

function validatePlan(plan) {
    const planSchema = Joi.object({
        name: Joi.string().alphanum().required(),
        price: Joi.number().required(),
        options: Joi.string().required()
    })

    return planSchema.validate(plan)
}


app.listen(8080)