
const express = require('express')
const app = express()
const morgan = require('morgan')
var bodyParser = require('body-parser')
const fs = require('fs')

app.use(express.json())
app.use(morgan('tiny'))
app.use(bodyParser.urlencoded({ extended: false })) 
app.use(bodyParser.json())

app.get('/',(req,res) => {
    res.send(`welcome to fs home page`)
})

app.get('/products',(req,res) => {
 let products = JSON.parse(fs.readFileSync("products.json").toString())
 let allProducts = products.map((p) => {
    return {
        id:p.id,
        title:p.title,
        price:p.price,
        description:p.description,
        category:p.category,
        image:p.image,
        'rating.rate':p.rating.rate,
        'rating.count': p.rating.count

    }
 })
 res.status(201).json({msg:'products fetched succesfully',allProducts})
})

app.get('/products/:id',(req,res) => {
    let products = JSON.parse(fs.readFileSync("products.json").toString())
    let singleProd = products.filter((p) => {
        return p.id == req.params.id
    })
    if(singleProd.length === 0){
        res.status(404).send(`resource not found`)
    }else{
        res.send(singleProd)
    }
})

app.post('/products', (req, res) => {
    try {
        let products = JSON.parse(fs.readFileSync('products.json').toString());
        const { title, price, description, category, image, rating } = req.body;

        // Detailed validation error messages
        if (!title) {
            return res.status(400).json({ msg: 'Please provide a title' });
        }
        if (!price) {
            return res.status(400).json({ msg: 'Please provide a price' });
        }
        if (!description) {
            return res.status(400).json({ msg: 'Please provide a description' });
        }
        if (!category) {
            return res.status(400).json({ msg: 'Please provide a category' });
        }
        if (!image) {
            return res.status(400).json({ msg: 'Please provide an image' });
        }
        if (!rating) {
            return res.status(400).json({ msg: 'Please provide a rating object with rate and count' });
        }
        if (rating.rate === undefined) {
            return res.status(400).json({ msg: 'Please provide a rating rate' });
        }
        if (rating.count === undefined) {
            return res.status(400).json({ msg: 'Please provide a rating count' });
        }

        let newProd = {
            id: products.length + 1,
            title: title,
            price: price,
            description: description,
            category: category,
            image: image,
            rating: {
                rate: rating.rate,
                count: rating.count
            }
        };

        products.push(newProd);
        fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
        res.status(201).json(newProd);
    } catch (err) {
        res.status(500).json({ msg: 'Error adding new product', error: err.message });
    }
});
app.put('/products/:id', (req, res) => {
    try {
        let products = JSON.parse(fs.readFileSync('products.json').toString());
        const { id } = req.params;
        const { title, price, description, category, image, rating } = req.body;

        let product = products.find(p => p.id == id);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        if (title) product.title = title;
        if (price) product.price = price;
        if (description) product.description = description;
        if (category) product.category = category;
        if (image) product.image = image;
        if (rating) {
            if (rating.rate !== undefined) product.rating.rate = rating.rate;
            if (rating.count !== undefined) product.rating.count = rating.count;
        }

        fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ msg: 'Error updating product', error: err.message });
    }
});

app.delete('/products/:id', (req, res) => {
    try {
        let products = JSON.parse(fs.readFileSync('products.json').toString());
        const { id } = req.params;

        let productIndex = products.findIndex(p => p.id == id);
        if (productIndex === -1) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // Remove the product from the array
        let deletedProduct = products.splice(productIndex, 1);

        // Write the updated products array back to the file
        fs.writeFileSync('products.json', JSON.stringify(products, null, 2));

        // Return the remaining products as response
        res.status(200).json({ msg: 'Product deleted successfully', remainingProducts: products });
    } catch (err) {
        res.status(500).json({ msg: 'Error deleting product', error: err.message });
    }
});

const port = 3500

app.listen(port,() => {
    console.log(`server is running on port ${port}`)
})